import React from 'react'
import {
  CheckCircle,
  Clock,
  Award,
  Trophy,
  Target,
  TrendingUp,
} from 'lucide-react'
import { LearningProgress } from './types'

interface ProgressTrackerProps {
  progress: LearningProgress
  totalSteps: number
  className?: string
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({
  progress,
  totalSteps,
  className = '',
}) => {
  const completionPercentage =
    (progress.completedSteps.length / totalSteps) * 100
  const totalPoints = Object.values(progress.quizScores).reduce(
    (sum, score) => sum + score,
    0
  )
  const averageScore =
    progress.quizScores && Object.keys(progress.quizScores).length > 0
      ? totalPoints / Object.keys(progress.quizScores).length
      : 0

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500'
    if (percentage >= 60) return 'bg-blue-500'
    if (percentage >= 40) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy className="w-5 h-5" />
      case 'target':
        return <Target className="w-5 h-5" />
      case 'trending-up':
        return <TrendingUp className="w-5 h-5" />
      default:
        return <Award className="w-5 h-5" />
    }
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Learning Progress
        </h3>
        <p className="text-gray-600">
          Track your journey through Trie data structures
        </p>
      </div>

      {/* Progress Overview */}
      <div className="p-6 border-b border-gray-200">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Overall Progress
            </span>
            <span className="text-sm font-medium text-gray-900">
              {progress.completedSteps.length} of {totalSteps} steps
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(completionPercentage)}`}
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-right mt-1">
            <span className="text-sm font-medium text-gray-900">
              {Math.round(completionPercentage)}% Complete
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="w-5 h-5 text-blue-600" />
              <span className="text-xs font-medium text-blue-600 uppercase tracking-wide">
                Completed
              </span>
            </div>
            <div className="text-2xl font-bold text-blue-900">
              {progress.completedSteps.length}
            </div>
            <div className="text-sm text-blue-700">Steps</div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <Award className="w-5 h-5 text-green-600" />
              <span className="text-xs font-medium text-green-600 uppercase tracking-wide">
                Points
              </span>
            </div>
            <div className="text-2xl font-bold text-green-900">
              {totalPoints}
            </div>
            <div className="text-sm text-green-700">Total earned</div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-5 h-5 text-purple-600" />
              <span className="text-xs font-medium text-purple-600 uppercase tracking-wide">
                Average
              </span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {Math.round(averageScore)}%
            </div>
            <div className="text-sm text-purple-700">Quiz score</div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-xs font-medium text-orange-600 uppercase tracking-wide">
                Time
              </span>
            </div>
            <div className="text-2xl font-bold text-orange-900">
              {formatTime(progress.totalTimeSpent)}
            </div>
            <div className="text-sm text-orange-700">Spent learning</div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      {progress.achievements.length > 0 && (
        <div className="p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Achievements
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {progress.achievements.map(achievement => (
              <div
                key={achievement.id}
                className="flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-yellow-900 mr-4">
                  {getAchievementIcon(achievement.icon)}
                </div>
                <div className="flex-1">
                  <h5 className="font-semibold text-gray-900 mb-1">
                    {achievement.title}
                  </h5>
                  <p className="text-sm text-gray-600 mb-2">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Unlocked{' '}
                      {new Date(achievement.unlockedAt).toLocaleDateString()}
                    </span>
                    <span className="text-xs font-medium text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
                      +{achievement.points} pts
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      <div className="p-6 bg-gray-50 rounded-b-xl">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">
          What's Next?
        </h4>
        {completionPercentage < 100 ? (
          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Continue with step {progress.currentStep + 1} to keep learning
              about Trie data structures.
            </p>
            <div className="flex items-center text-sm text-blue-600">
              <Target className="w-4 h-4 mr-1" />
              <span>
                {totalSteps - progress.completedSteps.length} steps remaining
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <Trophy className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <h5 className="text-lg font-semibold text-gray-900 mb-2">
              Congratulations! 🎉
            </h5>
            <p className="text-gray-600">
              You've completed all the learning steps. You're now a Trie expert!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProgressTracker
