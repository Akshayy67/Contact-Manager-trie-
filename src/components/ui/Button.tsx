import React from 'react'
import type { LucideProps } from 'lucide-react'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  icon?: React.ComponentType<LucideProps>
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  const variantClasses = {
    primary:
      'bg-blue-600 hover:bg-blue-700 text-white shadow-sm focus:ring-blue-500',
    secondary:
      'bg-gray-100 hover:bg-gray-200 text-gray-900 shadow-sm focus:ring-gray-500',
    danger:
      'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-500',
    ghost: 'hover:bg-gray-100 text-gray-700 focus:ring-gray-500',
    outline:
      'border border-gray-300 hover:bg-gray-50 text-gray-700 shadow-sm focus:ring-gray-500',
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  }

  const isDisabled = disabled || loading
  const Icon = icon

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
          Loading...
        </div>
      ) : (
        <>
          {Icon && iconPosition === 'left' && (
            <Icon
              className={`${iconSizeClasses[size]} ${children ? 'mr-2' : ''}`}
            />
          )}
          {children}
          {Icon && iconPosition === 'right' && (
            <Icon
              className={`${iconSizeClasses[size]} ${children ? 'ml-2' : ''}`}
            />
          )}
        </>
      )}
    </button>
  )
}

export default Button
