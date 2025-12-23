import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useBookmarkKeyboardShortcuts } from '@/hooks/use-bookmark-keyboard-shortcuts';
import { useBookmarkStore } from '@/stores/bookmark-store';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import BookmarkTree from './bookmark-tree';
import SettingsCard from './settings-card';

export default function MainPage() {
  const bookmarksOrFolders = useBookmarkStore(
    (state) => state.bookmarksOrFolders
  );
  const status = useBookmarkStore((state) => state.status);
  const error = useBookmarkStore((state) => state.error);
  const openPage = useBookmarkStore((state) => state.openPage);

  useEffect(() => {
    openPage();
  }, [openPage]);

  useBookmarkKeyboardShortcuts();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <p>Error: {error}</p>
        <Button variant="outline" className="mt-4" onClick={() => openPage()}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="flex gap-4">
      <Card className="flex-1 gap-0 p-2" onDragOver={(e) => e.preventDefault()}>
        {bookmarksOrFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>No bookmarks yet</p>
            <p className="text-sm">Add a bookmark or folder to get started</p>
          </div>
        ) : (
          <BookmarkTree bookmarksOrFolders={bookmarksOrFolders} />
        )}
      </Card>
      <div className="w-72 shrink-0">
        <SettingsCard />
      </div>
    </div>
  );
}
