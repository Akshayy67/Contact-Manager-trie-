import React, { useState, useEffect } from 'react'
import { useContacts } from '../../stores/contactStore'
import { useUI } from '../../stores/uiStore'
import type { ContactFormData, Contact } from '../../types'
import Modal from '../ui/Modal'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { useToastContext } from '../providers/ToastProvider'

const ContactForm: React.FC = () => {
  const { contacts, addContact, updateContact } = useContacts()
  const { editingContactId, closeContactForm } = useUI()
  const { success, error } = useToastContext()

  const isEditing = !!editingContactId
  const editingContact = isEditing
    ? contacts.find((c: Contact) => c.id === editingContactId)
    : null

  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    tags: [],
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newTag, setNewTag] = useState('')

  // Initialize form data when editing or reset when adding new
  useEffect(() => {
    if (editingContact) {
      setFormData({
        name: editingContact.name,
        email: editingContact.email,
        phone: editingContact.phone,
        address: editingContact.address || '',
        notes: editingContact.notes || '',
        tags: [...editingContact.tags],
      })
    } else {
      // Reset form for new contact
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        tags: [],
      })
    }
  }, [editingContact, editingContactId])

  const handleInputChange = (
    field: keyof ContactFormData,
    value: string | string[]
  ) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }))
    }
    setNewTag('')
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }))
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      tags: [],
    })
    setNewTag('')
    closeContactForm()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.email || !formData.phone) {
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing && editingContactId) {
        await updateContact(editingContactId, formData)
        success(
          'Contact Updated',
          'Contact information has been successfully updated.'
        )
      } else {
        await addContact(formData)
        success('Contact Added', 'New contact has been successfully created.')
      }

      // Reset form and close
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        notes: '',
        tags: [],
      })
      setNewTag('')
      closeContactForm()
    } catch (err) {
      console.error('Failed to save contact:', err)
      error('Save Failed', 'Failed to save contact. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={true}
      onClose={handleClose}
      title={isEditing ? 'Edit Contact' : 'Add New Contact'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Name *"
          type="text"
          value={formData.name}
          onChange={e => handleInputChange('name', e.target.value)}
          placeholder="Enter full name"
          required
          fullWidth
        />

        <Input
          label="Email *"
          type="email"
          value={formData.email}
          onChange={e => handleInputChange('email', e.target.value)}
          placeholder="Enter email address"
          required
          fullWidth
        />

        <Input
          label="Phone *"
          type="tel"
          value={formData.phone}
          onChange={e => handleInputChange('phone', e.target.value)}
          placeholder="Enter phone number"
          required
          fullWidth
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            value={formData.address}
            onChange={e => handleInputChange('address', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter address (optional)"
            rows={2}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={e => handleInputChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
            placeholder="Enter notes (optional)"
            rows={3}
          />
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>

          {/* Tag input */}
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newTag}
              onChange={e => setNewTag(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddTag(newTag)
                }
              }}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              placeholder="Add a tag"
            />
            <Button
              type="button"
              onClick={() => handleAddTag(newTag)}
              variant="secondary"
              size="sm"
              disabled={!newTag.trim()}
            >
              Add
            </Button>
          </div>

          {/* Selected tags */}
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="ml-1 hover:text-blue-600"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={closeContactForm}
            variant="secondary"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Update Contact' : 'Add Contact'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default ContactForm
