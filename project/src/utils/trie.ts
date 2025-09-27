import { TrieNode, TrieSearchOptions, SearchResult, Contact } from '../types';

export class Trie {
  private root: TrieNode;
  private contacts: Map<string, Contact>;

  constructor() {
    this.root = {
      isEndOfWord: false,
      children: new Map(),
      contacts: new Set(),
      frequency: 0,
    };
    this.contacts = new Map();
  }

  // Insert a contact into the Trie
  insert(contact: Contact): void {
    this.contacts.set(contact.id, contact);
    
    // Index all searchable fields
    const searchableText = this.getSearchableText(contact);
    searchableText.forEach(text => {
      this.insertWord(text.toLowerCase(), contact.id);
    });
  }

  // Remove a contact from the Trie
  delete(contactId: string): boolean {
    const contact = this.contacts.get(contactId);
    if (!contact) return false;

    const searchableText = this.getSearchableText(contact);
    searchableText.forEach(text => {
      this.deleteWord(text.toLowerCase(), contactId);
    });

    this.contacts.delete(contactId);
    return true;
  }

  // Search for contacts with prefix matching
  search(query: string, options: TrieSearchOptions = {}): SearchResult[] {
    const {
      maxResults = 50,
      fuzzyThreshold = 0.8,
      includePartialMatches = true
    } = options;

    if (!query.trim()) return [];

    const startTime = performance.now();
    const normalizedQuery = query.toLowerCase().trim();
    const results = new Map<string, SearchResult>();

    // Exact prefix matching
    const exactMatches = this.searchExact(normalizedQuery, maxResults);
    exactMatches.forEach(result => {
      results.set(result.contact.id, result);
    });

    // Partial word matching if enabled
    if (includePartialMatches && results.size < maxResults) {
      const partialMatches = this.searchPartial(normalizedQuery, maxResults - results.size);
      partialMatches.forEach(result => {
        if (!results.has(result.contact.id)) {
          results.set(result.contact.id, {
            ...result,
            score: result.score * 0.8 // Reduce score for partial matches
          });
        }
      });
    }

    // Fuzzy matching for remaining slots
    if (results.size < maxResults) {
      const fuzzyMatches = this.searchFuzzy(normalizedQuery, maxResults - results.size, fuzzyThreshold);
      fuzzyMatches.forEach(result => {
        if (!results.has(result.contact.id)) {
          results.set(result.contact.id, {
            ...result,
            score: result.score * 0.6 // Further reduce score for fuzzy matches
          });
        }
      });
    }

    const endTime = performance.now();
    console.log(`Search completed in ${endTime - startTime}ms`);

    return Array.from(results.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, maxResults);
  }

  // Get autocomplete suggestions
  getAutocompleteSuggestions(prefix: string, limit: number = 10): string[] {
    const normalizedPrefix = prefix.toLowerCase().trim();
    if (!normalizedPrefix) return [];

    const node = this.findNode(normalizedPrefix);
    if (!node) return [];

    const suggestions: string[] = [];
    this.collectWords(node, normalizedPrefix, suggestions, limit);
    
    return suggestions.slice(0, limit);
  }

  private insertWord(word: string, contactId: string): void {
    let node = this.root;
    
    for (const char of word) {
      if (!node.children.has(char)) {
        node.children.set(char, {
          isEndOfWord: false,
          children: new Map(),
          contacts: new Set(),
          frequency: 0,
        });
      }
      node = node.children.get(char)!;
      node.contacts.add(contactId);
    }
    
    node.isEndOfWord = true;
    node.frequency++;
  }

  private deleteWord(word: string, contactId: string): void {
    this.deleteHelper(this.root, word, 0, contactId);
  }

  private deleteHelper(
    node: TrieNode,
    word: string,
    index: number,
    contactId: string
  ): boolean {
    if (index === word.length) {
      if (!node.isEndOfWord) return false;
      
      node.contacts.delete(contactId);
      node.frequency = Math.max(0, node.frequency - 1);
      
      if (node.frequency === 0) {
        node.isEndOfWord = false;
      }
      
      return node.children.size === 0 && !node.isEndOfWord;
    }

    const char = word[index];
    const childNode = node.children.get(char);
    
    if (!childNode) return false;

    childNode.contacts.delete(contactId);
    const shouldDeleteChild = this.deleteHelper(childNode, word, index + 1, contactId);

    if (shouldDeleteChild) {
      node.children.delete(char);
    }

    return node.children.size === 0 && !node.isEndOfWord && node.contacts.size === 0;
  }

  private findNode(prefix: string): TrieNode | null {
    let node = this.root;
    
    for (const char of prefix) {
      if (!node.children.has(char)) {
        return null;
      }
      node = node.children.get(char)!;
    }
    
    return node;
  }

  private collectWords(
    node: TrieNode,
    currentWord: string,
    suggestions: string[],
    limit: number
  ): void {
    if (suggestions.length >= limit) return;
    
    if (node.isEndOfWord) {
      suggestions.push(currentWord);
    }
    
    for (const [char, childNode] of node.children) {
      this.collectWords(childNode, currentWord + char, suggestions, limit);
    }
  }

  private searchExact(query: string, limit: number): SearchResult[] {
    const node = this.findNode(query);
    if (!node) return [];

    const contactIds = Array.from(node.contacts);
    return contactIds.slice(0, limit).map(id => {
      const contact = this.contacts.get(id)!;
      return {
        contact,
        score: 1.0,
        matchedFields: this.getMatchedFields(contact, query)
      };
    });
  }

  private searchPartial(query: string, limit: number): SearchResult[] {
    const results: SearchResult[] = [];
    const words = query.split(/\s+/);
    
    for (const word of words) {
      if (word.length >= 2) {
        const node = this.findNode(word);
        if (node) {
          const contactIds = Array.from(node.contacts);
          contactIds.forEach(id => {
            const contact = this.contacts.get(id);
            if (contact && results.length < limit) {
              results.push({
                contact,
                score: 0.9,
                matchedFields: this.getMatchedFields(contact, word)
              });
            }
          });
        }
      }
    }
    
    return results.slice(0, limit);
  }

  private searchFuzzy(query: string, limit: number, threshold: number): SearchResult[] {
    const results: SearchResult[] = [];
    
    for (const [id, contact] of this.contacts) {
      if (results.length >= limit) break;
      
      const searchableText = this.getSearchableText(contact);
      let bestScore = 0;
      let matchedFields: string[] = [];
      
      for (const text of searchableText) {
        const similarity = this.calculateSimilarity(query, text.toLowerCase());
        if (similarity > bestScore && similarity >= threshold) {
          bestScore = similarity;
          matchedFields = this.getMatchedFields(contact, query);
        }
      }
      
      if (bestScore >= threshold) {
        results.push({
          contact,
          score: bestScore,
          matchedFields
        });
      }
    }
    
    return results.slice(0, limit);
  }

  private getSearchableText(contact: Contact): string[] {
    const text = [
      contact.firstName,
      contact.lastName,
      contact.email,
      contact.phone,
      contact.company || '',
      contact.jobTitle || '',
      ...contact.tags,
      contact.notes || ''
    ].filter(Boolean);
    
    return text;
  }

  private getMatchedFields(contact: Contact, query: string): string[] {
    const matched: string[] = [];
    const normalizedQuery = query.toLowerCase();
    
    if (contact.firstName.toLowerCase().includes(normalizedQuery)) matched.push('firstName');
    if (contact.lastName.toLowerCase().includes(normalizedQuery)) matched.push('lastName');
    if (contact.email.toLowerCase().includes(normalizedQuery)) matched.push('email');
    if (contact.phone.includes(normalizedQuery)) matched.push('phone');
    if (contact.company?.toLowerCase().includes(normalizedQuery)) matched.push('company');
    if (contact.jobTitle?.toLowerCase().includes(normalizedQuery)) matched.push('jobTitle');
    if (contact.tags.some(tag => tag.toLowerCase().includes(normalizedQuery))) matched.push('tags');
    if (contact.notes?.toLowerCase().includes(normalizedQuery)) matched.push('notes');
    
    return matched;
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    
    if (len1 === 0) return len2 === 0 ? 1 : 0;
    if (len2 === 0) return 0;
    
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));
    
    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;
    
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    
    const maxLen = Math.max(len1, len2);
    return (maxLen - matrix[len1][len2]) / maxLen;
  }

  // Get memory usage statistics
  getMemoryStats(): {
    nodeCount: number;
    contactCount: number;
    estimatedMemoryMB: number;
  } {
    let nodeCount = 0;
    
    const countNodes = (node: TrieNode): void => {
      nodeCount++;
      for (const child of node.children.values()) {
        countNodes(child);
      }
    };
    
    countNodes(this.root);
    
    // Rough estimation: each node ~200 bytes
    const estimatedMemoryMB = (nodeCount * 200 + this.contacts.size * 1000) / (1024 * 1024);
    
    return {
      nodeCount,
      contactCount: this.contacts.size,
      estimatedMemoryMB: Math.round(estimatedMemoryMB * 100) / 100
    };
  }
}