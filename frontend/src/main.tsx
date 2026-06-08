import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './styles/globals.css'
import './components/ui/animation/shake.css'

import ErrorBoundary from './components/common/ErrorBoundary'

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>

    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>

  </React.StrictMode>
)