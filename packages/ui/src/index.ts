/**
 * Shared UI Components for Booking App
 * 
 * This package contains reusable React components that work across
 * web (Next.js) and mobile (React Native) platforms.
 */

import React from 'react'

// Types
export interface ButtonProps {
  children: React.ReactNode
  onPress?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export interface CardProps {
  children: React.ReactNode
  title?: string
}

// Platform-agnostic Button component
export const Button = ({ children, onPress, variant = 'primary', disabled = false }: ButtonProps) => {
  const baseStyles = {
    padding: '12px 24px',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  }

  const variantStyles = {
    primary: {
      backgroundColor: '#0ea5e9',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: '#e5e7eb',
      color: '#1f2937',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
  }

  return (
    <button
      style={{ ...baseStyles, ...variantStyles[variant] }}
      onClick={onPress}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Platform-agnostic Card component
export const Card = ({ children, title }: CardProps) => {
  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      {title && (
        <h3
          style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#1e3a8a',
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </div>
  )
}

// Utility functions for styling
export const styles = {
  colors: {
    primary: '#0ea5e9',
    secondary: '#64748b',
    success: '#22c55e',
    danger: '#ef4444',
    warning: '#f59e0b',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
}
