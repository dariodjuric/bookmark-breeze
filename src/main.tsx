import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BookmarkTree } from './components/bookmark-tree'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl p-6">
        <h1 className="mb-6 text-3xl font-bold text-foreground">Bookmarkaholic</h1>
        <BookmarkTree />
      </div>
    </div>
  </StrictMode>,
)
