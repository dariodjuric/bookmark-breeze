import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBookmarkKeyboardShortcuts } from '@/hooks/use-bookmark-keyboard-shortcuts';
import { useBookmarkStore } from '@/stores/bookmark-store';
import {
  Bookmark,
  ChevronsDownUp,
  ChevronsUpDown,
  Loader2,
} from 'lucide-react';
import { useEffect } from 'react';
import BookmarkTree from './bookmark-tree';
import ScanCard from './scan-card';
import SettingsCard from './settings-card';

export default function MainPage() {
  const bookmarksOrFolders = useBookmarkStore(
    (state) => state.bookmarksOrFolders
  );
  const status = useBookmarkStore((state) => state.status);
  const error = useBookmarkStore((state) => state.error);
  const openPage = useBookmarkStore((state) => state.openPage);
  const allExpanded = useBookmarkStore((state) => state.allExpanded);
  const toggleExpandAll = useBookmarkStore((state) => state.toggleExpandAll);

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
      <Card
        className="flex-1 gap-0 py-0 w-full"
        onDragOver={(e) => e.preventDefault()}
      >
        <CardHeader className="flex flex-row items-center gap-2 px-4 py-3">
          <Bookmark className="h-4 w-4 text-primary" />
          <CardTitle className="font-display text-base">Bookmarks</CardTitle>
          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={toggleExpandAll}
                >
                  {allExpanded ? (
                    <ChevronsDownUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {allExpanded ? 'Collapse all' : 'Expand all'}
              </TooltipContent>
            </Tooltip>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="p-2">
          {bookmarksOrFolders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p>No bookmarks yet</p>
              <p className="text-sm">Add a bookmark or folder to get started</p>
            </div>
          ) : (
            <BookmarkTree bookmarksOrFolders={bookmarksOrFolders} />
          )}
        </CardContent>
      </Card>
      <div className="w-72 shrink-0 space-y-4">
        <SettingsCard />
        <ScanCard />
      </div>
    </div>
  );
}
