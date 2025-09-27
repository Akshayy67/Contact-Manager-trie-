import Dexie, { Table } from 'dexie'
import type { Contact, SearchHistory } from '../types'

/**
 * IndexedDB database schema using Dexie
 * Provides structured storage for contacts and search history
 */
export class ContactDatabase extends Dexie {
  contacts!: Table<Contact>
  searchHistory!: Table<SearchHistory & { id?: number }>
  settings!: Table<{ key: string; value: any }>

  constructor() {
    super('ContactManagerDB')

    this.version(1).stores({
      contacts: '&id, name, email, phone, dateCreated, dateModified, *tags',
      searchHistory: '++id, query, timestamp, resultsCount',
      settings: '&key, value',
    })

    // Note: Timestamps are handled manually in the repository methods
  }
}

// Create a singleton instance
export const db = new ContactDatabase()

/**
 * Contact repository for database operations
 */
export class ContactRepository {
  /**
   * Creates a new contact
   */
  async create(
    contactData: Omit<Contact, 'id' | 'dateCreated' | 'dateModified'>
  ): Promise<Contact> {
    const id = crypto.randomUUID()
    const now = new Date()

    const contact: Contact = {
      ...contactData,
      id,
      dateCreated: now,
      dateModified: now,
    }

    // Use put instead of add to ensure the ID is properly set
    await db.contacts.put(contact)
    return contact
  }

  /**
   * Gets a contact by ID
   */
  async getById(id: string): Promise<Contact | undefined> {
    return await db.contacts.get(id)
  }

  /**
   * Gets all contacts with optional pagination
   */
  async getAll(offset: number = 0, limit: number = 1000): Promise<Contact[]> {
    return await db.contacts
      .orderBy('name')
      .offset(offset)
      .limit(limit)
      .toArray()
  }

  /**
   * Updates an existing contact
   */
  async update(
    id: string,
    updates: Partial<Omit<Contact, 'id' | 'dateCreated'>>
  ): Promise<boolean> {
    const updatesWithTimestamp = {
      ...updates,
      dateModified: new Date(),
    }
    const result = await db.contacts.update(id, updatesWithTimestamp)
    return result === 1
  }

  /**
   * Deletes a contact by ID
   */
  async delete(id: string): Promise<boolean> {
    try {
      await db.contacts.delete(id)
      return true
    } catch (error) {
      console.error('Failed to delete contact:', error)
      return false
    }
  }

  /**
   * Deletes multiple contacts by IDs
   */
  async deleteMany(ids: string[]): Promise<number> {
    try {
      await db.contacts.bulkDelete(ids)
      return ids.length
    } catch (error) {
      console.error('Failed to delete contacts:', error)
      return 0
    }
  }

  /**
   * Gets contacts by tag
   */
  async getByTag(tag: string): Promise<Contact[]> {
    return await db.contacts.where('tags').anyOf([tag]).toArray()
  }

  /**
   * Gets contacts created within a date range
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Contact[]> {
    return await db.contacts
      .where('dateCreated')
      .between(startDate, endDate, true, true)
      .toArray()
  }

  /**
   * Searches contacts by name (basic text search)
   */
  async searchByName(query: string): Promise<Contact[]> {
    const normalizedQuery = query.toLowerCase()
    return await db.contacts
      .filter(
        contact =>
          contact.name.toLowerCase().includes(normalizedQuery) ||
          contact.email.toLowerCase().includes(normalizedQuery)
      )
      .toArray()
  }

  /**
   * Gets total count of contacts
   */
  async getCount(): Promise<number> {
    return await db.contacts.count()
  }

  /**
   * Gets all unique tags from contacts
   */
  async getAllTags(): Promise<string[]> {
    const contacts = await db.contacts.toArray()
    const tagSet = new Set<string>()

    contacts.forEach(contact => {
      contact.tags.forEach(tag => tagSet.add(tag))
    })

    return Array.from(tagSet).sort()
  }

  /**
   * Exports all contacts to JSON
   */
  async exportToJSON(): Promise<string> {
    const contacts = await db.contacts.toArray()
    return JSON.stringify(contacts, null, 2)
  }

  /**
   * Imports contacts from JSON
   */
  async importFromJSON(
    jsonData: string
  ): Promise<{ imported: number; errors: string[] }> {
    try {
      const contacts: Contact[] = JSON.parse(jsonData)
      const errors: string[] = []
      let imported = 0

      for (const contact of contacts) {
        try {
          // Ensure required fields exist
          if (!contact.name || !contact.email || !contact.phone) {
            errors.push(
              `Contact missing required fields: ${contact.name || 'Unknown'}`
            )
            continue
          }

          // Generate new ID to avoid conflicts
          const newContact = {
            ...contact,
            id: crypto.randomUUID(),
            dateCreated: new Date(contact.dateCreated),
            dateModified: new Date(contact.dateModified),
          }

          await db.contacts.add(newContact)
          imported++
        } catch (error) {
          errors.push(`Failed to import contact ${contact.name}: ${error}`)
        }
      }

      return { imported, errors }
    } catch (error) {
      throw new Error(`Invalid JSON format: ${error}`)
    }
  }

