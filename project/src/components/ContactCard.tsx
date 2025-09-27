import React from 'react';
import { Contact } from '../types';
import { Star, Mail, Phone, Building, MapPin, Calendar, CreditCard as Edit, Trash2, User } from 'lucide-react';
import Button from './ui/Button';

interface ContactCardProps {
  contact: Contact;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onEdit?: (contact: Contact) => void;
  onDelete?: (id: string) => void;
  onToggleFavorite?: (id: string) => void;
  viewMode?: 'grid' | 'list' | 'table';
  searchQuery?: string;
}

const ContactCard: React.FC<ContactCardProps> = ({
  contact,
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onToggleFavorite,
  viewMode = 'grid',
  searchQuery = '',
}) => {
  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onSelect) {
      onSelect(contact.id);
    }
  };

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };

  if (viewMode === 'table') {
    return (
      <tr 
        className={`hover:bg-gray-50 cursor-pointer transition-colors ${
          isSelected ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
        }`}
        onClick={handleCardClick}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(contact.id);
              }}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <div className="flex items-center">
              {contact.avatar ? (
                <img
                  className="h-10 w-10 rounded-full"
                  src={contact.avatar}
                  alt={`${contact.firstName} ${contact.lastName}`}
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
                  {getInitials(contact.firstName, contact.lastName)}
                </div>
              )}
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">
                  {highlightText(`${contact.firstName} ${contact.lastName}`, searchQuery)}
                </div>
                <div className="text-sm text-gray-500">
                  {highlightText(contact.email, searchQuery)}
                </div>
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {highlightText(contact.phone, searchQuery)}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {contact.company ? highlightText(contact.company, searchQuery) : '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {contact.jobTitle || '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-wrap gap-1">
            {contact.tags.slice(0, 2).map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {highlightText(tag, searchQuery)}
              </span>
            ))}
            {contact.tags.length > 2 && (
              <span className="text-xs text-gray-500">+{contact.tags.length - 2}</span>
            )}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              icon={Star}
              onClick={(e) => handleActionClick(e, () => onToggleFavorite?.(contact.id))}
              className={`${contact.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={(e) => handleActionClick(e, () => onEdit?.(contact))}
              className="text-gray-400 hover:text-blue-600"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={(e) => handleActionClick(e, () => onDelete?.(contact.id))}
              className="text-gray-400 hover:text-red-600"
            />
          </div>
        </td>
      </tr>
    );
  }

  if (viewMode === 'list') {
    return (
      <div
        className={`flex items-center p-4 border rounded-lg hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
        }`}
        onClick={handleCardClick}
      >
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect?.(contact.id);
          }}
          className="mr-4 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        
        {contact.avatar ? (
          <img
            className="h-12 w-12 rounded-full"
            src={contact.avatar}
            alt={`${contact.firstName} ${contact.lastName}`}
          />
        ) : (
          <div className="h-12 w-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium">
            {getInitials(contact.firstName, contact.lastName)}
          </div>
        )}
        
        <div className="ml-4 flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {highlightText(`${contact.firstName} ${contact.lastName}`, searchQuery)}
                {contact.isFavorite && (
                  <Star className="inline-block w-4 h-4 ml-2 text-yellow-500 fill-current" />
                )}
              </h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  {highlightText(contact.email, searchQuery)}
                </div>
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  {highlightText(contact.phone, searchQuery)}
                </div>
                {contact.company && (
                  <div className="flex items-center">
                    <Building className="w-4 h-4 mr-2" />
                    {highlightText(contact.company, searchQuery)}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                icon={Star}
                onClick={(e) => handleActionClick(e, () => onToggleFavorite?.(contact.id))}
                className={`${contact.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Edit}
                onClick={(e) => handleActionClick(e, () => onEdit?.(contact))}
                className="text-gray-400 hover:text-blue-600"
              />
              <Button
                variant="ghost"
                size="sm"
                icon={Trash2}
                onClick={(e) => handleActionClick(e, () => onDelete?.(contact.id))}
                className="text-gray-400 hover:text-red-600"
              />
            </div>
          </div>
          
          {contact.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {contact.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {highlightText(tag, searchQuery)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid view (default)
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border hover:shadow-lg transition-all duration-200 cursor-pointer ${
        isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      }`}
      onClick={handleCardClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                onSelect?.(contact.id);
              }}
              className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            
            {contact.avatar ? (
              <img
                className="h-12 w-12 rounded-full"
                src={contact.avatar}
                alt={`${contact.firstName} ${contact.lastName}`}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                {getInitials(contact.firstName, contact.lastName)}
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              icon={Star}
              onClick={(e) => handleActionClick(e, () => onToggleFavorite?.(contact.id))}
              className={`transition-colors ${
                contact.isFavorite 
                  ? 'text-yellow-500 hover:text-yellow-600' 
                  : 'text-gray-300 hover:text-yellow-500'
              }`}
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Edit}
              onClick={(e) => handleActionClick(e, () => onEdit?.(contact))}
              className="text-gray-400 hover:text-blue-600 transition-colors"
            />
            <Button
              variant="ghost"
              size="sm"
              icon={Trash2}
              onClick={(e) => handleActionClick(e, () => onDelete?.(contact.id))}
              className="text-gray-400 hover:text-red-600 transition-colors"
            />
          </div>
        </div>
        
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {highlightText(`${contact.firstName} ${contact.lastName}`, searchQuery)}
          </h3>
          {contact.jobTitle && (
            <p className="text-sm text-gray-600">
              {highlightText(contact.jobTitle, searchQuery)}
            </p>
          )}
          {contact.company && (
            <p className="text-sm text-gray-500">
              {highlightText(contact.company, searchQuery)}
            </p>
          )}
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">
              {highlightText(contact.email, searchQuery)}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
            <span>{highlightText(contact.phone, searchQuery)}</span>
          </div>
          {contact.address && (contact.address.city || contact.address.state) && (
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="truncate">
                {[contact.address.city, contact.address.state].filter(Boolean).join(', ')}
              </span>
            </div>
          )}
        </div>
        
        {contact.tags.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {contact.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {highlightText(tag, searchQuery)}
                </span>
              ))}
              {contact.tags.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                  +{contact.tags.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-1" />
            <span>Added {formatDate(contact.createdAt)}</span>
          </div>
          {contact.lastContacted && (
            <div>
              Last contact {formatDate(contact.lastContacted)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactCard;