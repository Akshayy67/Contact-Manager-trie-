import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Search, Eye, EyeOff, Info, Zap, Clock, Target } from 'lucide-react'
import Button from './Button'
import Input from './Input'
import { useContacts } from '../../stores/contactStore'
import type { Contact, TrieVisualizationNode } from '../../types'

interface VisualSearchEngineProps {
  onSearchResults?: (results: Contact[]) => void
  className?: string
}

interface SearchStats {
  nodesVisited: number
  pathLength: number
  matchesFound: number
  searchTime: number
}

const VisualSearchEngine: React.FC<VisualSearchEngineProps> = ({
  onSearchResults,
  className = '',
}) => {
  const { searchIndex, search, searchResults } = useContacts()
  const [query, setQuery] = useState('')
  const [showVisualization, setShowVisualization] = useState(true)
  const [showTooltips, setShowTooltips] = useState(false)
  const [showEducationalInfo, setShowEducationalInfo] = useState(true)
  const [visualizationData, setVisualizationData] =
    useState<TrieVisualizationNode | null>(null)
  const [searchStats, setSearchStats] = useState<SearchStats | null>(null)
  const [animationKey, setAnimationKey] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const svgRef = useRef<SVGSVGElement>(null)

  // Calculate node positions for tree layout
  const calculateNodePositions = (
    node: TrieVisualizationNode,
    x = 400,
    y = 50,
    level = 0
  ): void => {
    node.x = x
    node.y = y

    if (node.children.length === 0) return

    const totalWidth = Math.max(600, node.children.length * 80)
    const startX = x - totalWidth / 2
    const childSpacing = totalWidth / (node.children.length + 1)

    node.children.forEach((child, index) => {
      const childX = startX + (index + 1) * childSpacing
      const childY = y + 80
      calculateNodePositions(child, childX, childY, level + 1)
    })
  }

  // Update visualization when query changes
  useEffect(() => {
    if (searchIndex) {
      try {
        const vizData = searchIndex.getVisualizationData(query)
        calculateNodePositions(vizData)
        setVisualizationData(vizData)

        if (query) {
          const stats = searchIndex.getSearchStatistics(query)
          setSearchStats(stats)
        } else {
          setSearchStats(null)
        }

        setAnimationKey(prev => prev + 1)
      } catch (error) {
        console.error('Error updating visualization:', error)
      }
    } else {
      console.warn('Search index not available')
    }
  }, [query, searchIndex])

  // Handle search input
  const handleSearch = (value: string) => {
    console.log('VisualSearchEngine: handleSearch called with:', value)
    setQuery(value)
    search(value)
  }

  // Watch for search results changes and notify parent
  useEffect(() => {
    console.log(
      'VisualSearchEngine: searchResults changed:',
      searchResults.length,
      'results'
    )
    if (onSearchResults) {
      onSearchResults(searchResults.map((result: any) => result.contact))
    }
  }, [searchResults, onSearchResults])

  // Debug: Log when query changes
  useEffect(() => {
    console.log('VisualSearchEngine: query changed to:', query)
  }, [query])

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.max(0.5, Math.min(3, prev + delta)))
  }

  // Handle mouse events for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPanOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  // Handle wheel zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    handleZoom(delta)
  }

  // Reset view
  const resetView = () => {
    setZoomLevel(1)
    setPanOffset({ x: 0, y: 0 })
  }

  // Render a single node in the Trie
  const renderNode = (
    node: TrieVisualizationNode,
    parentX?: number,
    parentY?: number
  ) => {
    if (!node.x || !node.y) return null

    const nodeRadius = 20
    const isRoot = node.character === 'root'
    const isHighlighted = node.highlighted || node.isSearchPath
    const isActive = node.isActive
    const isEndOfWord = node.isEndOfWord

    // Node colors based on state
    let nodeColor = '#e5e7eb' // default gray
    let textColor = '#374151'
    let strokeColor = '#d1d5db'

    if (isActive) {
      nodeColor = '#ef4444' // red for active node
      textColor = '#ffffff'
      strokeColor = '#dc2626'
    } else if (isHighlighted) {
      nodeColor = '#3b82f6' // blue for search path
      textColor = '#ffffff'
      strokeColor = '#2563eb'
    } else if (isEndOfWord) {
      nodeColor = '#10b981' // green for end of word
      textColor = '#ffffff'
      strokeColor = '#059669'
    }

    return (
      <g key={node.id}>
        {/* Edge from parent */}
        {parentX !== undefined && parentY !== undefined && (
          <line
            x1={parentX}
            y1={parentY + nodeRadius}
            x2={node.x}
            y2={node.y - nodeRadius}
            stroke={isHighlighted ? '#3b82f6' : '#d1d5db'}
            strokeWidth={isHighlighted ? 3 : 2}
            className="transition-all duration-300"
          />
        )}

        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={nodeRadius}
          fill={nodeColor}
          stroke={strokeColor}
          strokeWidth={2}
          className="transition-all duration-300 cursor-pointer hover:scale-110"
          style={{
            animationDelay: `${node.animationDelay}ms`,
            animation: `fadeIn 0.5s ease-out forwards`,
          }}
          onMouseEnter={() => setShowTooltips(true)}
          onMouseLeave={() => setShowTooltips(false)}
        />

        {/* Character label */}
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          fontSize="12"
          fontWeight="bold"
          fill={textColor}
          className="pointer-events-none select-none"
        >
          {isRoot ? '⚡' : node.character.toUpperCase()}
        </text>

        {/* Frequency indicator */}
        {node.frequency > 0 && !isRoot && (
          <text
            x={node.x}
            y={node.y - nodeRadius - 5}
            textAnchor="middle"
            fontSize="10"
            fill="#6b7280"
            className="pointer-events-none select-none"
          >
            {node.frequency}
          </text>
        )}

        {/* End of word indicator */}
        {isEndOfWord && (
          <circle
            cx={node.x + nodeRadius - 5}
            cy={node.y - nodeRadius + 5}
            r={4}
            fill="#10b981"
            className="animate-pulse"
          />
        )}

        {/* Tooltip */}
        {showTooltips && (
          <g className="pointer-events-none">
            <rect
              x={node.x - 40}
              y={node.y + nodeRadius + 10}
              width="80"
              height="30"
              fill="#1f2937"
              rx="4"
              opacity="0.9"
            />
            <text
              x={node.x}
              y={node.y + nodeRadius + 25}
              textAnchor="middle"
              fontSize="10"
              fill="#ffffff"
            >
              {isRoot ? 'Root' : `Char: ${node.character}`}
            </text>
            <text
              x={node.x}
              y={node.y + nodeRadius + 35}
              textAnchor="middle"
              fontSize="8"
              fill="#9ca3af"
            >
              {isEndOfWord ? 'Word End' : `Level ${node.level}`}
            </text>
          </g>
        )}

        {/* Render children */}
        {node.children.map(child => renderNode(child, node.x, node.y))}
      </g>
    )
  }

  const memoizedVisualization = useMemo(() => {
    if (!visualizationData || !showVisualization) return null

    return (
      <div className="relative bg-gradient-to-br from-slate-50 to-blue-50 rounded-lg border border-slate-200 overflow-hidden">
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(0.2)}
            className="px-2"
          >
            +
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleZoom(-0.2)}
            className="px-2"
          >
            -
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={resetView}
            className="px-2"
          >
            ⌂
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTooltips(!showTooltips)}
            icon={Info}
          >
            {showTooltips ? 'Hide' : 'Show'} Info
          </Button>
        </div>

        <svg
          ref={svgRef}
          width="100%"
          height="400"
          viewBox="0 0 800 400"
          className="w-full cursor-grab active:cursor-grabbing"
          key={animationKey}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
        >
          <defs>
            <style>
              {`
                @keyframes fadeIn {
                  from { opacity: 0; transform: scale(0.8); }
                  to { opacity: 1; transform: scale(1); }
                }
                .animate-pulse {
                  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.5; }
                }
              `}
            </style>
          </defs>

          {/* Background grid */}
          <defs>
            <pattern
              id="grid"
              width="20"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Main content group with zoom and pan */}
          <g
            transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
          >
            {/* Render the Trie */}
            {renderNode(visualizationData)}
          </g>

          {/* Search path indicator (fixed position) */}
          {query && (
            <text x="20" y="30" fontSize="14" fontWeight="bold" fill="#1f2937">
              Search Path: {query.split('').join(' → ')}
            </text>
          )}

          {/* Zoom level indicator */}
          <text x="20" y="380" fontSize="12" fill="#6b7280">
            Zoom: {(zoomLevel * 100).toFixed(0)}%
          </text>
        </svg>
      </div>
    )
  }, [
    visualizationData,
    showVisualization,
    showTooltips,
    animationKey,
    query,
    zoomLevel,
    panOffset,
    isDragging,
  ])

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Input with Controls */}
      <div className="flex gap-2 items-center">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="Search contacts... (watch the Trie visualize your search)"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            className="pl-10 pr-4"
          />
        </div>

        <Button
          variant="outline"
          onClick={() => setShowVisualization(!showVisualization)}
          icon={showVisualization ? EyeOff : Eye}
        >
          {showVisualization ? 'Hide' : 'Show'} Trie
        </Button>
      </div>

      {/* Search Results Info */}
      <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
        {query ? (
          <span>
            🔍 Searching for "<strong>{query}</strong>" - Found{' '}
            <strong>{searchResults.length}</strong> contacts
          </span>
        ) : (
          <span>
            💡 Enter a search term to see results and Trie visualization
          </span>
        )}
      </div>

      {/* Search Statistics */}
      {searchStats && (
        <div className="grid grid-cols-4 gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
              <Target className="w-4 h-4" />
              <span className="text-sm font-medium">Nodes Visited</span>
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {searchStats.nodesVisited}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Path Length</span>
            </div>
            <div className="text-2xl font-bold text-green-800">
              {searchStats.pathLength}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-purple-600 mb-1">
              <Search className="w-4 h-4" />
              <span className="text-sm font-medium">Matches Found</span>
            </div>
            <div className="text-2xl font-bold text-purple-800">
              {searchStats.matchesFound}
            </div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-orange-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Search Time</span>
            </div>
            <div className="text-2xl font-bold text-orange-800">
              {searchStats.searchTime.toFixed(2)}ms
            </div>
          </div>
        </div>
      )}

      {/* Trie Visualization */}
      {memoizedVisualization}

      {/* Educational Information */}
      {showVisualization && showEducationalInfo && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-amber-800">
              How Trie Search Works:
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowEducationalInfo(false)}
              className="text-amber-600 hover:text-amber-800 p-1"
            >
              ×
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-amber-700">
            <div>
              <strong>🔵 Blue nodes:</strong> Current search path - the
              algorithm follows this path character by character
            </div>
            <div>
              <strong>🔴 Red node:</strong> Active node - where the search
              currently is
            </div>
            <div>
              <strong>🟢 Green nodes:</strong> End of word markers - complete
              words in the index
            </div>
          </div>
          <p className="mt-2 text-xs text-amber-600">
            Time Complexity: O(m) where m is the length of the search term. Much
            faster than linear search O(n)!
          </p>
          <div className="mt-3 text-xs text-amber-600 border-t border-amber-200 pt-2">
            <strong>💡 Pro Tips:</strong> Use mouse wheel to zoom, drag to pan,
            click the home button (⌂) to reset view
          </div>
        </div>
      )}

      {/* Show Educational Info Button */}
      {showVisualization && !showEducationalInfo && (
        <div className="text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowEducationalInfo(true)}
            className="text-amber-600 border-amber-300 hover:bg-amber-50"
          >
            Show How Trie Search Works
          </Button>
        </div>
      )}
    </div>
  )
}

export default VisualSearchEngine
