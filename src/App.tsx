import { Bookmark } from 'lucide-react';
import MainPage from './components/bookmark-tree/main-page';
import { TooltipProvider } from './components/ui/tooltip';
import { useBookmarkStore } from './stores/bookmark-store';
import type { BookmarkOrFolder } from './types/bookmark';
import { isFolder } from './types/bookmark';

export default function App() {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-5 flex flex-col gap-6">
          <Header />
          <MainPage />
        </div>
      </div>
    </TooltipProvider>
  );
}

function countStats(items: BookmarkOrFolder[]): {
  folders: number;
  bookmarks: number;
} {
  let folders = 0;
  let bookmarks = 0;
  for (const item of items) {
    if (isFolder(item)) {
      folders++;
      const child = countStats(item.children);
      folders += child.folders;
      bookmarks += child.bookmarks;
    } else {
      bookmarks++;
    }
  }
  return { folders, bookmarks };
}

function Header() {
  const bookmarksOrFolders = useBookmarkStore(
    (state) => state.bookmarksOrFolders
  );
  const { folders, bookmarks } = countStats(bookmarksOrFolders);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
          <Bookmark className="h-5 w-5 text-primary-foreground" />
        </div>
        <h1 className="font-display text-3xl font-bold text-foreground">
          Bookmark Breeze
        </h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Curate your links at lightning speed
      </p>
      {(folders > 0 || bookmarks > 0) && (
        <div className="flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs text-accent-foreground">
          <span>
            {folders} folder{folders !== 1 ? 's' : ''}
          </span>
          <span className="text-muted-foreground">·</span>
          <span>
            {bookmarks} bookmark{bookmarks !== 1 ? 's' : ''}
          </span>
        </div>
      )}
    </div>
  );
}
