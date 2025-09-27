import React, { createContext, useContext, ReactNode } from 'react'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { ViewMode, Theme, SortField, SortDirection } from '../types'

interface UIState {
  // Theme and appearance
  theme: Theme
  viewMode: ViewMode
  sidebarOpen: boolean

  // Sorting and filtering
  sortField: SortField
  sortDirection: SortDirection

  // Search and filters
  searchQuery: string
  activeFilters: {
    tags: string[]
    dateRange?: {
      start: Date
      end: Date
    }
  }

  // Modal and dialog states
  showContactForm: boolean
  showImportDialog: boolean
  showExportDialog: boolean
  showDeleteConfirmation: boolean
  showTrieLearning: boolean

  // Contact form state
  editingContactId: string | null

  // Actions
  setTheme: (theme: Theme) => void
  setViewMode: (mode: ViewMode) => void
  toggleSidebar: () => void
  setSorting: (field: SortField, direction?: SortDirection) => void
  setSearchQuery: (query: string) => void
  setTagFilter: (tags: string[]) => void
  setDateRangeFilter: (range?: { start: Date; end: Date }) => void
  clearFilters: () => void

  // Modal actions
  openContactForm: (contactId?: string) => void
  openEditContactForm: (contactId: string) => void
  closeContactForm: () => void
  openImportDialog: () => void
  closeImportDialog: () => void
  openExportDialog: () => void
  closeExportDialog: () => void
  openDeleteConfirmation: () => void
  closeDeleteConfirmation: () => void
  openTrieLearning: () => void
  closeTrieLearning: () => void
}

const useUIStore = create<UIState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        theme: 'system',
        viewMode: 'card',
        sidebarOpen: true,
        sortField: 'name',
        sortDirection: 'asc',
        searchQuery: '',
        activeFilters: {
          tags: [],
        },
        showContactForm: false,
        showImportDialog: false,
        showExportDialog: false,
        showDeleteConfirmation: false,
        showTrieLearning: false,
        editingContactId: null,

        // Theme and appearance actions
        setTheme: (theme: Theme) => {
          set({ theme })

          // Apply theme to document
          const root = document.documentElement
          if (theme === 'dark') {
            root.classList.add('dark')
          } else if (theme === 'light') {
            root.classList.remove('dark')
          } else {
            // System theme
            const prefersDark = window.matchMedia(
              '(prefers-color-scheme: dark)'
            ).matches
            if (prefersDark) {
              root.classList.add('dark')
            } else {
              root.classList.remove('dark')
            }
          }
        },

        setViewMode: (viewMode: ViewMode) => {
          set({ viewMode })
        },

        toggleSidebar: () => {
          set(state => ({ sidebarOpen: !state.sidebarOpen }))
        },

        // Sorting actions
        setSorting: (field: SortField, direction?: SortDirection) => {
          const { sortField, sortDirection } = get()

          // If clicking the same field, toggle direction
          if (field === sortField && !direction) {
            const newDirection = sortDirection === 'asc' ? 'desc' : 'asc'
            set({ sortDirection: newDirection })
          } else {
            set({
              sortField: field,
              sortDirection: direction || 'asc',
            })
          }
        },

        // Search and filter actions
        setSearchQuery: (searchQuery: string) => {
          set({ searchQuery })
        },

        setTagFilter: (tags: string[]) => {
          set(state => ({
            activeFilters: {
              ...state.activeFilters,
              tags,
            },
          }))
        },

        setDateRangeFilter: (dateRange?: { start: Date; end: Date }) => {
          set(state => ({
            activeFilters: {
              ...state.activeFilters,
              dateRange,
            },
          }))
        },

        clearFilters: () => {
          set({
            searchQuery: '',
            activeFilters: {
              tags: [],
            },
          })
        },

        // Modal actions
        openContactForm: (contactId?: string) => {
          set({
            showContactForm: true,
            editingContactId: contactId || null,
          })
        },

        openEditContactForm: (contactId: string) => {
          set({
            showContactForm: true,
            editingContactId: contactId,
          })
        },

        closeContactForm: () => {
          set({
            showContactForm: false,
            editingContactId: null,
          })
        },

        openImportDialog: () => {
          set({ showImportDialog: true })
        },

        closeImportDialog: () => {
          set({ showImportDialog: false })
        },

        openExportDialog: () => {
          set({ showExportDialog: true })
        },

        closeExportDialog: () => {
          set({ showExportDialog: false })
        },

        openDeleteConfirmation: () => {
          set({ showDeleteConfirmation: true })
        },

        closeDeleteConfirmation: () => {
          set({ showDeleteConfirmation: false })
        },

        openTrieLearning: () => {
          set({ showTrieLearning: true })
        },

        closeTrieLearning: () => {
          set({ showTrieLearning: false })
        },
      }),
      {
        name: 'ui-store',
        partialize: state => ({
          theme: state.theme,
          viewMode: state.viewMode,
          sidebarOpen: state.sidebarOpen,
          sortField: state.sortField,
          sortDirection: state.sortDirection,
        }),
      }
    ),
    {
      name: 'ui-store',
    }
  )
)

// Context for providing the store
const UIContext = createContext<ReturnType<typeof useUIStore> | null>(null)

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const store = useUIStore()

  // Initialize theme on mount
  React.useEffect(() => {
    store.setTheme(store.theme)

    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = () => {
      if (store.theme === 'system') {
        store.setTheme('system')
      }
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return <UIContext.Provider value={store}>{children}</UIContext.Provider>
}

export const useUI = (): UIState => {
  const context = useContext(UIContext)
  if (!context) {
    throw new Error('useUI must be used within a UIProvider')
  }
  return context as UIState
}
