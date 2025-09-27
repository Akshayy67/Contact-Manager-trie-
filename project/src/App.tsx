import React from 'react';
import { useContactStore } from './store/contactStore';
import ContactList from './components/ContactList';
import ContactForm from './components/ContactForm';
import Button from './components/ui/Button';
import Modal from './components/ui/Modal';
import { 
  Plus, 
  Users, 
  Star,
  Download,
  Upload,
  Trash2,
  Settings,
  BookOpen,
  BarChart3,
  Search,
  Calendar,
  Building,
  Tag
} from 'lucide-react';

function App() {
  const {
    contacts,
    searchResults,
    selectedContacts,
    favorites,
    stats,
    isLoading,
    error,
    searchQuery,
    loadContacts,
    addContact,
    updateContact,
    deleteContact,
    deleteMultipleContacts,
    toggleFavorite,
    clearSelection,
  } = useContactStore();

  const [showContactForm, setShowContactForm] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'all' | 'favorites' | 'learning' | 'analytics'>('all');

  React.useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAddContact = async (contactData) => {
    try {
      await addContact(contactData);
      setShowContactForm(false);
    } catch (error) {
      console.error('Failed to add contact:', error);
    }
  };

  const handleUpdateContact = async (contactData) => {
    if (editingContact) {
      try {
        await updateContact(editingContact.id, contactData);
        setEditingContact(null);
        setShowContactForm(false);
      } catch (error) {
        console.error('Failed to update contact:', error);
      }
    }
  };

  const handleDeleteSelected = async () => {
    try {
      await deleteMultipleContacts(Array.from(selectedContacts));
      clearSelection();
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Failed to delete contacts:', error);
    }
  };

  const displayContacts = searchQuery ? searchResults : contacts;
  const isSearchMode = searchQuery.length > 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => (
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
  );

  const LearningModule = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-8">
        <h2 className="text-2xl font-bold mb-2">Learn Trie Data Structures</h2>
        <p className="text-blue-100 mb-4">
          Discover how Trie data structures power lightning-fast search in this contact manager.
        </p>
        <Button variant="secondary" size="lg">
          Start Learning
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-2">What is a Trie?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Learn the fundamentals of Trie data structures and why they're perfect for search applications.
          </p>
          <Button variant="outline" size="sm">View Lesson</Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Implementation Guide</h3>
          <p className="text-gray-600 text-sm mb-4">
            Step-by-step guide to implementing a Trie from scratch with interactive examples.
          </p>
          <Button variant="outline" size="sm">Start Coding</Button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="font-semibold text-gray-900 mb-2">Performance Analysis</h3>
          <p className="text-gray-600 text-sm mb-4">
            Understand time and space complexity with visual comparisons to other data structures.
          </p>
          <Button variant="outline" size="sm">Analyze</Button>
        </div>
      </div>
    </div>
  );

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
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([tag, count]) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{tag}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            }
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Companies</h3>
          <div className="space-y-3">
            {Object.entries(stats.companiesCount)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 5)
              .map(([company, count]) => (
                <div key={company} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{company}</span>
                  <span className="text-sm font-medium text-gray-900">{count}</span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );

  if (isLoading && contacts.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading contacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-blue-600 rounded-lg">
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
            
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                icon={Upload}
                size="sm"
              >
                Import
              </Button>
              <Button
                variant="outline"
                icon={Download}
                size="sm"
              >
                Export
              </Button>
              <Button
                variant="primary"
                icon={Plus}
                onClick={() => setShowContactForm(true)}
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
          <div className="flex space-x-8">
            {[
              { id: 'all', label: 'All Contacts', icon: Users },
              { id: 'favorites', label: 'Favorites', icon: Star },
              { id: 'learning', label: 'Learn Tries', icon: BookOpen },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
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
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            <p>{error}</p>
          </div>
        )}

        {/* Bulk Actions Bar */}
        {selectedContacts.size > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <p className="text-blue-700">
                  {selectedContacts.size} contact{selectedContacts.size > 1 ? 's' : ''} selected
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  icon={Trash2}
                  onClick={() => setShowDeleteConfirm(true)}
                >
                  Delete Selected
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'all' && (
          <ContactList 
            contacts={displayContacts}
            isSearchResults={isSearchMode}
          />
        )}
        
        {activeTab === 'favorites' && (
          <ContactList 
            contacts={favorites}
            isSearchResults={false}
          />
        )}
        
        {activeTab === 'learning' && <LearningModule />}
        
        {activeTab === 'analytics' && <AnalyticsView />}
      </main>

      {/* Contact Form Modal */}
      <ContactForm
        isOpen={showContactForm}
        onClose={() => {
          setShowContactForm(false);
          setEditingContact(null);
        }}
        onSubmit={editingContact ? handleUpdateContact : handleAddContact}
        contact={editingContact}
        title={editingContact ? 'Edit Contact' : 'Add New Contact'}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Contacts"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete {selectedContacts.size} contact
            {selectedContacts.size > 1 ? 's' : ''}? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteSelected}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default App;