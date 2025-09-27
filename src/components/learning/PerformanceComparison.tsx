import React, { useState } from 'react'
import { Play, BarChart3, Zap, Clock, TrendingUp, Database } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import { PerformanceMetrics, Contact } from './types'

interface PerformanceComparisonProps {
  contacts: Contact[]
  onRunTest?: (metrics: PerformanceMetrics) => void
  className?: string
}

const PerformanceComparison: React.FC<PerformanceComparisonProps> = ({
  contacts,
  onRunTest,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isRunning, setIsRunning] = useState(false)
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null)
  const [animationProgress, setAnimationProgress] = useState(0)

  // Simulate Trie search performance
  const simulateTrieSearch = (term: string, dataSize: number): number => {
    // Trie search is O(m) where m is the length of the search term
    // Base time + term length factor
    return 0.1 + term.length * 0.05 + Math.log(dataSize) * 0.01
  }

  // Simulate linear search performance
  const simulateLinearSearch = (term: string, dataSize: number): number => {
    // Linear search is O(n) where n is the number of contacts
    // Each contact comparison takes time
    return 0.5 + dataSize * 0.02 + term.length * 0.01
  }

  const runPerformanceTest = async () => {
    if (!searchTerm.trim()) return

    setIsRunning(true)
    setAnimationProgress(0)

    // Animate progress
    const animationInterval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(animationInterval)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Simulate test duration
    await new Promise(resolve => setTimeout(resolve, 2500))

    const dataSize = contacts.length
    const trieTime = simulateTrieSearch(searchTerm, dataSize)
    const linearTime = simulateLinearSearch(searchTerm, dataSize)
    const speedupFactor = linearTime / trieTime

    const testMetrics: PerformanceMetrics = {
      trieSearchTime: trieTime,
      linearSearchTime: linearTime,
      datasetSize: dataSize,
      searchTerm: searchTerm,
      timestamp: new Date(),
      speedupFactor: speedupFactor,
    }

    setMetrics(testMetrics)
    setIsRunning(false)
    onRunTest?.(testMetrics)
  }

  const formatTime = (ms: number) => {
    if (ms < 1) {
      return `${(ms * 1000).toFixed(1)}μs`
    }
    return `${ms.toFixed(2)}ms`
  }

  const getSpeedupColor = (factor: number) => {
    if (factor >= 50) return 'text-green-600'
    if (factor >= 20) return 'text-blue-600'
    if (factor >= 10) return 'text-yellow-600'
    return 'text-orange-600'
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Performance Comparison
            </h3>
            <p className="text-gray-600">
              Compare Trie search vs Linear search performance
            </p>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Database className="w-4 h-4 mr-1" />
            <span>{contacts.length} contacts</span>
          </div>
        </div>
      </div>

      {/* Test Controls */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-end space-x-4">
          <div className="flex-1">
            <Input
              label="Search Term"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Enter a search term..."
              disabled={isRunning}
            />
          </div>
          <Button
            variant="primary"
            icon={Play}
            onClick={runPerformanceTest}
            disabled={!searchTerm.trim() || isRunning}
            loading={isRunning}
          >
            Run Test
          </Button>
        </div>

        {/* Progress Animation */}
        {isRunning && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Running performance test...
              </span>
              <span className="text-sm text-gray-500">
                {animationProgress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-100"
                style={{ width: `${animationProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {metrics && (
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Test Results
          </h4>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Trie Search */}
            <div className="bg-green-50 p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-green-900">Trie Search</h5>
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-green-900 mb-2">
                {formatTime(metrics.trieSearchTime)}
              </div>
              <div className="text-sm text-green-700">O(m) complexity</div>
              <div className="text-xs text-green-600 mt-1">
                m = search term length
              </div>
            </div>

            {/* Linear Search */}
            <div className="bg-red-50 p-6 rounded-lg border border-red-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-red-900">Linear Search</h5>
                <Clock className="w-5 h-5 text-red-600" />
              </div>
              <div className="text-3xl font-bold text-red-900 mb-2">
                {formatTime(metrics.linearSearchTime)}
              </div>
              <div className="text-sm text-red-700">O(n) complexity</div>
              <div className="text-xs text-red-600 mt-1">
                n = number of contacts
              </div>
            </div>

            {/* Speed Improvement */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-semibold text-blue-900">
                  Speed Improvement
                </h5>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div
                className={`text-3xl font-bold mb-2 ${getSpeedupColor(metrics.speedupFactor)}`}
              >
                {metrics.speedupFactor.toFixed(1)}x
              </div>
              <div className="text-sm text-blue-700">Faster with Trie</div>
              <div className="text-xs text-blue-600 mt-1">
                {((1 - 1 / metrics.speedupFactor) * 100).toFixed(1)}% time saved
              </div>
            </div>
          </div>

          {/* Visual Comparison */}
          <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Visual Comparison
            </h5>

            <div className="space-y-4">
              {/* Trie Search Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Trie Search
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTime(metrics.trieSearchTime)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div
                    className="bg-green-500 h-4 rounded-full transition-all duration-1000"
                    style={{
                      width: `${(metrics.trieSearchTime / metrics.linearSearchTime) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Linear Search Bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Linear Search
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatTime(metrics.linearSearchTime)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div className="bg-red-500 h-4 rounded-full w-full transition-all duration-1000" />
                </div>
              </div>
            </div>

            {/* Explanation */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h6 className="font-semibold text-blue-900 mb-2">
                Why is Trie faster?
              </h6>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>
                  • Trie search time depends only on the search term length
                  (O(m))
                </li>
                <li>• Linear search must check every contact (O(n))</li>
                <li>
                  • As your contact list grows, Trie maintains consistent
                  performance
                </li>
                <li>• Perfect for autocomplete and prefix matching</li>
              </ul>
            </div>
          </div>

          {/* Test Details */}
          <div className="mt-6 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <span className="font-medium">Search Term:</span> "
                {metrics.searchTerm}"
              </div>
              <div>
                <span className="font-medium">Dataset Size:</span>{' '}
                {metrics.datasetSize} contacts
              </div>
              <div>
                <span className="font-medium">Test Date:</span>{' '}
                {metrics.timestamp.toLocaleDateString()}
              </div>
              <div>
                <span className="font-medium">Test Time:</span>{' '}
                {metrics.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PerformanceComparison
