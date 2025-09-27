import React, { useState, useEffect } from 'react'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { useContacts } from '../../stores/contactStore'
import { useToast } from '../../hooks/useToast'
import { Trash2, Edit } from 'lucide-react'
import type { Contact, ContactFormData } from '../../types'

interface ContactDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact | null
}

const ContactDetailsModal: React.FC<ContactDetailsModalProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const { updateContact, deleteContact } = useContacts()
  const { success: showSuccessToast, error: showErrorToast } = useToast()

  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: [],
  })

  // Initialize form data when contact changes
  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        address: contact.address || '',
        notes: contact.notes || '',
        tags: contact.tags || [],
      })
      setIsEditing(false)
    }
  }, [contact])

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string | string[]
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)
    handleInputChange('tags', tags)
  }

  const handleSave = async () => {
    if (!contact) return

    // Validation
    if (!formData.name.trim()) {
      showErrorToast('Validation Error', 'Name is required')
      return
    }

    if (!formData.email.trim()) {
      showErrorToast('Validation Error', 'Email is required')
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      showErrorToast('Validation Error', 'Please enter a valid email address')
      return
    }

    setIsSaving(true)

    try {
      await updateContact(contact.id, formData)
      setIsEditing(false)
      showSuccessToast(
        'Contact Updated',
        `${formData.name} has been updated successfully`
      )
    } catch (error) {
      showErrorToast(
        'Update Failed',
        error instanceof Error ? error.message : 'Failed to update contact'
      )
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!contact) return

    setIsDeleting(true)

    try {
      await deleteContact(contact.id)
      showSuccessToast(
        'Contact Deleted',
        `${contact.name} has been deleted successfully`
      )
      onClose()
    } catch (error) {
      showErrorToast(
        'Delete Failed',
        error instanceof Error ? error.message : 'Failed to delete contact'
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const handleCancel = () => {
    if (contact) {
      setFormData({
        name: contact.name,
        email: contact.email,
        phone: contact.phone || '',
        address: contact.address || '',
        notes: contact.notes || '',
        tags: contact.tags || [],
      })
    }
    setIsEditing(false)
  }

  if (!contact) return null

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Edit Contact' : 'Contact Details'}
      size="lg"
    >
      <div className="space-y-6">
        {/* Contact Information */}
        <div className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={e => handleInputChange('name', e.target.value)}
            disabled={!isEditing}
            required
          />

          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={e => handleInputChange('email', e.target.value)}
            disabled={!isEditing}
            required
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.phone}
            onChange={e => handleInputChange('phone', e.target.value)}
            disabled={!isEditing}
          />

          <Input
            label="Address"
            value={formData.address}
            onChange={e => handleInputChange('address', e.target.value)}
            disabled={!isEditing}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={e => handleInputChange('notes', e.target.value)}
              disabled={!isEditing}
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                !isEditing ? 'bg-gray-50 text-gray-600' : ''
              }`}
              placeholder="Add notes about this contact..."
            />
          </div>

          <Input
            label="Tags"
            value={formData.tags.join(', ')}
            onChange={e => handleTagsChange(e.target.value)}
            disabled={!isEditing}
            placeholder="work, friend, family (comma-separated)"
            helperText="Separate multiple tags with commas"
          />
        </div>

        {/* Contact Metadata */}
        {!isEditing && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Contact Information
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Created:</span>
                <br />
                {new Date(contact.dateCreated).toLocaleDateString()} at{' '}
                {new Date(contact.dateCreated).toLocaleTimeString()}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span>
                <br />
                {new Date(contact.dateModified).toLocaleDateString()} at{' '}
                {new Date(contact.dateModified).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between border-t pt-4">
          <div>
            {!isEditing && (
              <Button
                variant="danger"
                onClick={handleDelete}
                loading={isDeleting}
                icon={Trash2}
              >
                Delete Contact
              </Button>
            )}
          </div>

          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  loading={isSaving}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button variant="secondary" onClick={onClose}>
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => setIsEditing(true)}
                  icon={Edit}
                >
                  Edit Contact
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default ContactDetailsModal
