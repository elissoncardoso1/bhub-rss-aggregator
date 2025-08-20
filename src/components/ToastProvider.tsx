'use client'

import { Toaster } from 'react-hot-toast'

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        // Duração padrão
        duration: 4000,
        
        // Estilo padrão
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
        
        // Estilos para diferentes tipos
        success: {
          style: {
            background: '#10b981', // green-500
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#10b981',
          },
        },
        
        error: {
          style: {
            background: '#ef4444', // red-500
            color: '#fff',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#ef4444',
          },
        },
        
        loading: {
          style: {
            background: '#3b82f6', // blue-500
            color: '#fff',
          },
        },
      }}
    />
  )
}
