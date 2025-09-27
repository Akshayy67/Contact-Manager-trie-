import React, { createContext, useContext, ReactNode } from 'react'
import ToastContainer from '../ui/ToastContainer'
import { useToast } from '../../hooks/useToast'

interface ToastContextType {
  success: (title: string, message?: string, duration?: number) => string
  error: (title: string, message?: string, duration?: number) => string
  warning: (title: string, message?: string, duration?: number) => string
  info: (title: string, message?: string, duration?: number) => string
  removeToast: (id: string) => void
  clearAllToasts: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export const ToastProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const toastHook = useToast()

  return (
    <ToastContext.Provider value={toastHook}>
      {children}
      <ToastContainer
        toasts={toastHook.toasts}
        onRemoveToast={toastHook.removeToast}
      />
    </ToastContext.Provider>
  )
}

export const useToastContext = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider')
  }
  return context
}
