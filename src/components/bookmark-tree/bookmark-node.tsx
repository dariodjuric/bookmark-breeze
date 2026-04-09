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
import { useScanStore } from '@/stores/scan-store';
import type { Bookmark } from '@/types/bookmark';
import {
  Check,
  ExternalLink,
  Globe,
  Link2Off,
  MoveRight,
  Trash2,
  X,
} from 'lucide-react';
import { memo, useState } from 'react';
import DeleteDialog from './dialogs/delete-dialog';
import DropLine from './drop-line';
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
  const setDropIndicator = useBookmarkStore((state) => state.setDropIndicator);
  const commitDrop = useBookmarkStore((state) => state.commitDrop);
  const dropPosition = useBookmarkStore((state) =>
    state.dropIndicator?.targetId === bookmark.id
      ? state.dropIndicator.position
      : null
  );
  const isDragged = useBookmarkStore(
    (state) => state.draggedBookmarkOrFolder?.id === bookmark.id
  );
  const isDragging = useBookmarkStore(
    (state) => state.draggedBookmarkOrFolder !== null
  );
  const hoverBookmark = useBookmarkStore(
    (state) => state.hoverBookmarkOrFolder
  );
  const unhoverBookmark = useBookmarkStore(
    (state) => state.unhoverBookmarkOrFolder
  );
  const confirmDeletions = useBookmarkStore(
    (state) => state.settings.confirmDeletions
  );
  const isBroken = useScanStore((s) => s.brokenIds.has(bookmark.id));

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

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = (e.clientY - rect.top) / rect.height;
    setDropIndicator({
      targetId: bookmark.id,
      position: offset < 0.5 ? 'above' : 'below',
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    commitDrop();
  };

  return (
    <div className="relative select-none">
      {dropPosition === 'above' && <DropLine depth={depth} side="top" />}
      {dropPosition === 'below' && <DropLine depth={depth} side="bottom" />}
      <div
        className={cn(
          'group relative flex items-center gap-1 rounded-md px-2 py-1.5 transition-all',
          'hover:bg-accent',
          isDragged && 'opacity-40',
          !isEditing && 'cursor-grab active:cursor-grabbing',
          isDragging && 'transition-none'
        )}
        style={{ paddingLeft: getDepthPadding(depth) }}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={stopDragging}
        onMouseEnter={() => hoverBookmark(bookmark.id)}
        onMouseLeave={unhoverBookmark}
      >
        <div className="ml-[18px] flex items-center">
          <Globe
            className={cn(
              'h-4 w-4',
              isBroken ? 'text-destructive' : 'text-muted-foreground'
            )}
          />
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
              className="truncate max-w-80 text-xs text-muted-foreground cursor-pointer hover:underline"
            >
              {bookmark.url}
            </button>
            {isBroken && (
              <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive/10 px-1.5 py-0.5 text-[10px] font-semibold text-destructive shrink-0">
                <Link2Off className="h-3 w-3" />
                Needs review
              </span>
            )}
          </div>
        )}

        {!isEditing && (
          <div className="ml-auto flex items-center gap-2 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
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
