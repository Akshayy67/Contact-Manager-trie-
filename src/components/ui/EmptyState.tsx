import React from 'react'
import { Users } from 'lucide-react'

interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  onAction?: () => void
  icon?: React.ReactNode
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="text-gray-400 dark:text-gray-600 mb-4">
        {icon || <Users className="w-16 h-16" />}
      </div>

      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm">
        {description}
      </p>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}

export default EmptyState
