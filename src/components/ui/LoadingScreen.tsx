import React from 'react'

interface LoadingScreenProps {
  message?: string
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg text-gray-600">{message}</p>
      </div>
    </div>
  )
}

export default LoadingScreen
