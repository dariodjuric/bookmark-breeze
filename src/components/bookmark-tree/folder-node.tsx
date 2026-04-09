import { Button } from '@/components/ui/button';
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
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderPlus,
  MoveRight,
  Trash2,
  X,
} from 'lucide-react';
import { memo, useState } from 'react';
import BookmarkNode from './bookmark-node';
import AddFolderDialog from './dialogs/add-folder-dialog';
import DeleteDialog from './dialogs/delete-dialog';
import DropLine from './drop-line';
import MoveToFolderDropdown from './move-to-folder-dropdown';

interface FolderNodeProps {
  folder: Folder;
  depth: number;
}

function FolderNode({ folder, depth }: FolderNodeProps) {
  const allExpanded = useBookmarkStore((state) => state.allExpanded);
  const expandCollapseVersion = useBookmarkStore(
    (state) => state.expandCollapseVersion
  );
  const [isExpanded, setExpanded] = useState(true);
  const [lastVersion, setLastVersion] = useState(expandCollapseVersion);

  if (expandCollapseVersion !== lastVersion) {
    setLastVersion(expandCollapseVersion);
    setExpanded(allExpanded);
  }

  const [isAddFolderOpen, setAddFolderOpen] = useState(false);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const dropPosition = useBookmarkStore((state) =>
    state.dropIndicator?.targetId === folder.id
      ? state.dropIndicator.position
      : null
  );
  const isDragged = useBookmarkStore(
    (state) => state.draggedBookmarkOrFolder?.id === folder.id
  );
  const isDragging = useBookmarkStore(
    (state) => state.draggedBookmarkOrFolder !== null
  );
  const startEditing = useBookmarkStore((state) => state.startEditing);
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark);
  const addFolder = useBookmarkStore((state) => state.addFolder);
  const sortFolderContents = useBookmarkStore(
    (state) => state.sortFolderContents
  );
  const startDragging = useBookmarkStore((state) => state.startDragging);
  const setDropIndicator = useBookmarkStore((state) => state.setDropIndicator);
  const commitDrop = useBookmarkStore((state) => state.commitDrop);
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
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const offset = (e.clientY - rect.top) / rect.height;
    // Root folders can't be re-ordered, so the entire row is an "into" zone
    let position: 'above' | 'into' | 'below';
    if (isRoot) {
      position = 'into';
    } else if (offset < 0.25) {
      position = 'above';
    } else if (offset > 0.75) {
      position = 'below';
    } else {
      position = 'into';
    }
    setDropIndicator({ targetId: folder.id, position });
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
          dropPosition === 'into' &&
            'bg-accent ring-2 ring-primary ring-offset-1 ring-offset-card',
          isDragged && 'opacity-40',
          !isEditing && !isRoot && 'cursor-grab active:cursor-grabbing',
          isDragging && 'transition-none'
        )}
        style={{ paddingLeft: getDepthPadding(depth) }}
        draggable={!isEditing && !isRoot}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={stopDragging}
        onMouseEnter={() => hoverFolder(folder.id)}
        onMouseLeave={unhoverFolder}
      >
        <button
          onClick={() => setExpanded(!isExpanded)}
          className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <FolderIcon className="h-4 w-4 text-amber-500" />
        </button>

        {isEditing && !isRoot ? (
          <div className="flex flex-1 items-center gap-2">
            <input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title"
              className="h-7 flex-1 rounded-md border bg-card px-2 text-sm outline-none focus:border-primary"
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
          <div className="ml-auto flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    sortFolderContents(folder.id);
                  }}
                >
                  <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Sort by name</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddFolderOpen(true);
                  }}
                >
                  <FolderPlus className="h-3 w-3 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add folder</TooltipContent>
            </Tooltip>
            {!isRoot && (
              <>
                <MoveToFolderDropdown item={folder}>
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
                          removeBookmark(folder.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete</TooltipContent>
                </Tooltip>
              </>
            )}
          </div>
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
