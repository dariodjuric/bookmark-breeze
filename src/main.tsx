import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MainPage from './components/bookmark-tree/main-page';
import { TooltipProvider } from './components/ui/tooltip';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center justify-center gap-1">
            <h1 className="text-4xl font-bold text-foreground">
              Bookmarkaholic
            </h1>
            <p className="text-sm text-muted-foreground">
              Curate your links at lightning speed
            </p>
          </div>
          <MainPage />
        </div>
      </div>
    </TooltipProvider>
  </StrictMode>
);
