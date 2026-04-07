import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import { router } from './router'
import { OnboardingProvider } from './context/OnboardingContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OnboardingProvider>
      <RouterProvider router={router} />
    </OnboardingProvider>
  </StrictMode>,
)
