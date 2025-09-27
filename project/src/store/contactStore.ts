import { create } from 'zustand';
import { Contact, ContactStats, SearchResult, TrieSearchOptions } from '../types';
import { Trie } from '../utils/trie';
import { contactStorage } from '../utils/storage';

interface ContactState {
  // Data
  contacts: Contact[];
  searchResults: SearchResult[];
  selectedContacts: Set<string>;
  favorites: Contact[];
  stats: ContactStats;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  selectedTags: string[];
  sortBy: 'name' | 'email' | 'company' | 'createdAt' | 'lastContacted';
  sortOrder: 'asc' | 'desc';
  viewMode: 'grid' | 'list' | 'table';
  
  // Trie instance
  trie: Trie;
  
  // Actions
  loadContacts: () => Promise<void>;
  addContact: (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  deleteContact: (id: string) => Promise<void>;
  deleteMultipleContacts: (ids: string[]) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  search: (query: string, options?: TrieSearchOptions) => void;
  clearSearch: () => void;
  setSelectedContacts: (ids: string[]) => void;
  toggleContactSelection: (id: string) => void;
  clearSelection: () => void;
  setSelectedTags: (tags: string[]) => void;
  setSortBy: (sortBy: ContactState['sortBy']) => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  setViewMode: (mode: ContactState['viewMode']) => void;
  calculateStats: () => void;
  importContacts: (contacts: Contact[]) => Promise<void>;
  exportContacts: (format: 'csv' | 'json') => Promise<void>;
}

export const useContactStore = create<ContactState>((set, get) => ({
  // Initial state
  contacts: [],
  searchResults: [],
  selectedContacts: new Set(),
  favorites: [],
  stats: {
    total: 0,
    favorites: 0,
    recentlyAdded: 0,
    tagsCount: {},
    companiesCount: {},
  },
  isLoading: false,
  error: null,
  searchQuery: '',
  selectedTags: [],
  sortBy: 'name',
  sortOrder: 'asc',
  viewMode: 'grid',
  trie: new Trie(),

  // Actions
  loadContacts: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const contacts = await contactStorage.getAllContacts();
      const trie = new Trie();
      
      // Populate Trie with contacts
      contacts.forEach(contact => trie.insert(contact));
      
      const favorites = contacts.filter(c => c.isFavorite);
      
      set({ 
        contacts, 
        favorites,
        trie,
        isLoading: false 
      });
      
      get().calculateStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load contacts',
        isLoading: false 
      });
    }
  },

  addContact: async (contactData) => {
    set({ isLoading: true, error: null });
    
    try {
      const contact = await contactStorage.createContact(contactData);
      const { contacts, trie } = get();
      
      // Update Trie
      trie.insert(contact);
      
      const newContacts = [...contacts, contact];
      const newFavorites = contact.isFavorite 
        ? [...get().favorites, contact] 
        : get().favorites;
      
      set({ 
        contacts: newContacts,
        favorites: newFavorites,
        isLoading: false 
      });
      
      get().calculateStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to add contact',
        isLoading: false 
      });
    }
  },

  updateContact: async (id, updates) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedContact = await contactStorage.updateContact(id, updates);
      const { contacts, trie } = get();
      
      // Update Trie - remove old entry and add new one
      trie.delete(id);
      if (updatedContact) {
        trie.insert(updatedContact);
      }
      
      const newContacts = contacts.map(c => 
        c.id === id ? updatedContact || c : c
      );
      
      const newFavorites = newContacts.filter(c => c.isFavorite);
      
      set({ 
        contacts: newContacts,
        favorites: newFavorites,
        isLoading: false 
      });
      
      get().calculateStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update contact',
        isLoading: false 
      });
    }
  },

  deleteContact: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      await contactStorage.deleteContact(id);
      const { contacts, trie, selectedContacts } = get();
      
      // Update Trie
      trie.delete(id);
      
      const newContacts = contacts.filter(c => c.id !== id);
      const newFavorites = newContacts.filter(c => c.isFavorite);
      
      // Remove from selection if selected
      const newSelectedContacts = new Set(selectedContacts);
      newSelectedContacts.delete(id);
      
      set({ 
        contacts: newContacts,
        favorites: newFavorites,
        selectedContacts: newSelectedContacts,
        isLoading: false 
      });
      
      get().calculateStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete contact',
        isLoading: false 
      });
    }
  },

  deleteMultipleContacts: async (ids) => {
    set({ isLoading: true, error: null });
    
    try {
      await Promise.all(ids.map(id => contactStorage.deleteContact(id)));
      const { contacts, trie } = get();
      
      // Update Trie
      ids.forEach(id => trie.delete(id));
      
      const newContacts = contacts.filter(c => !ids.includes(c.id));
      const newFavorites = newContacts.filter(c => c.isFavorite);
      
      set({ 
        contacts: newContacts,
        favorites: newFavorites,
        selectedContacts: new Set(),
        isLoading: false 
      });
      
      get().calculateStats();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete contacts',
        isLoading: false 
      });
    }
  },

  toggleFavorite: async (id) => {
    const contact = get().contacts.find(c => c.id === id);
    if (contact) {
      await get().updateContact(id, { isFavorite: !contact.isFavorite });
    }
  },

  search: (query, options = {}) => {
    const { trie } = get();
    
    if (!query.trim()) {
      set({ searchResults: [], searchQuery: '' });
      return;
    }
    
    const results = trie.search(query, options);
    set({ searchResults: results, searchQuery: query });
  },

  clearSearch: () => {
    set({ searchResults: [], searchQuery: '' });
  },

  setSelectedContacts: (ids) => {
    set({ selectedContacts: new Set(ids) });
  },

  toggleContactSelection: (id) => {
    const { selectedContacts } = get();
    const newSelection = new Set(selectedContacts);
    
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    
    set({ selectedContacts: newSelection });
  },

  clearSelection: () => {
    set({ selectedContacts: new Set() });
  },

  setSelectedTags: (tags) => {
    set({ selectedTags: tags });
  },

  setSortBy: (sortBy) => {
    set({ sortBy });
  },

  setSortOrder: (sortOrder) => {
    set({ sortOrder });
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  calculateStats: () => {
    const { contacts } = get();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const stats: ContactStats = {
      total: contacts.length,
      favorites: contacts.filter(c => c.isFavorite).length,
      recentlyAdded: contacts.filter(c => c.createdAt > sevenDaysAgo).length,
      tagsCount: {},
      companiesCount: {},
    };
    
    // Count tags
    contacts.forEach(contact => {
      contact.tags.forEach(tag => {
        stats.tagsCount[tag] = (stats.tagsCount[tag] || 0) + 1;
      });
      
      if (contact.company) {
        stats.companiesCount[contact.company] = 
          (stats.companiesCount[contact.company] || 0) + 1;
      }
    });
    
    set({ stats });
  },

  importContacts: async (importedContacts) => {
    set({ isLoading: true, error: null });
    
    try {
      const { trie } = get();
      
      for (const contactData of importedContacts) {
        const contact = await contactStorage.createContact(contactData);
        trie.insert(contact);
      }
      
      await get().loadContacts();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to import contacts',
        isLoading: false 
      });
    }
  },

  exportContacts: async (format) => {
    const { contacts } = get();
    
    try {
      if (format === 'json') {
        const dataStr = JSON.stringify(contacts, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = `contacts_${new Date().toISOString().split('T')[0]}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      } else if (format === 'csv') {
        // CSV export will be handled by a dedicated utility
        console.log('CSV export not yet implemented');
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to export contacts'
      });
    }
  },
}));