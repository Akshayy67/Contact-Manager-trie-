import type { Contact, SearchHistory } from '../types'

/**
 * Unified storage interface that abstracts away the underlying storage mechanism
 */
export interface ContactRepositoryInterface {
  create(
    contactData: Omit<Contact, 'id' | 'dateCreated' | 'dateModified'>
  ): Promise<Contact>
  getById(id: string): Promise<Contact | undefined>
  getAll(offset?: number, limit?: number): Promise<Contact[]>
  update(
    id: string,
    updates: Partial<Omit<Contact, 'id' | 'dateCreated'>>
  ): Promise<boolean>
  delete(id: string): Promise<boolean>
  deleteMany(ids: string[]): Promise<number>
  getByTag(tag: string): Promise<Contact[]>
  getByDateRange(startDate: Date, endDate: Date): Promise<Contact[]>
  searchByName(query: string): Promise<Contact[]>
  getCount(): Promise<number>
  getAllTags(): Promise<string[]>
  exportToJSON(): Promise<string>
  importFromJSON(
    jsonData: string
  ): Promise<{ imported: number; errors: string[] }>
  clear(): Promise<void>
}

export interface SearchHistoryRepositoryInterface {
  addSearch(query: string, resultsCount: number): Promise<void>
  getRecentSearches(limit?: number): Promise<SearchHistory[]>
  clearHistory(): Promise<void>
}

export interface SettingsRepositoryInterface {
  get<T>(key: string, defaultValue: T): Promise<T>
  set(key: string, value: any): Promise<void>
  delete(key: string): Promise<void>
  getAll(): Promise<Record<string, any>>
}

/**
 * Storage manager that provides a unified interface
 */
export class StorageManager {
  private static instance: StorageManager
  private contactRepo?: ContactRepositoryInterface
  private searchHistoryRepo?: SearchHistoryRepositoryInterface
  private settingsRepo?: SettingsRepositoryInterface
  private storageType?: 'indexeddb' | 'localstorage'
  private initialized = false

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager()
    }
    return StorageManager.instance
  }

  async initialize(): Promise<void> {
    if (this.initialized) return

    try {
      // Try IndexedDB first
      if ('indexedDB' in window) {
        const {
          contactRepository,
          searchHistoryRepository,
          settingsRepository,
        } = await import('./database')

        // Test IndexedDB by trying to open the database
        await contactRepository.getCount()

        this.contactRepo = contactRepository
        this.searchHistoryRepo = searchHistoryRepository
        this.settingsRepo = settingsRepository
        this.storageType = 'indexeddb'

        console.log('Using IndexedDB for storage')
      } else {
        throw new Error('IndexedDB not supported')
      }
    } catch (error) {
      console.warn('IndexedDB failed, falling back to localStorage:', error)

      // Fallback to localStorage
      const {
        LocalStorageContactRepository,
        LocalStorageSearchHistoryRepository,
        LocalStorageSettingsRepository,
      } = await import('./localStorage')

      this.contactRepo = new LocalStorageContactRepository()
      this.searchHistoryRepo = new LocalStorageSearchHistoryRepository()
      this.settingsRepo = new LocalStorageSettingsRepository()
      this.storageType = 'localstorage'

      console.log('Using localStorage for storage')
    }

    this.initialized = true
  }

  getContactRepository(): ContactRepositoryInterface {
    if (!this.contactRepo) {
      throw new Error('Storage not initialized. Call initialize() first.')
    }
    return this.contactRepo
  }

  getSearchHistoryRepository(): SearchHistoryRepositoryInterface {
    if (!this.searchHistoryRepo) {
      throw new Error('Storage not initialized. Call initialize() first.')
    }
    return this.searchHistoryRepo
  }

  getSettingsRepository(): SettingsRepositoryInterface {
    if (!this.settingsRepo) {
      throw new Error('Storage not initialized. Call initialize() first.')
    }
    return this.settingsRepo
  }

  getStorageType(): 'indexeddb' | 'localstorage' | undefined {
    return this.storageType
  }

  isInitialized(): boolean {
    return this.initialized
  }

  /**
   * Gets storage information and capacity
   */
  async getStorageInfo() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        type: this.storageType,
        quota: estimate.quota,
        usage: estimate.usage,
        available:
          estimate.quota && estimate.usage
            ? estimate.quota - estimate.usage
            : undefined,
        percentage:
          estimate.quota && estimate.usage
            ? (estimate.usage / estimate.quota) * 100
            : undefined,
      }
    }

    // Fallback for localStorage
    let localStorageSize = 0
    try {
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          localStorageSize += localStorage[key].length + key.length
        }
      }
    } catch (error) {
      // Handle cases where localStorage is not accessible
      localStorageSize = 0
    }

    const quota = 5 * 1024 * 1024 // 5MB typical localStorage limit
    return {
      type: this.storageType,
      quota,
      usage: localStorageSize,
      available: quota - localStorageSize,
      percentage: (localStorageSize / quota) * 100,
    }
  }

  /**
   * Migrates data between storage types if needed
   */
  async migrateData(
    fromType: 'indexeddb' | 'localstorage',
    toType: 'indexeddb' | 'localstorage'
  ): Promise<void> {
    if (fromType === toType) return

    console.log(`Migrating data from ${fromType} to ${toType}`)

    // Export data from source
    let contactsData: string
    let settingsData: Record<string, any>
    let searchHistoryData: SearchHistory[]

    if (fromType === 'indexeddb') {
      const { contactRepository, settingsRepository, searchHistoryRepository } =
        await import('./database')
      contactsData = await contactRepository.exportToJSON()
      settingsData = await settingsRepository.getAll()
      searchHistoryData = await searchHistoryRepository.getRecentSearches(100)
    } else {
      const {
        LocalStorageContactRepository,
        LocalStorageSettingsRepository,
        LocalStorageSearchHistoryRepository,
      } = await import('./localStorage')

      const contactRepo = new LocalStorageContactRepository()
      const settingsRepo = new LocalStorageSettingsRepository()
      const searchHistoryRepo = new LocalStorageSearchHistoryRepository()

      contactsData = await contactRepo.exportToJSON()
      settingsData = await settingsRepo.getAll()
      searchHistoryData = await searchHistoryRepo.getRecentSearches(100)
    }

    // Import data to destination
    if (toType === 'indexeddb') {
      const { contactRepository, settingsRepository, searchHistoryRepository } =
        await import('./database')

      // Clear existing data
      await contactRepository.clear()
      await settingsRepository.getAll().then(async settings => {
        for (const key of Object.keys(settings)) {
          await settingsRepository.delete(key)
        }
      })
      await searchHistoryRepository.clearHistory()

      // Import new data
      await contactRepository.importFromJSON(contactsData)
      for (const [key, value] of Object.entries(settingsData)) {
        await settingsRepository.set(key, value)
      }
      for (const search of searchHistoryData) {
        await searchHistoryRepository.addSearch(
          search.query,
          search.resultsCount
        )
      }
    } else {
      const {
        LocalStorageContactRepository,
        LocalStorageSettingsRepository,
        LocalStorageSearchHistoryRepository,
      } = await import('./localStorage')

      const contactRepo = new LocalStorageContactRepository()
      const settingsRepo = new LocalStorageSettingsRepository()
      const searchHistoryRepo = new LocalStorageSearchHistoryRepository()

      // Clear existing data
      await contactRepo.clear()
      const existingSettings = await settingsRepo.getAll()
      for (const key of Object.keys(existingSettings)) {
        await settingsRepo.delete(key)
      }
      await searchHistoryRepo.clearHistory()

      // Import new data
      await contactRepo.importFromJSON(contactsData)
      for (const [key, value] of Object.entries(settingsData)) {
        await settingsRepo.set(key, value)
      }
      for (const search of searchHistoryData) {
        await searchHistoryRepo.addSearch(search.query, search.resultsCount)
      }
    }

    console.log('Data migration completed')
  }

  /**
   * Clears all data from current storage
   */
  async clearAllData(): Promise<void> {
    if (!this.initialized) return

    await this.contactRepo?.clear()
    await this.searchHistoryRepo?.clearHistory()

    const settings = await this.settingsRepo?.getAll()
    if (settings) {
      for (const key of Object.keys(settings)) {
        await this.settingsRepo?.delete(key)
      }
    }
  }

  /**
   * Creates a backup of all data
   */
  async createBackup(): Promise<string> {
    if (!this.initialized) {
      throw new Error('Storage not initialized')
    }

    const contactsData = await this.contactRepo!.exportToJSON()
    const settingsData = await this.settingsRepo!.getAll()
    const searchHistoryData =
      await this.searchHistoryRepo!.getRecentSearches(100)

    const backup = {
      version: 1,
      timestamp: new Date().toISOString(),
      storageType: this.storageType,
      data: {
        contacts: JSON.parse(contactsData),
        settings: settingsData,
        searchHistory: searchHistoryData,
      },
    }

    return JSON.stringify(backup, null, 2)
  }

  /**
   * Restores data from a backup
   */
  async restoreFromBackup(
    backupData: string
  ): Promise<{ success: boolean; message: string }> {
    try {
      const backup = JSON.parse(backupData)

      if (!backup.data || !backup.data.contacts) {
        throw new Error('Invalid backup format')
      }

      // Clear existing data
      await this.clearAllData()

      // Restore contacts
      if (backup.data.contacts && Array.isArray(backup.data.contacts)) {
        await this.contactRepo!.importFromJSON(
          JSON.stringify(backup.data.contacts)
        )
      }

      // Restore settings
      if (backup.data.settings) {
        for (const [key, value] of Object.entries(backup.data.settings)) {
          await this.settingsRepo!.set(key, value)
        }
      }

      // Restore search history
      if (
        backup.data.searchHistory &&
        Array.isArray(backup.data.searchHistory)
      ) {
        for (const search of backup.data.searchHistory) {
          await this.searchHistoryRepo!.addSearch(
            search.query,
            search.resultsCount
          )
        }
      }

      return { success: true, message: 'Backup restored successfully' }
    } catch (error) {
      return { success: false, message: `Restore failed: ${error}` }
    }
  }
}

// Export singleton instance
export const storageManager = StorageManager.getInstance()

// Convenience functions for easy access
export const getContactRepository = () => storageManager.getContactRepository()
export const getSearchHistoryRepository = () =>
  storageManager.getSearchHistoryRepository()
export const getSettingsRepository = () =>
  storageManager.getSettingsRepository()
