import React from 'react';
import { Contact, SearchResult } from '../types';
import { useContactStore } from '../store/contactStore';
import ContactCard from './ContactCard';
import { LayoutGrid, List, Table, Search, Filter, Import as SortAsc, Dessert as SortDesc, Users, Star, Eye, EyeOff } from 'lucide-react';
import Button from './ui/Button';
import SearchInput from './ui/SearchInput';

interface ContactListProps {
  contacts: Contact[] | SearchResult[];
  isSearchResults?: boolean;
}

const ContactList: React.FC<ContactListProps> = ({
  contacts,
  isSearchResults = false,
}) => {
  const {
    selectedContacts,
    viewMode,
    sortBy,
    sortOrder,
    searchQuery,
    selectedTags,
    trie,
    toggleContactSelection,
    setViewMode,
    setSortBy,
    setSortOrder,
    search,
    clearSearch,
    setSelectedTags,
  } = useContactStore();

  const [localSearchQuery, setLocalSearchQuery] = React.useState(searchQuery);
  const [showFilters, setShowFilters] = React.useState(false);
  const [suggestions, setSuggestions] = React.useState<string[]>([]);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearchQuery.trim() !== searchQuery) {
        if (localSearchQuery.trim()) {
          search(localSearchQuery);
        } else {
          clearSearch();
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localSearchQuery, search, clearSearch, searchQuery]);

  // Update suggestions based on input
  React.useEffect(() => {
    if (localSearchQuery.length > 0) {
      const newSuggestions = trie.getAutocompleteSuggestions(localSearchQuery, 5);
      setSuggestions(newSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [localSearchQuery, trie]);

  const handleSearchChange = (value: string) => {
    setLocalSearchQuery(value);
  };

  const handleSearchClear = () => {
    setLocalSearchQuery('');
    clearSearch();
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setLocalSearchQuery(suggestion);
    search(suggestion);
  };

  const sortContacts = (contactsToSort: Contact[] | SearchResult[]) => {
    return [...contactsToSort].sort((a, b) => {
      const contactA = 'contact' in a ? a.contact : a;
      const contactB = 'contact' in b ? b.contact : b;
      
      let valueA: any;
      let valueB: any;
      
      switch (sortBy) {
        case 'name':
          valueA = `${contactA.firstName} ${contactA.lastName}`.toLowerCase();
          valueB = `${contactB.firstName} ${contactB.lastName}`.toLowerCase();
          break;
        case 'email':
          valueA = contactA.email.toLowerCase();
          valueB = contactB.email.toLowerCase();
          break;
        case 'company':
          valueA = (contactA.company || '').toLowerCase();
          valueB = (contactB.company || '').toLowerCase();
          break;
        case 'createdAt':
          valueA = contactA.createdAt;
          valueB = contactB.createdAt;
          break;
        case 'lastContacted':
          valueA = contactA.lastContacted || new Date(0);
          valueB = contactB.lastContacted || new Date(0);
          break;
        default:
          return 0;
      }
      
      if (valueA < valueB) return sortOrder === 'asc' ? -1 : 1;
      if (valueA > valueB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filterContacts = (contactsToFilter: Contact[] | SearchResult[]) => {
    if (selectedTags.length === 0) return contactsToFilter;
    
    return contactsToFilter.filter(item => {
      const contact = 'contact' in item ? item.contact : item;
      return selectedTags.some(tag => contact.tags.includes(tag));
    });
  };

  const processedContacts = React.useMemo(() => {
    let processed = contacts;
    processed = filterContacts(processed);
    processed = sortContacts(processed);
    return processed;
  }, [contacts, selectedTags, sortBy, sortOrder]);

  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach(item => {
      const contact = 'contact' in item ? item.contact : item;
      contact.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [contacts]);

  const handleSortChange = (newSortBy: typeof sortBy) => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
  };

  const handleTagToggle = (tag: string) => {
    const newSelectedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(newSelectedTags);
  };

  if (contacts.length === 0) {
    return (
      <div className="text-center py-12">
        <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {isSearchResults ? 'No contacts found' : 'No contacts yet'}
        </h3>
        <p className="text-gray-500">
          {isSearchResults 
            ? 'Try adjusting your search terms or filters' 
            : 'Get started by adding your first contact'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex-1 max-w-md">
          <SearchInput
            value={localSearchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            onSuggestionSelect={handleSuggestionSelect}
            suggestions={suggestions}
            placeholder="Search contacts..."
            className="w-full"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={showFilters ? EyeOff : Eye}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          
          <div className="flex items-center border border-gray-200 rounded-lg p-1">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              icon={LayoutGrid}
              onClick={() => setViewMode('grid')}
              className="rounded-md"
            />
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              icon={List}
              onClick={() => setViewMode('list')}
              className="rounded-md"
            />
            <Button
              variant={viewMode === 'table' ? 'primary' : 'ghost'}
              size="sm"
              icon={Table}
              onClick={() => setViewMode('table')}
              className="rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 flex items-center">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedTags([]);
                setSortBy('name');
                setSortOrder('asc');
              }}
            >
              Clear All
            </Button>
          </div>
          
          {/* Sort Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort by
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'name', label: 'Name' },
                { key: 'email', label: 'Email' },
                { key: 'company', label: 'Company' },
                { key: 'createdAt', label: 'Date Added' },
                { key: 'lastContacted', label: 'Last Contact' },
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={sortBy === key ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleSortChange(key as typeof sortBy)}
                  icon={sortBy === key ? (sortOrder === 'asc' ? SortAsc : SortDesc) : undefined}
                  iconPosition="right"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tag Filters */}
          {allTags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by tags
              </label>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          Showing {processedContacts.length} of {contacts.length} contacts
          {selectedTags.length > 0 && (
            <span className="ml-2">
              • Filtered by: {selectedTags.join(', ')}
            </span>
          )}
        </div>
        {isSearchResults && (
          <div className="flex items-center">
            <Search className="w-4 h-4 mr-1" />
            Results for "{searchQuery}"
          </div>
        )}
      </div>

      {/* Contact List */}
      {viewMode === 'table' ? (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {processedContacts.map((item) => {
                const contact = 'contact' in item ? item.contact : item;
                return (
                  <ContactCard
                    key={contact.id}
                    contact={contact}
                    isSelected={selectedContacts.has(contact.id)}
                    onSelect={toggleContactSelection}
                    viewMode="table"
                    searchQuery={searchQuery}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {processedContacts.map((item) => {
            const contact = 'contact' in item ? item.contact : item;
            return (
              <ContactCard
                key={contact.id}
                contact={contact}
                isSelected={selectedContacts.has(contact.id)}
                onSelect={toggleContactSelection}
                viewMode={viewMode}
                searchQuery={searchQuery}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContactList;