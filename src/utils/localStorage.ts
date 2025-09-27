import type { Contact, SearchHistory } from '@/types'

/**
 * localStorage fallback for browsers that don't support IndexedDB
 * Uses compression to maximize storage capacity
 */

const STORAGE_KEYS = {
  CONTACTS: 'contacts',
  SEARCH_HISTORY: 'searchHistory',
  SETTINGS: 'settings',
} as const

/**
 * Simple compression using JSON.stringify with reduced whitespace
 * In a production app, you might want to use a library like lz-string
 */
const compress = (data: any): string => {
  return JSON.stringify(data)
}

const decompress = (data: string): any => {
  try {
    return JSON.parse(data)
  } catch {
    return null
  }
}

/**
 * localStorage-based contact repository
 */
export class LocalStorageContactRepository {
  private getContacts(): Contact[] {
    const data = localStorage.getItem(STORAGE_KEYS.CONTACTS)
    if (!data) return []
    
    const contacts = decompress(data)
    return Array.isArray(contacts) ? contacts.map(this.deserializeContact) : []
  }

  private saveContacts(contacts: Contact[]): void {
    const serialized = contacts.map(this.serializeContact)
    localStorage.setItem(STORAGE_KEYS.CONTACTS, compress(serialized))
  }

  private serializeContact(contact: Contact): any {
    return {
      ...contact,
      dateCreated: contact.dateCreated.toISOString(),
      dateModified: contact.dateModified.toISOString(),
    }
  }

  private deserializeContact(data: any): Contact {
    return {
      ...data,
      dateCreated: new Date(data.dateCreated),
      dateModified: new Date(data.dateModified),
    }
  }

  async create(contactData: Omit<Contact, 'id' | 'dateCreated' | 'dateModified'>): Promise<Contact> {
    const contacts = this.getContacts()
    const id = crypto.randomUUID()
    const now = new Date()
    
    const contact: Contact = {
      ...contactData,
      id,
      dateCreated: now,
      dateModified: now,
    }

    contacts.push(contact)
    this.saveContacts(contacts)
    
    return contact
  }

  async getById(id: string): Promise<Contact | undefined> {
    const contacts = this.getContacts()
    return contacts.find(contact => contact.id === id)
  }

  async getAll(offset: number = 0, limit: number = 1000): Promise<Contact[]> {
    const contacts = this.getContacts()
    return contacts
      .sort((a, b) => a.name.localeCompare(b.name))
      .slice(offset, offset + limit)
  }

  async update(id: string, updates: Partial<Omit<Contact, 'id' | 'dateCreated'>>): Promise<boolean> {
    const contacts = this.getContacts()
    const index = contacts.findIndex(contact => contact.id === id)
    
    if (index === -1) return false
    
    contacts[index] = {
      ...contacts[index],
      ...updates,
      dateModified: new Date(),
    }
    
    this.saveContacts(contacts)
    return true
  }

  async delete(id: string): Promise<boolean> {
    const contacts = this.getContacts()
    const index = contacts.findIndex(contact => contact.id === id)
    
    if (index === -1) return false
    
    contacts.splice(index, 1)
    this.saveContacts(contacts)
    return true
  }

  async deleteMany(ids: string[]): Promise<number> {
    const contacts = this.getContacts()
    const initialLength = contacts.length
    
    const filteredContacts = contacts.filter(contact => !ids.includes(contact.id))
    this.saveContacts(filteredContacts)
    
    return initialLength - filteredContacts.length
  }

