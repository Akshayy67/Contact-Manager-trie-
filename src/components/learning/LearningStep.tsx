import React, { useState } from 'react'
import {
  CheckCircle,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import Button from '../ui/Button'
import CodeExample from './CodeExample'
import TrieVisualization from './TrieVisualization'
import InteractiveExercise from './InteractiveExercise'
import { LearningStep as LearningStepType } from './types'

interface LearningStepProps {
  step: LearningStepType
  onComplete: (stepId: string) => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  className?: string
}

const LearningStep: React.FC<LearningStepProps> = ({
  step,
  onComplete,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  className = '',
}) => {
  const [exerciseCompleted, setExerciseCompleted] = useState(false)

  const handleComplete = () => {
    onComplete(step.id)
  }

  const handleExerciseComplete = () => {
    setExerciseCompleted(true)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getDifficultyStars = (difficulty: string) => {
    const count =
      difficulty === 'beginner' ? 1 : difficulty === 'intermediate' ? 2 : 3
    return Array.from({ length: 3 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < count ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
              {step.completed && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>
            <p className="text-gray-600 leading-relaxed">{step.description}</p>
          </div>

          <div className="flex flex-col items-end space-y-2">
            {/* Difficulty indicator */}
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(step.difficulty)}`}
            >
              {step.difficulty}
            </div>

            {/* Difficulty stars */}
            <div className="flex space-x-1">
              {getDifficultyStars(step.difficulty)}
            </div>

            {/* Estimated time */}
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{step.estimatedTime} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Main content */}
        <div className="prose prose-gray max-w-none">
          <div dangerouslySetInnerHTML={{ __html: step.content }} />
        </div>

        {/* Code example */}
        {step.code && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Code Example
            </h3>
            <CodeExample example={step.code} />
          </div>
        )}

        {/* Visualization */}
        {step.visualization && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Visual Representation
            </h3>
            <TrieVisualization data={step.visualization} className="w-full" />
          </div>
        )}

        {/* Interactive exercise */}
        {step.interactive && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Interactive Exercise
            </h3>
            <InteractiveExercise
              exercise={step.interactive}
              onComplete={handleExerciseComplete}
            />
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {hasPrevious && (
              <Button variant="outline" icon={ChevronLeft} onClick={onPrevious}>
                Previous
              </Button>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {!step.completed && (
              <Button
                variant="primary"
                onClick={handleComplete}
                disabled={step.interactive && !exerciseCompleted}
              >
                Mark as Complete
              </Button>
            )}

            {hasNext && (
              <Button
                variant="primary"
                icon={ChevronRight}
                iconPosition="right"
                onClick={onNext}
                disabled={!step.completed}
              >
                Next Step
              </Button>
            )}
          </div>
        </div>

        {step.interactive && !exerciseCompleted && (
          <div className="mt-3 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
            Complete the interactive exercise to proceed to the next step.
          </div>
        )}
      </div>
    </div>
  )
}

export default LearningStep
