import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { router } from './router'
import { OnboardingProvider } from './context/OnboardingContext'
import { ToastProvider } from './hooks/useToast'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OnboardingProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </OnboardingProvider>
  </StrictMode>,
)
