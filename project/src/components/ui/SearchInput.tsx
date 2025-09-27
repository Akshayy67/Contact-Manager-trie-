import React from 'react';
import { Search, X } from 'lucide-react';
import Input from './Input';
import Button from './Button';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
  suggestions?: string[];
  onSuggestionSelect?: (suggestion: string) => void;
  isLoading?: boolean;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search contacts...',
  suggestions = [],
  onSuggestionSelect,
  isLoading = false,
  className = '',
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [highlightedIndex, setHighlightedIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    setShowSuggestions(newValue.length > 0 && suggestions.length > 0);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSuggestionClick(suggestions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    onSuggestionSelect?.(suggestion);
    setShowSuggestions(false);
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow for click events
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleFocus = () => {
    if (value.length > 0 && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          icon={isLoading ? undefined : Search}
          iconPosition="left"
          className="pr-10"
          fullWidth
        />
        
        {isLoading && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {value && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1"
            />
          </div>
        )}
      </div>

      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              type="button"
              className={`w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none ${
                index === highlightedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
              }`}
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-2 text-gray-400" />
                <span>{suggestion}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchInput;