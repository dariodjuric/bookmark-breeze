import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInlineEdit } from '@/hooks/use-inline-edit';
import { getDepthPadding } from '@/lib/depth-calculation';
import { cn } from '@/lib/tailwind';
import { useBookmarkStore } from '@/stores/bookmark-store';
import type { Bookmark } from '@/types/bookmark';
import { Check, ExternalLink, Globe, MoveRight, Trash2, X } from 'lucide-react';
import { memo, useState } from 'react';
import DeleteDialog from './dialogs/delete-dialog';
import MoveToFolderDropdown from './move-to-folder-dropdown';

interface BookmarkNodeProps {
  bookmark: Bookmark;
  depth: number;
}

function BookmarkNode({ bookmark, depth }: BookmarkNodeProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const startEditing = useBookmarkStore((state) => state.startEditing);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const startDragging = useBookmarkStore((state) => state.startDragging);
  const stopDragging = useBookmarkStore((state) => state.stopDragging);
  const hoverBookmark = useBookmarkStore(
    (state) => state.hoverBookmarkOrFolder
  );
  const unhoverBookmark = useBookmarkStore(
    (state) => state.unhoverBookmarkOrFolder
  );
  const confirmDeletions = useBookmarkStore(
    (state) => state.settings.confirmDeletions
  );

  const {
    isEditing,
    editTitle,
    setEditTitle,
    editUrl,
    setEditUrl,
    titleInputRef,
    handleSave,
    handleCancel,
    handleKeyDown,
  } = useInlineEdit({
    bookmarkOrFolder: bookmark,
    isRoot: false,
  });

  const handleDragStart = (e: React.DragEvent) => {
    startDragging(bookmark);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors',
          'hover:bg-accent'
        )}
        style={{ paddingLeft: getDepthPadding(depth) }}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={stopDragging}
        onMouseEnter={() => hoverBookmark(bookmark.id)}
        onMouseLeave={unhoverBookmark}
      >
        <div className="ml-[18px] flex items-center">
          <Globe className="h-4 w-4 text-muted-foreground" />
        </div>

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title"
              className="h-7 flex-1 rounded-md border bg-card px-2 text-xs outline-none focus:border-primary"
            />
            <input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="URL"
              className="h-7 flex-1 rounded-md border bg-card px-2 text-xs outline-none focus:border-primary"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleSave}
            >
              <Check className="h-3 w-3" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCancel}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2 text-left min-w-0">
            <button
              onClick={() => startEditing(bookmark.id)}
              className="truncate max-w-56 cursor-pointer hover:underline"
            >
              {bookmark.title}
            </button>
            <button
              onClick={() => startEditing(bookmark.id)}
              className="truncate max-w-96 text-xs text-muted-foreground cursor-pointer hover:underline"
            >
              {bookmark.url}
            </button>
          </div>
        )}

        {!isEditing && (
          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  asChild
                >
                  <a
                    href={bookmark.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open in new tab</TooltipContent>
            </Tooltip>
            <MoveToFolderDropdown item={bookmark}>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => e.stopPropagation()}
              >
                <MoveRight className="h-3 w-3 text-muted-foreground" />
              </Button>
            </MoveToFolderDropdown>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirmDeletions) {
                      setDeleteDialogOpen(true);
                    } else {
                      removeBookmark(bookmark.id);
                    }
                  }}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>

      <DeleteDialog
        bookmark={bookmark}
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => removeBookmark(bookmark.id)}
      />
    </div>
  );
}

export default memo(BookmarkNode);
