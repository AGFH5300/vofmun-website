'use client'

import { useTheme } from 'next-themes'
import { Toaster as Sonner, ToasterProps } from 'sonner'

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        style: {
          color: 'white',
          backgroundColor: '#1f2937',
          border: '1px solid #374151'
        },
        className: 'text-white'
      }}
      style={
        {
          '--normal-bg': '#1f2937',
          '--normal-text': '#ffffff',
          '--normal-border': '#374151',
          '--success-bg': '#10b981',
          '--success-text': '#ffffff',
          '--error-bg': '#ef4444',
          '--error-text': '#ffffff',
          '--warning-bg': '#f59e0b',
          '--warning-text': '#ffffff',
          '--info-bg': '#3b82f6',
          '--info-text': '#ffffff',
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