  async getByTag(tag: string): Promise<Contact[]> {
    const contacts = this.getContacts()
    return contacts.filter(contact => contact.tags.includes(tag))
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Contact[]> {
    const contacts = this.getContacts()
    return contacts.filter(contact => 
      contact.dateCreated >= startDate && contact.dateCreated <= endDate
    )
  }

  async searchByName(query: string): Promise<Contact[]> {
    const contacts = this.getContacts()
    const normalizedQuery = query.toLowerCase()
    
    return contacts.filter(contact =>
      contact.name.toLowerCase().includes(normalizedQuery) ||
      contact.email.toLowerCase().includes(normalizedQuery)
    )
  }

  async getCount(): Promise<number> {
    return this.getContacts().length
  }

  async getAllTags(): Promise<string[]> {
    const contacts = this.getContacts()
    const tagSet = new Set<string>()
    
    contacts.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag))
    })
    
    return Array.from(tagSet).sort()
  }

  async exportToJSON(): Promise<string> {
    const contacts = this.getContacts()
    return JSON.stringify(contacts, null, 2)
  }

  async importFromJSON(jsonData: string): Promise<{ imported: number; errors: string[] }> {
    try {
      const contacts: Contact[] = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0
      
      const existingContacts = this.getContacts()

      for (const contact of contacts) {
        try {
          if (!contact.name || !contact.email || !contact.phone) {
            errors.push(`Contact missing required fields: ${contact.name || 'Unknown'}`)
            continue
          }

          const newContact = {
            ...contact,
            id: crypto.randomUUID(),
            dateCreated: new Date(contact.dateCreated),
            dateModified: new Date(contact.dateModified),
          }

          existingContacts.push(newContact)
          imported++
        } catch (error) {
          errors.push(`Failed to import contact ${contact.name}: ${error}`)
        }
      }

      this.saveContacts(existingContacts)
      return { imported, errors }
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error}`)
    }
  }

  async clear(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.CONTACTS)
  }
}

/**
 * localStorage-based search history repository
 */
export class LocalStorageSearchHistoryRepository {
  private readonly MAX_HISTORY_ITEMS = 10

  private getHistory(): SearchHistory[] {
    const data = localStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY)
    if (!data) return []
    
    const history = decompress(data)
    return Array.isArray(history) 
      ? history.map(item => ({ ...item, timestamp: new Date(item.timestamp) }))
      : []
  }

  private saveHistory(history: SearchHistory[]): void {
    const serialized = history.map(item => ({
      ...item,
      timestamp: item.timestamp.toISOString(),
    }))
    localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, compress(serialized))
  }

  async addSearch(query: string, resultsCount: number): Promise<void> {
    const history = this.getHistory()
    
    const searchEntry: SearchHistory = {
      query: query.trim(),
      timestamp: new Date(),
      resultsCount,
    }

    history.unshift(searchEntry)

    // Keep only the latest MAX_HISTORY_ITEMS
    if (history.length > this.MAX_HISTORY_ITEMS) {
      history.splice(this.MAX_HISTORY_ITEMS)
    }

    this.saveHistory(history)
  }

  async getRecentSearches(limit: number = 10): Promise<SearchHistory[]> {
    const history = this.getHistory()
    return history
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit)
  }

  async clearHistory(): Promise<void> {
    localStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY)
  }
}

/**
 * localStorage-based settings repository
 */
export class LocalStorageSettingsRepository {
  private getSettings(): Record<string, any> {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS)
    return data ? decompress(data) || {} : {}
  }

  private saveSettings(settings: Record<string, any>): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, compress(settings))
  }

  async get<T>(key: string, defaultValue: T): Promise<T> {
    const settings = this.getSettings()
    return settings[key] !== undefined ? settings[key] : defaultValue
  }

  async set(key: string, value: any): Promise<void> {
    const settings = this.getSettings()
    settings[key] = value
    this.saveSettings(settings)
  }

  async delete(key: string): Promise<void> {
    const settings = this.getSettings()
    delete settings[key]
    this.saveSettings(settings)
  }

  async getAll(): Promise<Record<string, any>> {
    return this.getSettings()
  }
}

/**
 * Storage utility that automatically chooses between IndexedDB and localStorage
 */
export const createStorageRepositories = async () => {
  const isIndexedDBSupported = 'indexedDB' in window

  if (isIndexedDBSupported) {
    try {
      // Try to use IndexedDB
      const { contactRepository, searchHistoryRepository, settingsRepository } = await import('./database')
      return {
        contactRepository,
        searchHistoryRepository,
        settingsRepository,
        storageType: 'indexeddb' as const,
      }
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  return {
    contactRepository: new LocalStorageContactRepository(),
    searchHistoryRepository: new LocalStorageSearchHistoryRepository(),
    settingsRepository: new LocalStorageSettingsRepository(),
    storageType: 'localstorage' as const,
  }
}

/**
 * Utility to check available storage space
 */
export const getStorageInfo = async () => {
  if ('storage' in navigator && 'estimate' in navigator.storage) {
    const estimate = await navigator.storage.estimate()
    return {
      quota: estimate.quota,
      usage: estimate.usage,
      available: estimate.quota && estimate.usage ? estimate.quota - estimate.usage : undefined,
    }
  }

  // Fallback: estimate localStorage usage
  let localStorageSize = 0
  for (const key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      localStorageSize += localStorage[key].length + key.length
    }
  }

  return {
    quota: 5 * 1024 * 1024, // Typical localStorage limit (5MB)
    usage: localStorageSize,
    available: 5 * 1024 * 1024 - localStorageSize,
  }
}
