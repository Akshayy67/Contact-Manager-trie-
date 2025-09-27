import React, { useEffect, useState } from 'react'
import { clsx } from 'clsx'

export interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  
  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])
  
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration])
  
  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => onClose(id), 300)
  }
  
  const typeConfig = {
    success: {
      icon: '✓',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      iconColor: 'text-green-600',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    error: {
      icon: '✕',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      iconColor: 'text-red-600',
      titleColor: 'text-red-800',
      messageColor: 'text-red-700'
    },
    warning: {
      icon: '⚠',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-600',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    },
    info: {
      icon: 'ℹ',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-600',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    }
  }
  
  const config = typeConfig[type]
  
  return (
    <div
      className={clsx(
        'max-w-sm w-full shadow-lg rounded-lg pointer-events-auto border transition-all duration-300 transform',
        config.bgColor,
        config.borderColor,
        isVisible && !isLeaving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className={clsx('flex-shrink-0 text-lg', config.iconColor)}>
            {config.icon}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className={clsx('text-sm font-medium', config.titleColor)}>
              {title}
            </p>
            {message && (
              <p className={clsx('mt-1 text-sm', config.messageColor)}>
                {message}
              </p>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className={clsx(
                'rounded-md inline-flex focus:outline-none focus:ring-2 focus:ring-offset-2',
                config.iconColor,
                'hover:opacity-75'
              )}
              onClick={handleClose}
              aria-label="Close notification"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Toast
