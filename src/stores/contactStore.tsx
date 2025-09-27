import React, { createContext, useContext, ReactNode } from 'react'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Contact, ContactFormData } from '../types'
import { getContactRepository, storageManager } from '../utils/storage'
import { ContactSearchIndex } from '../utils/search'

interface ContactState {
  contacts: Contact[]
  searchResults: Contact[]
  searchQuery: string
  selectedContacts: string[]
  isLoading: boolean
  error: string | null
  searchIndex: ContactSearchIndex

  // Actions
  loadContacts: () => Promise<void>
  addContact: (contactData: ContactFormData) => Promise<Contact>
  updateContact: (
    id: string,
    updates: Partial<ContactFormData>
  ) => Promise<boolean>
  deleteContact: (id: string) => Promise<boolean>
  deleteContacts: (ids: string[]) => Promise<number>
  selectContact: (id: string) => void
  selectContacts: (ids: string[]) => void
  deselectContact: (id: string) => void
  deselectAllContacts: () => void
  clearError: () => void
  refreshContacts: () => Promise<void>
  addSampleData: () => Promise<void>
  search: (query: string) => void
}

const useContactStore = create<ContactState>()(
  devtools(
    (set, get) => ({
      contacts: [],
      searchResults: [],
      searchQuery: '',
      selectedContacts: [],
      isLoading: false,
      error: null,
      searchIndex: new ContactSearchIndex(),

      loadContacts: async () => {
        set({ isLoading: true, error: null })
        try {
          const repository = getContactRepository()
          const contacts = await repository.getAll()

          // Build search index
          const searchIndex = new ContactSearchIndex()
          console.log(
            'ContactStore: rebuilding search index with',
            contacts.length,
            'contacts'
          )
          contacts.forEach(contact => {
            console.log('ContactStore: adding contact to index:', contact.name)
            searchIndex.addContact(contact)
          })

          set({ contacts, searchIndex, isLoading: false })
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to load contacts',
            isLoading: false,
          })
        }
      },

      addContact: async (contactData: ContactFormData) => {
        set({ isLoading: true, error: null })
        try {
          console.log('Adding contact:', contactData)
          const repository = getContactRepository()
          const contact = await repository.create(contactData)
          console.log('Contact created:', contact)

          const { contacts, searchIndex } = get()
          const updatedContacts = [...contacts, contact]
          console.log(
            'ContactStore: adding new contact to search index:',
            contact.name
          )
          searchIndex.addContact(contact)
          console.log(
            'ContactStore: contact added to search index, total contacts:',
            updatedContacts.length
          )

          set({ contacts: updatedContacts, isLoading: false })
          return contact
        } catch (error) {
          console.error('Error adding contact:', error)
          set({
            error:
              error instanceof Error ? error.message : 'Failed to add contact',
            isLoading: false,
          })
          throw error
        }
      },

      updateContact: async (id: string, updates: Partial<ContactFormData>) => {
        set({ isLoading: true, error: null })
        try {
          const repository = getContactRepository()
          const success = await repository.update(id, updates)

          if (success) {
            const { contacts, searchIndex } = get()
            const updatedContacts = contacts.map(contact =>
              contact.id === id
                ? { ...contact, ...updates, dateModified: new Date() }
                : contact
            )

            // Update search index
            const updatedContact = updatedContacts.find(c => c.id === id)
            if (updatedContact) {
              searchIndex.updateContact(updatedContact)
            }

            set({ contacts: updatedContacts, isLoading: false })
          }

          return success
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to update contact',
            isLoading: false,
          })
          return false
        }
      },

      deleteContact: async (id: string) => {
        set({ isLoading: true, error: null })
        try {
          const repository = getContactRepository()
          const success = await repository.delete(id)

          if (success) {
            const { contacts, searchIndex, selectedContacts } = get()
            const updatedContacts = contacts.filter(
              contact => contact.id !== id
            )
            const updatedSelected = selectedContacts.filter(
              selectedId => selectedId !== id
            )

            searchIndex.removeContact(id)

            set({
              contacts: updatedContacts,
              selectedContacts: updatedSelected,
              isLoading: false,
            })
          }

          return success
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete contact',
            isLoading: false,
          })
          return false
        }
      },

      deleteContacts: async (ids: string[]) => {
        set({ isLoading: true, error: null })
        try {
          const repository = getContactRepository()
          const deletedCount = await repository.deleteMany(ids)

          const { contacts, searchIndex } = get()
          const updatedContacts = contacts.filter(
            contact => !ids.includes(contact.id)
          )

          // Update search index
          ids.forEach(id => searchIndex.removeContact(id))

          set({
            contacts: updatedContacts,
            selectedContacts: [],
            isLoading: false,
          })

          return deletedCount
        } catch (error) {
          set({
            error:
              error instanceof Error
                ? error.message
                : 'Failed to delete contacts',
            isLoading: false,
          })
          return 0
        }
      },

      selectContact: (id: string) => {
        const { selectedContacts } = get()
        if (!selectedContacts.includes(id)) {
          set({ selectedContacts: [...selectedContacts, id] })
        }
      },

      selectContacts: (ids: string[]) => {
        set({ selectedContacts: ids })
      },

      deselectContact: (id: string) => {
        const { selectedContacts } = get()
        set({
          selectedContacts: selectedContacts.filter(
            selectedId => selectedId !== id
          ),
        })
      },

      deselectAllContacts: () => {
        set({ selectedContacts: [] })
      },

      clearError: () => {
        set({ error: null })
      },

      refreshContacts: async () => {
        await get().loadContacts()
      },

      addSampleData: async () => {
        const sampleContacts: ContactFormData[] = [
          {
            name: 'John Doe',
            email: 'john.doe@example.com',
            phone: '+1 (555) 123-4567',
            address: '123 Main St, New York, NY 10001',
            notes:
              'Software engineer at TechCorp. Interested in React and TypeScript.',
            tags: ['work', 'developer', 'friend'],
          },
          {
            name: 'Jane Smith',
            email: 'jane.smith@company.com',
            phone: '+1 (555) 987-6543',
            address: '456 Oak Ave, San Francisco, CA 94102',
            notes:
              'Product manager with 5+ years experience. Loves hiking and photography.',
            tags: ['work', 'manager', 'outdoor'],
          },
          {
            name: 'Mike Johnson',
            email: 'mike.j@email.com',
            phone: '+1 (555) 456-7890',
            address: '789 Pine St, Seattle, WA 98101',
            notes: 'Freelance designer. Specializes in UI/UX and branding.',
            tags: ['freelance', 'designer', 'creative'],
          },
          {
            name: 'Sarah Wilson',
            email: 'sarah.wilson@startup.io',
            phone: '+1 (555) 321-0987',
            address: '321 Elm St, Austin, TX 73301',
            notes: 'Startup founder. Building the next big thing in fintech.',
            tags: ['entrepreneur', 'fintech', 'startup'],
          },
          {
            name: 'David Brown',
            email: 'david.brown@university.edu',
            phone: '+1 (555) 654-3210',
            address: '654 Maple Dr, Boston, MA 02101',
            notes:
              'Computer Science professor. Research focus on algorithms and data structures.',
            tags: ['academic', 'professor', 'algorithms'],
          },
        ]

        for (const contactData of sampleContacts) {
          await get().addContact(contactData)
        }
      },

      search: (query: string) => {
        console.log('ContactStore: search called with query:', query)
        const { searchIndex } = get()

        // Debug: Check search index info
        const indexInfo = searchIndex.getIndexInfo()
        console.log('ContactStore: search index info:', indexInfo)

        // Always update the search query
        set({ searchQuery: query })

        if (!query.trim()) {
          console.log('ContactStore: empty query, clearing search results')
          set({ searchResults: [], searchQuery: '' })
          return
        }

        const results = searchIndex.search(query.trim())
        console.log(
          'ContactStore: search results from index:',
          results.length,
          'results'
        )
        const contacts = results.map(result => result.contact)
        console.log(
          'ContactStore: extracted contacts:',
          contacts.length,
          'contacts'
        )
        set({ searchResults: contacts, searchQuery: query.trim() })
      },
    }),
    {
      name: 'contact-store',
    }
  )
)

// Context for providing the store
const ContactContext = createContext<ReturnType<typeof useContactStore> | null>(
  null
)

export const ContactProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const store = useContactStore()
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Initialize storage and load contacts on mount
  React.useEffect(() => {
    const initializeApp = async () => {
      try {
        await storageManager.initialize()
        await store.loadContacts()
        setIsInitialized(true)
      } catch (error) {
        console.error('Failed to initialize storage:', error)
        setIsInitialized(true) // Still render the app even if storage fails
      }
    }

    initializeApp()
  }, [])

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Initializing Contact Manager...</p>
        </div>
      </div>
    )
  }

  return (
    <ContactContext.Provider value={store}>{children}</ContactContext.Provider>
  )
}

export const useContacts = (): ContactState => {
  const context = useContext(ContactContext)
  if (!context) {
    throw new Error('useContacts must be used within a ContactProvider')
  }
  return context as ContactState
}
