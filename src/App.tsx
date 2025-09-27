import React from 'react'
import { useContacts, ContactProvider } from './stores/contactStore'
import { useUI, UIProvider } from './stores/uiStore'
import ContactList from './components/contacts/ContactList'
import ContactForm from './components/contacts/ContactForm'
import ContactDetailsModal from './components/modals/ContactDetailsModal'
import ImportExportModal from './components/modals/ImportExportModal'
import LearningModule from './components/learning/LearningModule'
import Button from './components/ui/Button'
import VisualSearchEngine from './components/ui/VisualSearchEngine'
import LoadingScreen from './components/ui/LoadingScreen'
import { ToastProvider } from './components/providers/ToastProvider'
import {
  Plus,
  Users,
  Star,
  Download,
  Upload,
  BookOpen,
  BarChart3,
  Calendar,
  Building,
} from 'lucide-react'
import type { Contact } from './types'

function AppContent() {
  const {
    contacts,
    searchResults,
    searchQuery,
    isLoading,
    error,
    addSampleData,
  } = useContacts()

  const { showContactForm, openContactForm } = useUI()

  const [activeTab, setActiveTab] = React.useState<
    'all' | 'favorites' | 'learning' | 'analytics'
  >('all')
  const [selectedContact, setSelectedContact] = React.useState<Contact | null>(
    null
  )
  const [importExportModal, setImportExportModal] = React.useState<{
    isOpen: boolean
    mode: 'import' | 'export'
  }>({
    isOpen: false,
    mode: 'export',
  })

  // Determine which contacts to display based on search state
  const hasActiveSearch = searchQuery && searchQuery.trim().length > 0
  const displayContacts = hasActiveSearch ? searchResults : contacts

  // Debug logging
  React.useEffect(() => {
    console.log(
      'App: searchQuery:',
      searchQuery,
      'contacts:',
      contacts.length,
      'searchResults:',
      searchResults.length,
      'hasActiveSearch:',
      hasActiveSearch,
      'displayContacts:',
      displayContacts.length
    )
  }, [searchQuery, contacts, searchResults, hasActiveSearch, displayContacts])
  const favorites = contacts.filter((contact: Contact) =>
    contact.tags?.includes('favorite')
  )

  // Statistics
  const stats = React.useMemo(() => {
    const total = contacts.length
    const favoritesCount = favorites.length
    const recentlyAdded = contacts.filter((contact: Contact) => {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return new Date(contact.dateCreated) > weekAgo
    }).length

    const companiesCount: Record<string, number> = {}
    const tagsCount: Record<string, number> = {}

    contacts.forEach((contact: Contact) => {
      // Count companies (using address as company for now)
      if (contact.address) {
        const company = contact.address.split(',').pop()?.trim() || 'Unknown'
        companiesCount[company] = (companiesCount[company] || 0) + 1
      }

      // Count tags
      contact.tags?.forEach((tag: string) => {
        tagsCount[tag] = (tagsCount[tag] || 0) + 1
      })
    })

    return {
      total,
      favorites: favoritesCount,
      recentlyAdded,
      companiesCount,
      tagsCount,
    }
  }, [contacts, favorites])

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = 'blue',
  }: {
    icon: React.ComponentType<any>
    title: string
    value: number
    subtitle?: string
    color?: string
  }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        <div className="ml-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  )

  const LearningModuleView = () => <LearningModule contacts={displayContacts} />

  const AnalyticsView = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Users}
          title="Total Contacts"
          value={stats.total}
          color="blue"
        />
        <StatCard
          icon={Star}
          title="Favorites"
          value={stats.favorites}
          subtitle={`${((stats.favorites / stats.total) * 100 || 0).toFixed(1)}% of total`}
          color="yellow"
        />
        <StatCard
          icon={Calendar}
          title="Added This Week"
          value={stats.recentlyAdded}
          color="green"
        />
        <StatCard
          icon={Building}
          title="Companies"
          value={Object.keys(stats.companiesCount).length}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Tags</h3>
          <div className="space-y-3">
            {Object.entries(stats.tagsCount)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{tag}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Companies
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.companiesCount)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([company, count]) => (
                <div
                  key={company}
                  className="flex items-center justify-between"
                >
                  <span className="text-sm text-gray-600">{company}</span>
                  <span className="text-sm font-medium text-gray-900">
                    {count}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (isLoading && contacts.length === 0) {
    return <LoadingScreen />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-md">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Contact Manager
                  </h1>
                  <p className="text-sm text-gray-500">
                    Powered by Trie data structures
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Search Engine */}
            <div className="flex-1 max-w-2xl mx-8">
              <VisualSearchEngine className="w-full" />
            </div>

            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                icon={Upload}
                size="sm"
                onClick={() =>
                  setImportExportModal({ isOpen: true, mode: 'import' })
                }
              >
                Import
              </Button>
              <Button
                variant="outline"
                icon={Download}
                size="sm"
                onClick={() =>
                  setImportExportModal({ isOpen: true, mode: 'export' })
                }
              >
                Export
              </Button>
              {contacts.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addSampleData}
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  Add Sample Data
                </Button>
              )}
              {import.meta.env.DEV && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    const { getContactRepository } = await import(
                      './utils/storage'
                    )
                    const repo = getContactRepository()
                    if ('resetDatabase' in repo) {
                      await (repo as any).resetDatabase()
                      window.location.reload()
                    }
                  }}
                  className="text-red-600 border-red-300 hover:bg-red-50"
                >
                  Reset DB
                </Button>
              )}
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => openContactForm()}
              >
                Add Contact
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex space-x-8">
              {[
                { id: 'all', label: 'All Contacts', icon: Users },
                { id: 'favorites', label: 'Favorites', icon: Star },
                { id: 'learning', label: 'Learn Tries', icon: BookOpen },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                  {id === 'favorites' && favorites.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                      {favorites.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'all' && (
          <ContactList
            contacts={displayContacts}
            onContactClick={setSelectedContact}
          />
        )}

        {activeTab === 'favorites' && (
          <ContactList
            contacts={favorites}
            onContactClick={setSelectedContact}
          />
        )}

        {activeTab === 'learning' && <LearningModuleView />}

        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Modals */}
      {showContactForm && <ContactForm />}

      <ContactDetailsModal
        isOpen={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
      />

      <ImportExportModal
        isOpen={importExportModal.isOpen}
        onClose={() =>
          setImportExportModal({ ...importExportModal, isOpen: false })
        }
        mode={importExportModal.mode}
      />
    </div>
  )
}

function App() {
  return (
    <ContactProvider>
      <UIProvider>
        <ToastProvider>
          <AppContent />
        </ToastProvider>
      </UIProvider>
    </ContactProvider>
  )
}

export default App
