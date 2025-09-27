import React, { useMemo, useState } from 'react'
import { useContacts } from '../../stores/contactStore'
import { useUI } from '../../stores/uiStore'
import EmptyState from '../ui/EmptyState'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import ContactCard from '../ui/ContactCard'
import ContactDetailsModal from '../modals/ContactDetailsModal'
import { useToastContext } from '../providers/ToastProvider'
import { Search } from 'lucide-react'
import type { Contact } from '../../types'

interface ContactListProps {
  contacts: Contact[]
  onContactClick?: (contact: Contact) => void
}

const ContactList: React.FC<ContactListProps> = ({
  contacts: propContacts,
  onContactClick,
}) => {
  const { deleteContact, deleteContacts, searchIndex } = useContacts()
  const { openContactForm, openEditContactForm, searchQuery } = useUI()
  const { success, error } = useToastContext()
  const [selectedContacts, setSelectedContacts] = useState<string[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  // const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  // const [showFilters, setShowFilters] = useState(false)

  // Use propContacts if provided, otherwise fall back to store contacts
  const contacts = propContacts

  // Filter contacts based on search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) {
      return contacts
    }

    try {
      const searchResults = searchIndex.search(searchQuery)
      return searchResults.map((result: any) => result.contact)
    } catch (error) {
      console.error('Search error:', error)
      // Fallback to simple text search
      return contacts.filter(
        contact =>
          contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          contact.phone.includes(searchQuery) ||
          (contact.address &&
            contact.address
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (contact.notes &&
            contact.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
          contact.tags.some(tag =>
            tag.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }
  }, [contacts, searchQuery, searchIndex])

  const handleEditContact = (contactId: string) => {
    openEditContactForm(contactId)
  }

  const handleDeleteContact = async (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      try {
        await deleteContact(contactId)
        success('Contact Deleted', 'Contact has been successfully deleted.')
      } catch (err) {
        console.error('Failed to delete contact:', err)
        error('Delete Failed', 'Failed to delete contact. Please try again.')
      }
    }
  }

  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContacts(prev => [...prev, contactId])
    } else {
      setSelectedContacts(prev => prev.filter(id => id !== contactId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContacts(
        filteredContacts.map((contact: Contact) => contact.id)
      )
    } else {
      setSelectedContacts([])
    }
  }

  const handleBulkDelete = async () => {
    if (selectedContacts.length === 0) return

    const confirmMessage = `Are you sure you want to delete ${selectedContacts.length} contact${selectedContacts.length > 1 ? 's' : ''}?`
    if (window.confirm(confirmMessage)) {
      setIsDeleting(true)
      try {
        const deletedCount = await deleteContacts(selectedContacts)
        setSelectedContacts([])
        success(
          'Contacts Deleted',
          `Successfully deleted ${deletedCount} contact${deletedCount > 1 ? 's' : ''}.`
        )
      } catch (err) {
        console.error('Failed to delete contacts:', err)
        error(
          'Bulk Delete Failed',
          'Failed to delete selected contacts. Please try again.'
        )
      } finally {
        setIsDeleting(false)
      }
    }
  }

  if (contacts.length === 0) {
    return (
      <EmptyState
        title="No contacts yet"
        description="Get started by adding your first contact"
        actionText="Add Contact"
        onAction={() => openContactForm()}
      />
    )
  }

  if (filteredContacts.length === 0 && searchQuery.trim()) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No contacts found
          </h3>
          <p className="text-gray-500 mb-4">
            No contacts match "{searchQuery}". Try adjusting your search terms.
          </p>
          <Button onClick={() => openContactForm()} variant="primary">
            Add New Contact
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      {/* Results header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-1">
              {searchQuery.trim() ? 'Search Results' : 'All Contacts'}
            </h2>
            <p className="text-sm text-gray-500">
              {filteredContacts.length} contact
              {filteredContacts.length !== 1 ? 's' : ''}
              {searchQuery.trim() && ` for "${searchQuery}"`}
              {selectedContacts.length > 0 &&
                ` • ${selectedContacts.length} selected`}
            </p>
          </div>

          {filteredContacts.length > 0 && (
            <div className="flex items-center gap-3">
              <Checkbox
                label="Select all"
                checked={selectedContacts.length === filteredContacts.length}
                indeterminate={
                  selectedContacts.length > 0 &&
                  selectedContacts.length < filteredContacts.length
                }
                onChange={e => handleSelectAll(e.target.checked)}
              />
              {selectedContacts.length > 0 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleBulkDelete}
                  loading={isDeleting}
                  disabled={isDeleting}
                >
                  Delete Selected ({selectedContacts.length})
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Contact list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredContacts.map((contact: Contact) => (
          <ContactCard
            key={contact.id}
            contact={contact}
            isSelected={selectedContacts.includes(contact.id)}
            onSelect={handleSelectContact}
            onEdit={handleEditContact}
            onDelete={handleDeleteContact}
            onClick={onContactClick || setSelectedContact}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      <ContactDetailsModal
        isOpen={selectedContact !== null}
        onClose={() => setSelectedContact(null)}
        contact={selectedContact}
      />
    </div>
  )
}

export default ContactList
