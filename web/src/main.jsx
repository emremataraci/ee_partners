import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { initializeI18n } from './i18n'
import App from './App.jsx'

const root = createRoot(document.getElementById('root'))

initializeI18n()
  .catch((error) => {
    console.error('Failed to initialize i18n:', error)
  })
  .finally(() => {
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
