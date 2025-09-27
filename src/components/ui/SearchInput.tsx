import React, { useState, useRef, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import Button from './Button'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  onClear?: () => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search contacts...',
  className = '',
  autoFocus = false,
}) => {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus()
    }
  }, [autoFocus])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const handleClear = () => {
    onChange('')
    onClear?.()
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClear()
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div
        className={`relative flex items-center bg-white border rounded-xl shadow-sm transition-all duration-200 ${
          isFocused
            ? 'border-blue-500 ring-2 ring-blue-100 shadow-md'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        {/* Search Icon */}
        <div className="absolute left-4 flex items-center pointer-events-none">
          <Search className={`w-5 h-5 transition-colors duration-200 ${
            isFocused ? 'text-blue-500' : 'text-gray-400'
          }`} />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-3 text-gray-900 placeholder-gray-500 bg-transparent border-none rounded-xl focus:outline-none focus:ring-0"
        />

        {/* Clear Button */}
        {value && (
          <div className="absolute right-3 flex items-center">
            <Button
              variant="ghost"
              size="sm"
              icon={X}
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 p-1 h-8 w-8"
            />
          </div>
        )}
      </div>

      {/* Search suggestions or results count could go here */}
      {value && (
        <div className="absolute top-full left-0 right-0 mt-1 text-xs text-gray-500 px-4">
          {value.length > 0 && `Searching for "${value}"`}
        </div>
      )}
    </div>
  )
}

export default SearchInput
