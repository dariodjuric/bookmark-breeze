import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useBookmarkKeyboardShortcuts } from '@/hooks/use-bookmark-keyboard-shortcuts';
import { useBookmarkStore } from '@/stores/bookmark-store';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import BookmarkTree from './bookmark-tree';

export default function MainPage() {
  const bookmarksOrFolders = useBookmarkStore(
    (state) => state.bookmarksOrFolders
  );
  const status = useBookmarkStore((state) => state.status);
  const error = useBookmarkStore((state) => state.error);
  const openPage = useBookmarkStore((state) => state.openPage);
  const confirmDeletions = useBookmarkStore(
    (state) => state.settings.confirmDeletions
  );
  const updateSettings = useBookmarkStore((state) => state.updateSettings);

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
    <>
      <div className="mb-2 flex items-center justify-end gap-2">
        <Checkbox
          id="confirm-deletions"
          checked={confirmDeletions}
          onCheckedChange={(checked) =>
            updateSettings({ confirmDeletions: checked === true })
          }
        />
        <label
          htmlFor="confirm-deletions"
          className="cursor-pointer text-sm text-muted-foreground"
        >
          Confirm deletions
        </label>
      </div>
      <div
        className="rounded-lg border bg-card"
        onDragOver={(e) => e.preventDefault()}
      >
        {bookmarksOrFolders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>No bookmarks yet</p>
            <p className="text-sm">Add a bookmark or folder to get started</p>
          </div>
        ) : (
          <BookmarkTree bookmarksOrFolders={bookmarksOrFolders} />
        )}
      </div>
    </>
  );
}
