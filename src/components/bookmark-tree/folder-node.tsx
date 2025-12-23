import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useInlineEdit } from '@/hooks/use-inline-edit';
import { isRootFolder } from '@/lib/chrome-bookmarks';
import { getDepthPadding } from '@/lib/depth-calculation';
import { cn } from '@/lib/tailwind';
import { useBookmarkStore } from '@/stores/bookmark-store';
import type { Folder } from '@/types/bookmark';
import { isFolder } from '@/types/bookmark';
import {
  ArrowDownAZ,
  ChevronRight,
  Folder as FolderIcon,
  FolderOpen,
  FolderPlus,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { memo, useState } from 'react';
import BookmarkNode from './bookmark-node';
import AddFolderDialog from './dialogs/add-folder-dialog';
import DeleteDialog from './dialogs/delete-dialog';

interface FolderNodeProps {
  folder: Folder;
  depth: number;
}

function FolderNode({ folder, depth }: FolderNodeProps) {
  const expandAllByDefault = useBookmarkStore(
    (state) => state.settings.expandAllByDefault
  );
  const [isExpanded, setExpanded] = useState(expandAllByDefault);
  const [isAddFolderOpen, setAddFolderOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const isDragOverThis = useBookmarkStore(
    (state) => state.dragOverFolderId === folder.id
  );
  const startEditing = useBookmarkStore((state) => state.startEditing);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const addFolder = useBookmarkStore((state) => state.addFolder);
  const sortFolderContents = useBookmarkStore(
    (state) => state.sortFolderContents
  );
  const startDragging = useBookmarkStore((state) => state.startDragging);
  const hoverDropTarget = useBookmarkStore((state) => state.hoverDropTarget);
  const clearDropTarget = useBookmarkStore((state) => state.clearDropTarget);
  const dropIntoFolder = useBookmarkStore((state) => state.dropIntoFolder);
  const stopDragging = useBookmarkStore((state) => state.stopDragging);
  const hoverFolder = useBookmarkStore((state) => state.hoverBookmarkOrFolder);
  const unhoverFolder = useBookmarkStore(
    (state) => state.unhoverBookmarkOrFolder
  );
  const confirmDeletions = useBookmarkStore(
    (state) => state.settings.confirmDeletions
  );

  const isRoot = isRootFolder(folder.id);

  const {
    isEditing,
    editTitle,
    setEditTitle,
    titleInputRef,
    handleSave,
    handleCancel,
    handleKeyDown,
  } = useInlineEdit({
    bookmarkOrFolder: folder,
    isRoot,
  });

  const handleDragStart = (e: React.DragEvent) => {
    if (isRoot) {
      e.preventDefault();
      return;
    }
    startDragging(folder);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    hoverDropTarget(folder.id);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dropIntoFolder(folder.id);
  };

  const handleDragLeave = () => {
    clearDropTarget();
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors',
          'hover:bg-accent',
          isDragOverThis && 'bg-accent ring-2 ring-primary'
        )}
        style={{ paddingLeft: getDepthPadding(depth) }}
        draggable={!isEditing && !isRoot}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
        onDragEnd={stopDragging}
        onMouseEnter={() => hoverFolder(folder.id)}
        onMouseLeave={unhoverFolder}
      >
        {!isRoot && (
          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        {isRoot && <div className="w-4" />}

        <button
          onClick={() => setExpanded(!isExpanded)}
          className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          <ChevronRight
            className={cn(
              'h-4 w-4 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
          {isExpanded ? (
            <FolderOpen className="h-4 w-4 text-amber-500" />
          ) : (
            <FolderIcon className="h-4 w-4 text-amber-500" />
          )}
        </button>

        {isEditing && !isRoot ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title"
              className="h-7 flex-1"
            />
            <Button
              type="button"
              size="sm"
              className="h-7 px-2"
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 bg-transparent"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          /* Read-Only Folder Title */
          <button
            onClick={() => !isRoot && startEditing(folder.id)}
            className={cn(
              'flex flex-1 items-center gap-2 text-left min-w-0',
              !isRoot && 'cursor-pointer',
              isRoot && 'cursor-default'
            )}
          >
            <span className="truncate max-w-48">{folder.title}</span>
          </button>
        )}

        {!isEditing && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    sortFolderContents(folder.id);
                  }}
                >
                  <ArrowDownAZ className="size-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sort by name</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddFolderOpen(true);
                  }}
                >
                  <FolderPlus className="size-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add folder</TooltipContent>
            </Tooltip>
          </>
        )}

        {!isEditing && !isRoot && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirmDeletions) {
                    setDeleteDialogOpen(true);
                  } else {
                    removeBookmark(folder.id);
                  }
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}
      </div>

      {isExpanded && (
        <div>
          {folder.children.map((child) =>
            isFolder(child) ? (
              <FolderNode key={child.id} folder={child} depth={depth + 1} />
            ) : (
              <BookmarkNode key={child.id} bookmark={child} depth={depth + 1} />
            )
          )}
        </div>
      )}

      <AddFolderDialog
        open={isAddFolderOpen}
        onOpenChange={setAddFolderOpen}
        onSubmit={(folderName) => addFolder(folder.id, folderName)}
      />

      <DeleteDialog
        folder={folder}
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => removeBookmark(folder.id)}
      />
    </div>
  );
}

export default memo(FolderNode);
