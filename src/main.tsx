import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import MainPage from './components/bookmark-tree/main-page'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl p-6">
        <h1 className="mb-6 text-3xl font-bold text-foreground">
          Bookmarkaholic
        </h1>
        <MainPage />
      </div>
    </div>
  </StrictMode>
)
