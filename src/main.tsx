import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MaxUI, SnackbarProvider } from '@maxhub/max-ui'
import '@maxhub/max-ui/dist/styles.css'
import './styles.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MaxUI className="app-root" colorScheme="dark">
      <SnackbarProvider defaultPlacement="top-center">
        <App />
      </SnackbarProvider>
    </MaxUI>
  </StrictMode>,
)
