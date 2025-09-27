import React from 'react'
import { clsx } from 'clsx'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  description?: string
  indeterminate?: boolean
  error?: string
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  description,
  indeterminate = false,
  error,
  className,
  id,
  ...props
}) => {
  const checkboxId = id || `checkbox-${Math.random().toString(36).substr(2, 9)}`
  
  const checkboxRef = React.useRef<HTMLInputElement>(null)
  
  React.useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate
    }
  }, [indeterminate])
  
  return (
    <div className={clsx('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={checkboxRef}
          id={checkboxId}
          type="checkbox"
          className={clsx(
            'h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-2 focus:ring-offset-0',
            'transition-colors duration-200',
            error && 'border-red-300 focus:ring-red-500',
            props.disabled && 'opacity-50 cursor-not-allowed'
          )}
          {...props}
        />
      </div>
      
      {(label || description) && (
        <div className="ml-3 text-sm">
          {label && (
            <label
              htmlFor={checkboxId}
              className={clsx(
                'font-medium cursor-pointer',
                error ? 'text-red-700' : 'text-gray-700',
                props.disabled && 'cursor-not-allowed opacity-50'
              )}
            >
              {label}
            </label>
          )}
          {description && (
            <p className={clsx(
              'text-gray-500',
              props.disabled && 'opacity-50'
            )}>
              {description}
            </p>
          )}
          {error && (
            <p className="text-red-600 mt-1" role="alert">
              {error}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export default Checkbox
