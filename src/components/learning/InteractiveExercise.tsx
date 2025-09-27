import React, { useState, useEffect } from 'react'
import { CheckCircle, AlertCircle, Lightbulb, RotateCcw } from 'lucide-react'
import Button from '../ui/Button'
import Input from '../ui/Input'
import TrieVisualization from './TrieVisualization'
import {
  InteractiveExercise as InteractiveExerciseType,
  TrieVisualizationData,
} from './types'

interface InteractiveExerciseProps {
  exercise: InteractiveExerciseType
  onComplete: () => void
  className?: string
}

const InteractiveExercise: React.FC<InteractiveExerciseProps> = ({
  exercise,
  onComplete,
  className = '',
}) => {
  const [userInput, setUserInput] = useState('')
  const [isCompleted, setIsCompleted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [trieData, setTrieData] = useState<TrieVisualizationData | null>(null)

  useEffect(() => {
    if (exercise.initialData) {
      setTrieData(exercise.initialData)
    }
  }, [exercise])

  const handleSubmit = () => {
    if (exercise.validation) {
      const isValid = exercise.validation(userInput)
      if (isValid) {
        setIsCompleted(true)
        setFeedback('Excellent! You completed the exercise correctly.')
        onComplete()
      } else {
        setFeedback('Not quite right. Try again or use the hint for guidance.')
      }
    }
  }

  const handleReset = () => {
    setUserInput('')
    setIsCompleted(false)
    setShowHint(false)
    setFeedback(null)
    if (exercise.initialData) {
      setTrieData(exercise.initialData)
    }
  }

  const renderBuildTrieExercise = () => (
    <div className="space-y-4">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2">Build a Trie</h4>
        <p className="text-blue-800 text-sm">{exercise.instructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Enter words to insert (comma-separated)"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="cat, car, card, care, careful"
            disabled={isCompleted}
          />

          <div className="flex space-x-2">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!userInput.trim() || isCompleted}
            >
              Build Trie
            </Button>
            <Button variant="outline" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
            {exercise.hint && (
              <Button
                variant="ghost"
                icon={Lightbulb}
                onClick={() => setShowHint(!showHint)}
              >
                Hint
              </Button>
            )}
          </div>
        </div>

        <div>
          {trieData && (
            <TrieVisualization data={trieData} width={400} height={300} />
          )}
        </div>
      </div>
    </div>
  )

  const renderSearchDemoExercise = () => (
    <div className="space-y-4">
      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
        <h4 className="font-semibold text-green-900 mb-2">
          Search Demonstration
        </h4>
        <p className="text-green-800 text-sm">{exercise.instructions}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Input
            label="Search term"
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder="Type to search..."
            disabled={isCompleted}
          />

          <div className="flex space-x-2">
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={!userInput.trim() || isCompleted}
            >
              Search
            </Button>
            <Button variant="outline" icon={RotateCcw} onClick={handleReset}>
              Reset
            </Button>
          </div>
        </div>

        <div>
          {trieData && (
            <TrieVisualization
              data={{
                ...trieData,
                currentSearchTerm: userInput,
              }}
              width={400}
              height={300}
            />
          )}
        </div>
      </div>
    </div>
  )

  const renderPerformanceTestExercise = () => (
    <div className="space-y-4">
      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
        <h4 className="font-semibold text-purple-900 mb-2">Performance Test</h4>
        <p className="text-purple-800 text-sm">{exercise.instructions}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Trie Search</h5>
          <div className="text-2xl font-bold text-green-600">0.5ms</div>
          <div className="text-sm text-gray-500">Average time</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Linear Search</h5>
          <div className="text-2xl font-bold text-red-600">15.2ms</div>
          <div className="text-sm text-gray-500">Average time</div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h5 className="font-medium text-gray-900 mb-2">Speed Improvement</h5>
          <div className="text-2xl font-bold text-blue-600">30.4x</div>
          <div className="text-sm text-gray-500">Faster</div>
        </div>
      </div>

      <Button
        variant="primary"
        onClick={() => {
          setIsCompleted(true)
          setFeedback(
            'Great! You can see how much faster Trie search is compared to linear search.'
          )
          onComplete()
        }}
        disabled={isCompleted}
      >
        Run Performance Test
      </Button>
    </div>
  )

  const renderExerciseContent = () => {
    switch (exercise.type) {
      case 'build-trie':
        return renderBuildTrieExercise()
      case 'search-demo':
        return renderSearchDemoExercise()
      case 'performance-test':
        return renderPerformanceTestExercise()
      default:
        return <div>Unknown exercise type</div>
    }
  }

  return (
    <div
      className={`bg-gray-50 p-6 rounded-lg border border-gray-200 ${className}`}
    >
      {renderExerciseContent()}

      {/* Hint */}
      {showHint && exercise.hint && (
        <div className="mt-4 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="flex items-start">
            <Lightbulb className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-medium text-yellow-900 mb-1">Hint</h5>
              <p className="text-yellow-800 text-sm">{exercise.hint}</p>
            </div>
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div
          className={`mt-4 p-4 rounded-lg border ${
            isCompleted
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}
        >
          <div className="flex items-start">
            {isCompleted ? (
              <CheckCircle className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <p
              className={`text-sm ${
                isCompleted ? 'text-green-800' : 'text-red-800'
              }`}
            >
              {feedback}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InteractiveExercise
