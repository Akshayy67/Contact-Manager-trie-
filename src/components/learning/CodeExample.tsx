import React, { useState } from 'react'
import { Play, Copy, Check, Edit, Eye } from 'lucide-react'
import Button from '../ui/Button'
import { CodeExample as CodeExampleType } from './types'

interface CodeExampleProps {
  example: CodeExampleType
  onRun?: (code: string) => void
  className?: string
}

const CodeExample: React.FC<CodeExampleProps> = ({
  example,
  onRun,
  className = '',
}) => {
  const [code, setCode] = useState(example.code)
  const [isEditing, setIsEditing] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const handleRun = () => {
    if (onRun) {
      onRun(code)
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value)
  }

  const resetCode = () => {
    setCode(example.code)
  }

  // Simple syntax highlighting for TypeScript/JavaScript
  const highlightSyntax = (code: string) => {
    const keywords = [
      'class',
      'interface',
      'function',
      'const',
      'let',
      'var',
      'if',
      'else',
      'for',
      'while',
      'return',
      'new',
      'this',
      'public',
      'private',
      'static',
      'export',
      'import',
      'from',
      'as',
      'type',
      'extends',
      'implements',
    ]

    const types = [
      'string',
      'number',
      'boolean',
      'void',
      'any',
      'object',
      'Array',
      'Map',
      'Set',
    ]

    let highlighted = code

    // Highlight keywords
    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g')
      highlighted = highlighted.replace(
        regex,
        `<span class="text-purple-600 font-semibold">${keyword}</span>`
      )
    })

    // Highlight types
    types.forEach(type => {
      const regex = new RegExp(`\\b${type}\\b`, 'g')
      highlighted = highlighted.replace(
        regex,
        `<span class="text-blue-600 font-semibold">${type}</span>`
      )
    })

    // Highlight strings
    highlighted = highlighted.replace(
      /(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g,
      '<span class="text-green-600">$1$2$3</span>'
    )

    // Highlight comments
    highlighted = highlighted.replace(
      /(\/\/.*$)/gm,
      '<span class="text-gray-500 italic">$1</span>'
    )

    // Highlight numbers
    highlighted = highlighted.replace(
      /\b(\d+\.?\d*)\b/g,
      '<span class="text-orange-600">$1</span>'
    )

    return highlighted
  }

  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <div className="flex space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
          </div>
          <span className="text-sm font-medium text-gray-700">
            {example.language} Example
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {example.editable && (
            <Button
              variant="ghost"
              size="sm"
              icon={isEditing ? Eye : Edit}
              onClick={() => setIsEditing(!isEditing)}
              className="text-gray-500 hover:text-gray-700"
            />
          )}

          <Button
            variant="ghost"
            size="sm"
            icon={copied ? Check : Copy}
            onClick={handleCopy}
            className={`${copied ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
          />

          {example.runnable && (
            <Button variant="primary" size="sm" icon={Play} onClick={handleRun}>
              Run
            </Button>
          )}
        </div>
      </div>

      {/* Code content */}
      <div className="relative">
        {isEditing && example.editable ? (
          <div className="p-4">
            <textarea
              value={code}
              onChange={handleCodeChange}
              className="w-full h-64 p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              spellCheck={false}
            />
            <div className="flex justify-end mt-2 space-x-2">
              <Button variant="secondary" size="sm" onClick={resetCode}>
                Reset
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(false)}
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          <pre className="p-4 overflow-x-auto">
            <code
              className="text-sm font-mono leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(code),
              }}
            />
          </pre>
        )}
      </div>

      {/* Explanation */}
      {example.explanation && (
        <div className="p-4 border-t border-gray-200 bg-blue-50">
          <h4 className="text-sm font-semibold text-blue-900 mb-2">
            Explanation
          </h4>
          <p className="text-sm text-blue-800 leading-relaxed">
            {example.explanation}
          </p>
        </div>
      )}
    </div>
  )
}

export default CodeExample
