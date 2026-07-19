import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App'
import './index.css'

function startApp() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <HashRouter>
        <App />
      </HashRouter>
    </StrictMode>,
  )
}

if (window.pywebview) {
  startApp()
} else {
  window.addEventListener('pywebviewready', startApp)
  
  // Fallback for standard browser environment (npm run dev)
  setTimeout(() => {
    if (!document.getElementById('root')?.hasChildNodes()) {
      startApp()
    }
  }, 250)
}