  /**
   * Clears all contacts (use with caution)
   */
  async clear(): Promise<void> {
    await db.contacts.clear()
  }
}

/**
 * Search history repository
 */
export class SearchHistoryRepository {
  private readonly MAX_HISTORY_ITEMS = 10

  /**
   * Adds a search query to history
   */
  async addSearch(query: string, resultsCount: number): Promise<void> {
    const searchEntry = {
      query: query.trim(),
      timestamp: new Date(),
      resultsCount,
    }

    await db.searchHistory.add(searchEntry)

    // Keep only the latest MAX_HISTORY_ITEMS
    const count = await db.searchHistory.count()
    if (count > this.MAX_HISTORY_ITEMS) {
      const oldestEntries = await db.searchHistory
        .orderBy('timestamp')
        .limit(count - this.MAX_HISTORY_ITEMS)
        .toArray()

      const idsToDelete = oldestEntries
        .map(entry => entry.id!)
        .filter(id => id !== undefined)
      await db.searchHistory.bulkDelete(idsToDelete)
    }
  }

  /**
   * Gets recent search history
   */
  async getRecentSearches(limit: number = 10): Promise<SearchHistory[]> {
    return await db.searchHistory
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray()
  }

  /**
   * Clears search history
   */
  async clearHistory(): Promise<void> {
    await db.searchHistory.clear()
  }
}

/**
 * Settings repository for app configuration
 */
export class SettingsRepository {
  /**
   * Gets a setting value
   */
  async get<T>(key: string, defaultValue: T): Promise<T> {
    const setting = await db.settings.get(key)
    return setting ? setting.value : defaultValue
  }

  /**
   * Sets a setting value
   */
  async set(key: string, value: any): Promise<void> {
    await db.settings.put({ key, value })
  }

  /**
   * Deletes a setting
   */
  async delete(key: string): Promise<void> {
    await db.settings.delete(key)
  }

  /**
   * Gets all settings
   */
  async getAll(): Promise<Record<string, any>> {
    const settings = await db.settings.toArray()
    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.value
        return acc
      },
      {} as Record<string, any>
    )
  }
}

// Create repository instances
export const contactRepository = new ContactRepository()
export const searchHistoryRepository = new SearchHistoryRepository()
export const settingsRepository = new SettingsRepository()

/**
 * Database utility functions
 */
export const dbUtils = {
  /**
   * Checks if IndexedDB is supported
   */
  isSupported(): boolean {
    return 'indexedDB' in window
  },

  /**
   * Gets database size estimation
   */
  async getStorageEstimate(): Promise<{ quota?: number; usage?: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate()
    }
    return {}
  },

  /**
   * Exports entire database
   */
  async exportDatabase(): Promise<string> {
    const contacts = await db.contacts.toArray()
    const searchHistory = await db.searchHistory.toArray()
    const settings = await db.settings.toArray()

    return JSON.stringify(
      {
        contacts,
        searchHistory,
        settings,
        exportDate: new Date().toISOString(),
        version: 1,
      },
      null,
      2
    )
  },

  /**
   * Imports entire database
   */
  async importDatabase(
    jsonData: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const data = JSON.parse(jsonData)

      if (!data.contacts || !Array.isArray(data.contacts)) {
        throw new Error('Invalid database format')
      }

      // Clear existing data
      await db.transaction(
        'rw',
        [db.contacts, db.searchHistory, db.settings],
        async () => {
          await db.contacts.clear()
          await db.searchHistory.clear()
          await db.settings.clear()

          // Import contacts
          for (const contact of data.contacts) {
            await db.contacts.add({
              ...contact,
              dateCreated: new Date(contact.dateCreated),
              dateModified: new Date(contact.dateModified),
            })
          }

          // Import search history if present
          if (data.searchHistory && Array.isArray(data.searchHistory)) {
            for (const entry of data.searchHistory) {
              await db.searchHistory.add({
                ...entry,
                timestamp: new Date(entry.timestamp),
              })
            }
          }

          // Import settings if present
          if (data.settings && Array.isArray(data.settings)) {
            for (const setting of data.settings) {
              await db.settings.add(setting)
            }
          }
        }
      )

      return { success: true, message: 'Database imported successfully' }
    } catch (error) {
      return { success: false, message: `Import failed: ${error}` }
    }
  },

  /**
   * Clears entire database
   */
  async clearDatabase(): Promise<void> {
    await db.transaction(
      'rw',
      [db.contacts, db.searchHistory, db.settings],
      async () => {
        await db.contacts.clear()
        await db.searchHistory.clear()
        await db.settings.clear()
      }
    )
  },

  /**
   * Reset the entire database (useful for debugging)
   */
  async resetDatabase(): Promise<void> {
    await db.delete()
    await db.open()
  },
}
