import React, { useEffect, useRef, useState } from 'react'
import { TrieVisualizationNode, TrieVisualizationData } from './types'

interface TrieVisualizationProps {
  data: TrieVisualizationData
  width?: number
  height?: number
  className?: string
  onNodeClick?: (node: TrieVisualizationNode) => void
}

const TrieVisualization: React.FC<TrieVisualizationProps> = ({
  data,
  width = 800,
  height = 600,
  className = '',
  onNodeClick,
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [hoveredNode, setHoveredNode] = useState<string | null>(null)

  // Calculate node positions using a tree layout algorithm
  const calculatePositions = (
    node: TrieVisualizationNode,
    x: number,
    y: number,
    level: number
  ): void => {
    node.x = x
    node.y = y
    node.level = level

    const childCount = node.children.length
    if (childCount === 0) return

    const spacing = Math.max(60, width / Math.pow(2, level + 1))
    const startX = x - (spacing * (childCount - 1)) / 2

    node.children.forEach((child, index) => {
      const childX = startX + index * spacing
      const childY = y + 80
      calculatePositions(child, childX, childY, level + 1)
    })
  }

  useEffect(() => {
    if (data.root) {
      calculatePositions(data.root, width / 2, 50, 0)
    }
  }, [data, width, height])

  const renderNode = (node: TrieVisualizationNode) => {
    const isHighlighted = node.highlighted || node.isActive
    const isSearchPath = node.isSearchPath
    const isHovered = hoveredNode === node.id

    return (
      <g key={node.id}>
        {/* Node circle */}
        <circle
          cx={node.x}
          cy={node.y}
          r={isHovered ? 22 : 20}
          fill={
            isHighlighted
              ? '#3B82F6'
              : isSearchPath
                ? '#10B981'
                : node.isEndOfWord
                  ? '#F59E0B'
                  : '#E5E7EB'
          }
          stroke={
            isHighlighted ? '#1D4ED8' : isSearchPath ? '#059669' : '#9CA3AF'
          }
          strokeWidth={isHovered ? 3 : 2}
          className="transition-all duration-300 cursor-pointer"
          onMouseEnter={() => setHoveredNode(node.id)}
          onMouseLeave={() => setHoveredNode(null)}
          onClick={() => onNodeClick?.(node)}
        />

        {/* Node character */}
        <text
          x={node.x}
          y={(node.y || 0) + 5}
          textAnchor="middle"
          className="text-sm font-bold pointer-events-none"
          fill={isHighlighted || isSearchPath ? 'white' : '#374151'}
        >
          {node.character || 'ROOT'}
        </text>

        {/* Frequency indicator */}
        {data.showFrequencies && node.frequency > 0 && (
          <text
            x={node.x}
            y={(node.y || 0) - 30}
            textAnchor="middle"
            className="text-xs font-medium pointer-events-none"
            fill="#6B7280"
          >
            {node.frequency}
          </text>
        )}

        {/* End of word indicator */}
        {node.isEndOfWord && data.highlightEndNodes && (
          <circle
            cx={(node.x || 0) + 15}
            cy={(node.y || 0) - 15}
            r={4}
            fill="#EF4444"
            className="animate-pulse"
          />
        )}
      </g>
    )
  }

  const renderEdge = (
    parent: TrieVisualizationNode,
    child: TrieVisualizationNode
  ) => {
    const isSearchPath = parent.isSearchPath && child.isSearchPath

    return (
      <line
        key={`${parent.id}-${child.id}`}
        x1={parent.x}
        y1={(parent.y || 0) + 20}
        x2={child.x}
        y2={(child.y || 0) - 20}
        stroke={isSearchPath ? '#10B981' : '#9CA3AF'}
        strokeWidth={isSearchPath ? 3 : 2}
        className="transition-all duration-300"
      />
    )
  }

  const renderTree = (node: TrieVisualizationNode): JSX.Element[] => {
    const elements: JSX.Element[] = []

    // Render edges first (so they appear behind nodes)
    node.children.forEach(child => {
      elements.push(renderEdge(node, child))
      elements.push(...renderTree(child))
    })

    // Render the node
    elements.push(renderNode(node))

    return elements
  }

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border border-gray-200 rounded-lg bg-white shadow-sm"
        viewBox={`0 0 ${width} ${height}`}
      >
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
              stroke="#F3F4F6"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Render the trie */}
        {data.root && renderTree(data.root)}

        {/* Search term indicator */}
        {data.currentSearchTerm && (
          <text x={20} y={30} className="text-sm font-medium" fill="#374151">
            Searching: "{data.currentSearchTerm}"
          </text>
        )}
      </svg>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white p-3 rounded-lg shadow-md border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Legend</h4>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-gray-200 border border-gray-400 mr-2"></div>
            <span>Regular Node</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-yellow-500 border border-yellow-600 mr-2"></div>
            <span>End of Word</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-green-500 border border-green-600 mr-2"></div>
            <span>Search Path</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full bg-blue-500 border border-blue-600 mr-2"></div>
            <span>Highlighted</span>
          </div>
        </div>
      </div>

      {/* Node tooltip */}
      {hoveredNode && (
        <div className="absolute bottom-4 left-4 bg-gray-900 text-white p-2 rounded-lg text-xs">
          Node: {hoveredNode}
        </div>
      )}
    </div>
  )
}

export default TrieVisualization
