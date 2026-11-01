import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { AppRecovery } from './components/AppRecovery'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppRecovery><App /></AppRecovery>
  </StrictMode>,
)
