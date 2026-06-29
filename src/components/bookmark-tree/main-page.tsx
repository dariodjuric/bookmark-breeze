import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBookmarkKeyboardShortcuts } from '@/hooks/use-bookmark-keyboard-shortcuts';
import { useBookmarkSync } from '@/hooks/use-bookmark-sync';
import { useBookmarkStore } from '@/stores/bookmark-store';
import type { BookmarkOrFolder } from '@/types/bookmark';
import { isBookmark, isFolder } from '@/types/bookmark';
import {
  Bookmark,
  ChevronsDownUp,
  ChevronsUpDown,
  Loader2,
  Search,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import BookmarkTree from './bookmark-tree';
import FeedbackNote from './feedback-note';
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

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 200);
    return () => clearTimeout(timer);
  }, [search]);

  const filteredTree = useMemo(() => {
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) {
      return bookmarksOrFolders;
    }
    return filterTree(bookmarksOrFolders, query);
  }, [bookmarksOrFolders, debouncedSearch]);

  useEffect(() => {
    openPage();
  }, [openPage]);

  useBookmarkKeyboardShortcuts();
  useBookmarkSync();

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
        <CardHeader className="flex flex-row items-center justify-between gap-2 px-4 py-3">
          <div className="flex items-center gap-2">
            <Bookmark className="h-4 w-4 text-primary" />
            <CardTitle className="font-display text-base">Bookmarks</CardTitle>
          </div>
          <div className="flex flex-1 items-center gap-1.5 rounded-md border bg-transparent px-2 py-1 max-w-2/4">
            <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground min-w-0"
            />
            {search && (
              <button
                onClick={() => {
                  setSearch('');
                  searchInputRef.current?.focus();
                }}
                className="shrink-0 rounded-sm p-0.5 hover:bg-accent cursor-pointer"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            )}
          </div>
          <div>
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
            <div className="flex flex-col items-center justify-center py-3 text-muted-foreground">
              <p>No bookmarks yet</p>
              <p className="text-sm">Add a bookmark or folder to get started</p>
            </div>
          ) : filteredTree.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-3 text-muted-foreground">
              <p className="text-sm">No results found</p>
            </div>
          ) : (
            <BookmarkTree bookmarksOrFolders={filteredTree} />
          )}
        </CardContent>
      </Card>
      <div className="w-72 shrink-0 space-y-4">
        <SettingsCard />
        <ScanCard />
        <FeedbackNote />
      </div>
    </div>
  );
}

function filterTree(
  nodes: BookmarkOrFolder[],
  query: string
): BookmarkOrFolder[] {
  const result: BookmarkOrFolder[] = [];
  for (const node of nodes) {
    if (isBookmark(node)) {
      const titleMatch = node.title.toLowerCase().includes(query);
      const urlMatch = node.url.toLowerCase().includes(query);
      if (titleMatch || urlMatch) {
        result.push(node);
      }
    } else if (isFolder(node)) {
      const titleMatch = node.title.toLowerCase().includes(query);
      const filteredChildren = filterTree(node.children, query);
      if (titleMatch || filteredChildren.length > 0) {
        result.push({
          ...node,
          children: titleMatch ? node.children : filteredChildren,
        });
      }
    }
  }
  return result;
}
