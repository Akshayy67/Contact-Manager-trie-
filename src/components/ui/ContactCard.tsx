import React from 'react'
import {
  Phone,
  MapPin,
  Star,
  Edit,
  Trash2,
  User,
  Calendar,
  Tag,
} from 'lucide-react'
import Button from './Button'
import Checkbox from './Checkbox'
import type { Contact } from '../../types'

interface ContactCardProps {
  contact: Contact
  isSelected?: boolean
  onSelect?: (contactId: string, checked: boolean) => void
  onEdit?: (contactId: string) => void
  onDelete?: (contactId: string) => void
  onToggleFavorite?: (contactId: string) => void
  onClick?: (contact: Contact) => void
  searchQuery?: string
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  onClick,
  searchQuery = '',
}) => {
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`,
      'gi'
    )
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-yellow-200 px-1 rounded text-yellow-900"
        >
          {part}
        </mark>
      ) : (
        part
      )
    )
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (date: string | Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on interactive elements
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input')) {
      return
    }
    onClick?.(contact)
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div
      className={`group relative bg-gradient-to-br from-white to-gray-50/50 border rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50'
          : 'border-gray-200 hover:border-indigo-300 hover:shadow-indigo-100/50'
      }`}
      onClick={handleCardClick}
    >
      {/* Gradient overlay for visual appeal */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-indigo-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="p-6">
        {/* Header with avatar and actions */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 flex-1">
            <Checkbox
              checked={isSelected}
              onChange={e => onSelect?.(contact.id, e.target.checked)}
              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
            />

            {/* Avatar */}
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg ring-2 ring-white group-hover:scale-105 transition-transform duration-200">
                {getInitials(contact.name)}
              </div>
              {contact.tags.includes('favorite') && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-md ring-2 ring-white">
                  <Star className="w-3 h-3 text-yellow-900 fill-current" />
                </div>
              )}
              {/* Online indicator */}
              <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">
                {highlightText(contact.name, searchQuery)}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {contact.email && highlightText(contact.email, searchQuery)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="ghost"
              size="sm"
              icon={Star}
              onClick={e =>
                handleActionClick(e, () => onToggleFavorite?.(contact.id))
              }
              className={`transition-colors ${
                contact.tags.includes('favorite')
                  ? 'text-yellow-500 hover:text-yellow-600'
                  : 'text-gray-400 hover:text-yellow-500'
              }`}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={e => handleActionClick(e, () => onEdit?.(contact.id))}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={e => handleActionClick(e, () => onDelete?.(contact.id))}
              className="text-gray-400 hover:text-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-3 mb-4">
          {contact.phone && (
            <div className="flex items-center text-sm text-gray-700 bg-gray-50/50 rounded-lg p-2 group-hover:bg-indigo-50/50 transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 flex-shrink-0">
                <Phone className="w-4 h-4 text-green-600" />
              </div>
              <span className="truncate font-medium">
                {highlightText(contact.phone, searchQuery)}
              </span>
            </div>
          )}

          {contact.address && (
            <div className="flex items-start text-sm text-gray-700 bg-gray-50/50 rounded-lg p-2 group-hover:bg-indigo-50/50 transition-colors duration-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <span className="truncate font-medium">
                {highlightText(contact.address, searchQuery)}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        {contact.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {contact.tags.slice(0, 3).map((tag, index) => {
                const colors = [
                  'from-purple-100 to-pink-100 text-purple-700 border-purple-200',
                  'from-blue-100 to-indigo-100 text-blue-700 border-blue-200',
                  'from-green-100 to-emerald-100 text-green-700 border-green-200',
                ]
                return (
                  <span
                    key={tag}
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gradient-to-r ${colors[index % colors.length]} rounded-full border shadow-sm hover:shadow-md transition-shadow duration-200`}
                  >
                    <Tag className="w-3 h-3 mr-1.5" />
                    {tag}
                  </span>
                )
              })}
              {contact.tags.length > 3 && (
                <span className="inline-flex items-center px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-full border border-gray-300 shadow-sm">
                  +{contact.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Notes Preview */}
        {contact.notes && (
          <div className="mb-4 p-3 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200 group-hover:from-amber-100 group-hover:to-yellow-100 transition-colors duration-200">
            <p className="text-xs text-amber-800 line-clamp-2 leading-relaxed font-medium">
              💭 {contact.notes}
            </p>
          </div>
        )}

        {/* Footer with metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gradient-to-r from-gray-100 to-gray-200">
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
            <Calendar className="w-3 h-3 mr-1 text-indigo-500" />
            <span className="font-medium">
              Added {formatDate(contact.dateCreated)}
            </span>
          </div>
          <div className="flex items-center bg-gray-100 rounded-full px-2 py-1">
            <User className="w-3 h-3 mr-1 text-purple-500" />
            <span className="font-medium">#{contact.id.slice(-6)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContactCard
