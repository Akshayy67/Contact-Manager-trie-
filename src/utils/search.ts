import type { Contact, SearchResult, SearchFilters } from '../types'
import { Trie } from './trie'

/**
 * Levenshtein distance algorithm for fuzzy matching
 * Time complexity: O(m * n) where m and n are string lengths
 */
export const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1)
    .fill(null)
    .map(() => Array(str1.length + 1).fill(null))

  for (let i = 0; i <= str1.length; i++) {
    matrix[0][i] = i
  }

  for (let j = 0; j <= str2.length; j++) {
    matrix[j][0] = j
  }

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      )
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Checks if two strings are similar within a given threshold
 */
export const isFuzzyMatch = (
  str1: string,
  str2: string,
  maxDistance: number = 2
): boolean => {
  const distance = levenshteinDistance(str1.toLowerCase(), str2.toLowerCase())
  return distance <= maxDistance
}

/**
 * Highlights matched substrings in text
 */
export const highlightMatches = (text: string, searchTerm: string): string => {
  if (!searchTerm.trim()) return text

  const regex = new RegExp(
    `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
    'gi'
  )
  return text.replace(regex, '<mark>$1</mark>')
}

/**
 * Calculates relevance score for a contact based on search term
 */
export const calculateRelevanceScore = (
  contact: Contact,
  searchTerm: string,
  matchedFields: string[]
): number => {
  let score = 0
  const normalizedSearchTerm = searchTerm.toLowerCase()

  // Field weights for relevance scoring
  const fieldWeights = {
    name: 10,
    email: 8,
    phone: 6,
    tags: 5,
    address: 3,
    notes: 2,
  }

  // Exact match bonus
  const exactMatchBonus = 20

  // Prefix match bonus
  const prefixMatchBonus = 10

  for (const field of matchedFields) {
    const fieldValue = contact[field as keyof Contact]
    if (typeof fieldValue === 'string') {
      const normalizedValue = fieldValue.toLowerCase()

      // Exact match
      if (normalizedValue === normalizedSearchTerm) {
        score +=
          fieldWeights[field as keyof typeof fieldWeights] + exactMatchBonus
      }
      // Prefix match
      else if (normalizedValue.startsWith(normalizedSearchTerm)) {
        score +=
          fieldWeights[field as keyof typeof fieldWeights] + prefixMatchBonus
      }
      // Contains match
      else if (normalizedValue.includes(normalizedSearchTerm)) {
        score += fieldWeights[field as keyof typeof fieldWeights]
      }
      // Fuzzy match
      else if (isFuzzyMatch(normalizedValue, normalizedSearchTerm)) {
        score += fieldWeights[field as keyof typeof fieldWeights] * 0.5
      }
    } else if (Array.isArray(fieldValue)) {
      // Handle tags array
      for (const tag of fieldValue) {
        const normalizedTag = tag.toLowerCase()
        if (normalizedTag === normalizedSearchTerm) {
          score += fieldWeights.tags + exactMatchBonus
        } else if (normalizedTag.startsWith(normalizedSearchTerm)) {
          score += fieldWeights.tags + prefixMatchBonus
        } else if (normalizedTag.includes(normalizedSearchTerm)) {
          score += fieldWeights.tags
        }
      }
    }
  }

  // Boost score for recently created/modified contacts
  const now = new Date()
  const daysSinceModified = Math.floor(
    (now.getTime() - contact.dateModified.getTime()) / (1000 * 60 * 60 * 24)
  )

  if (daysSinceModified <= 7) {
    score += 5 // Recent activity bonus
  }

  return score
}

/**
 * Extracts searchable terms from a contact
 */
export const extractSearchTerms = (contact: Contact): string[] => {
  const terms: string[] = []

  // Add name words
  terms.push(...contact.name.toLowerCase().split(/\s+/))

  // Add email parts
  const emailParts = contact.email.toLowerCase().split('@')
  terms.push(...emailParts[0].split(/[._-]/))
  if (emailParts[1]) {
    terms.push(...emailParts[1].split('.'))
  }

  // Add phone number (digits only)
  const phoneDigits = contact.phone.replace(/\D/g, '')
  if (phoneDigits.length >= 3) {
    // Add phone number in chunks for partial matching
    for (let i = 3; i <= phoneDigits.length; i++) {
      terms.push(phoneDigits.substring(0, i))
    }
  }

  // Add tags
  terms.push(...contact.tags.map(tag => tag.toLowerCase()))

  // Add address words if present
  if (contact.address) {
    terms.push(...contact.address.toLowerCase().split(/\s+/))
  }

  // Add notes words if present
  if (contact.notes) {
    terms.push(...contact.notes.toLowerCase().split(/\s+/))
  }

  // Filter out empty terms and duplicates
  return [...new Set(terms.filter(term => term.length > 0))]
}

/**
 * Builds a search index using Trie for fast prefix matching
 */
export class ContactSearchIndex {
  private trie: Trie<Contact>
  private contacts: Map<string, Contact>

  constructor() {
    this.trie = new Trie<Contact>()
    this.contacts = new Map()
  }

  /**
   * Adds a contact to the search index
   */
  addContact(contact: Contact): void {
    this.contacts.set(contact.id, contact)

    const searchTerms = extractSearchTerms(contact)
    for (const term of searchTerms) {
      this.trie.insert(term, contact)
    }
  }

  /**
   * Removes a contact from the search index
   */
  removeContact(contactId: string): void {
    const contact = this.contacts.get(contactId)
    if (!contact) return

    this.contacts.delete(contactId)

    // Note: For simplicity, we rebuild the trie when removing contacts
    // In a production system, you might want to implement a more efficient removal
    this.rebuildIndex()
  }

  /**
   * Updates a contact in the search index
   */
  updateContact(contact: Contact): void {
    this.removeContact(contact.id)
    this.addContact(contact)
  }

  /**
   * Searches for contacts using the Trie index
   */
  search(
    query: string,
    filters?: SearchFilters,
    limit: number = 50
  ): SearchResult[] {
    if (!query.trim()) {
      return this.getAllContacts(filters, limit)
    }

    const normalizedQuery = query.toLowerCase().trim()
    const trieResults = this.trie.getAllWithPrefix(normalizedQuery)

    // Collect unique contacts from Trie results
    const contactMap = new Map<
      string,
      { contact: Contact; matchedFields: Set<string> }
    >()

    for (const result of trieResults) {
      for (const contact of result.data) {
        if (!contactMap.has(contact.id)) {
          contactMap.set(contact.id, {
            contact,
            matchedFields: new Set(),
          })
        }

        // Determine which field matched
        const searchTerms = extractSearchTerms(contact)
        for (const term of searchTerms) {
          if (term.startsWith(normalizedQuery)) {
            // Determine field based on term content
            if (contact.name.toLowerCase().includes(term)) {
              contactMap.get(contact.id)!.matchedFields.add('name')
            }
            if (contact.email.toLowerCase().includes(term)) {
              contactMap.get(contact.id)!.matchedFields.add('email')
            }
            if (contact.phone.includes(term)) {
              contactMap.get(contact.id)!.matchedFields.add('phone')
            }
            if (contact.tags.some(tag => tag.toLowerCase().includes(term))) {
              contactMap.get(contact.id)!.matchedFields.add('tags')
            }
            if (contact.address?.toLowerCase().includes(term)) {
              contactMap.get(contact.id)!.matchedFields.add('address')
            }
            if (contact.notes?.toLowerCase().includes(term)) {
              contactMap.get(contact.id)!.matchedFields.add('notes')
            }
          }
        }
      }
    }

    // Convert to SearchResult array
    let results: SearchResult[] = Array.from(contactMap.values()).map(
      ({ contact, matchedFields }) => {
        const matchedFieldsArray = Array.from(matchedFields)
        const relevanceScore = calculateRelevanceScore(
          contact,
          normalizedQuery,
          matchedFieldsArray
        )

        const highlightedText: Record<string, string> = {}
        for (const field of matchedFieldsArray) {
          const fieldValue = contact[field as keyof Contact]
          if (typeof fieldValue === 'string') {
            highlightedText[field] = highlightMatches(fieldValue, query)
          }
        }

        return {
          contact,
          relevanceScore,
          matchedFields: matchedFieldsArray,
          highlightedText,
        }
      }
    )

    // Apply filters
    if (filters) {
      results = this.applyFilters(results, filters)
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return results.slice(0, limit)
  }

  /**
   * Gets all contacts with optional filters
   */
  private getAllContacts(
    filters?: SearchFilters,
    limit: number = 50
  ): SearchResult[] {
    let contacts = Array.from(this.contacts.values())

    if (filters) {
      contacts = contacts.filter(contact =>
        this.matchesFilters(contact, filters)
      )
    }

    return contacts.slice(0, limit).map(contact => ({
      contact,
      relevanceScore: 0,
      matchedFields: [],
      highlightedText: {},
    }))
  }

  /**
   * Gets the underlying Trie for visualization
   */
  getTrie(): Trie<Contact> {
    return this.trie
  }

  /**
   * Gets visualization data for the current search
   */
  getVisualizationData(searchTerm?: string) {
    return this.trie.getVisualizationData(searchTerm)
  }

  /**
   * Gets search statistics
   */
  getSearchStatistics(query: string) {
    return this.trie.getSearchStatistics(query)
  }

  /**
   * Debug method to check index contents
   */
  getIndexInfo(): { contactCount: number; trieSize: number } {
    return {
      contactCount: this.contacts.size,
      trieSize: this.trie.size,
    }
  }

  /**
   * Applies search filters to results
   */
  private applyFilters(
    results: SearchResult[],
    filters: SearchFilters
  ): SearchResult[] {
    return results.filter(result =>
      this.matchesFilters(result.contact, filters)
    )
  }

  /**
   * Checks if a contact matches the given filters
   */
  private matchesFilters(contact: Contact, filters: SearchFilters): boolean {
    // Tag filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag =>
        contact.tags.some(
          contactTag => contactTag.toLowerCase() === filterTag.toLowerCase()
        )
      )
      if (!hasMatchingTag) return false
    }

    // Date range filter
    if (filters.dateRange) {
      const contactDate = contact.dateCreated
      if (
        contactDate < filters.dateRange.start ||
        contactDate > filters.dateRange.end
      ) {
        return false
      }
    }

    // Field-specific filter
    if (filters.fields && filters.fields.length > 0) {
      // This would be used for advanced search where user specifies which fields to search
      // Implementation depends on specific requirements
    }

    return true
  }

  /**
   * Rebuilds the entire search index
   */
  private rebuildIndex(): void {
    this.trie.clear()

    for (const contact of this.contacts.values()) {
      const searchTerms = extractSearchTerms(contact)
      for (const term of searchTerms) {
        this.trie.insert(term, contact)
      }
    }
  }

  /**
   * Gets performance metrics from the underlying Trie
   */
  getPerformanceMetrics() {
    return this.trie.getPerformanceMetrics()
  }

  /**
   * Gets the total number of indexed contacts
   */
  getContactCount(): number {
    return this.contacts.size
  }

  /**
   * Clears the entire search index
   */
  clear(): void {
    this.trie.clear()
    this.contacts.clear()
  }

  /**
   * Exports the search index for persistence
   */
  export(): string {
    return JSON.stringify({
      trie: this.trie.toJSON(),
      contacts: Array.from(this.contacts.entries()),
    })
  }

  /**
   * Imports a previously exported search index
   */
  static import(data: string): ContactSearchIndex {
    const parsed = JSON.parse(data)
    const index = new ContactSearchIndex()

    index.trie = Trie.fromJSON(parsed.trie)
    index.contacts = new Map(parsed.contacts)

    return index
  }
}
