import React, { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Award, Clock, RotateCcw } from 'lucide-react'
import Button from '../ui/Button'
import { Quiz as QuizType } from './types'

interface QuizProps {
  quiz: QuizType
  onComplete: (score: number, timeSpent: number) => void
  className?: string
}

const Quiz: React.FC<QuizProps> = ({ quiz, onComplete, className = '' }) => {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [startTime] = useState(Date.now())
  const [timeSpent, setTimeSpent] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
    }, 1000)

    return () => clearInterval(interval)
  }, [startTime])

  const handleSubmit = () => {
    if (selectedAnswer === null) return

    setIsSubmitted(true)
    const isCorrect = selectedAnswer === quiz.correctAnswer
    const score = isCorrect ? quiz.points : 0
    const finalTimeSpent = Math.floor((Date.now() - startTime) / 1000)

    setTimeout(() => {
      onComplete(score, finalTimeSpent)
    }, 2000) // Show result for 2 seconds before completing
  }

  const handleReset = () => {
    setSelectedAnswer(null)
    setIsSubmitted(false)
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'hard':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isCorrect = selectedAnswer === quiz.correctAnswer

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">Quiz Question</h3>
          <div className="flex items-center space-x-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(quiz.difficulty)}`}
            >
              {quiz.difficulty}
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Award className="w-4 h-4 mr-1" />
              <span>{quiz.points} points</span>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatTime(timeSpent)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 leading-relaxed">
            {quiz.question}
          </h4>
        </div>

        {/* Answer options */}
        <div className="space-y-3 mb-6">
          {quiz.options.map((option, index) => {
            let optionClass = 'border-gray-200 hover:border-gray-300'
            let iconElement = null

            if (isSubmitted) {
              if (index === quiz.correctAnswer) {
                optionClass = 'border-green-500 bg-green-50'
                iconElement = <CheckCircle className="w-5 h-5 text-green-600" />
              } else if (
                index === selectedAnswer &&
                selectedAnswer !== quiz.correctAnswer
              ) {
                optionClass = 'border-red-500 bg-red-50'
                iconElement = <XCircle className="w-5 h-5 text-red-600" />
              }
            } else if (selectedAnswer === index) {
              optionClass = 'border-blue-500 bg-blue-50'
            }

            return (
              <button
                key={index}
                onClick={() => !isSubmitted && setSelectedAnswer(index)}
                disabled={isSubmitted}
                className={`w-full p-4 text-left border-2 rounded-lg transition-all duration-200 ${optionClass} ${
                  !isSubmitted ? 'cursor-pointer' : 'cursor-default'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center text-sm font-medium ${
                        selectedAnswer === index && !isSubmitted
                          ? 'border-blue-500 bg-blue-500 text-white'
                          : 'border-gray-300 text-gray-500'
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="text-gray-900">{option}</span>
                  </div>
                  {iconElement}
                </div>
              </button>
            )
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            icon={RotateCcw}
            onClick={handleReset}
            disabled={!isSubmitted}
          >
            Try Again
          </Button>

          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedAnswer === null || isSubmitted}
          >
            Submit Answer
          </Button>
        </div>

        {/* Result */}
        {isSubmitted && (
          <div
            className={`mt-6 p-4 rounded-lg border ${
              isCorrect
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <div className="flex items-start">
              {isCorrect ? (
                <CheckCircle className="w-6 h-6 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              )}
              <div>
                <h5
                  className={`font-semibold mb-2 ${
                    isCorrect ? 'text-green-900' : 'text-red-900'
                  }`}
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h5>
                <p
                  className={`text-sm leading-relaxed ${
                    isCorrect ? 'text-green-800' : 'text-red-800'
                  }`}
                >
                  {quiz.explanation}
                </p>
                {isCorrect && (
                  <div className="mt-2 flex items-center text-sm text-green-700">
                    <Award className="w-4 h-4 mr-1" />
                    <span>You earned {quiz.points} points!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Quiz
