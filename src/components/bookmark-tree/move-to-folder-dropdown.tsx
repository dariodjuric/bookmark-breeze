import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useBookmarkStore } from '@/stores/bookmark-store';
import type { BookmarkOrFolder, Folder } from '@/types/bookmark';
import { isFolder } from '@/types/bookmark';
import { Folder as FolderIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { memo, useMemo, useState } from 'react';

interface MoveToFolderDropdownProps {
  item: BookmarkOrFolder;
  children: ReactNode;
}

function MoveToFolderDropdown({ item, children }: MoveToFolderDropdownProps) {
  const [open, setOpen] = useState(false);
  const bookmarksOrFolders = useBookmarkStore(
    (state) => state.bookmarksOrFolders
  );
  const moveToFolder = useBookmarkStore((state) => state.moveToFolder);

  const topLevelFolders = useMemo(
    () => bookmarksOrFolders.filter(isFolder),
    [bookmarksOrFolders]
  );

  const isDisabled = useMemo(() => {
    return (folderId: string) => {
      // Can't move to current parent
      if (item.parentId === folderId) {
        return true;
      }
      // Can't move folder into itself
      if (item.id === folderId) {
        return true;
      }
      // Can't move folder into its descendants
      if (isFolder(item) && isDescendantOf(item, folderId)) {
        return true;
      }
      return false;
    };
  }, [item]);

  const handleMove = (targetFolderId: string) => {
    moveToFolder(item.id, targetFolderId);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 overflow-y-auto w-52">
        {topLevelFolders.map((folder) => (
          <FolderMenuItem
            key={folder.id}
            folder={folder}
            itemToMove={item}
            onMove={handleMove}
            isDisabled={isDisabled}
          />
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Check if targetId is a descendant of folder
function isDescendantOf(folder: Folder, targetId: string): boolean {
  for (const child of folder.children) {
    if (child.id === targetId) {
      return true;
    }
    if (isFolder(child) && isDescendantOf(child, targetId)) {
      return true;
    }
  }
  return false;
}

interface FolderMenuItemProps {
  folder: Folder;
  itemToMove: BookmarkOrFolder;
  onMove: (targetFolderId: string) => void;
  isDisabled: (folderId: string) => boolean;
}

function FolderMenuItem({
  folder,
  itemToMove,
  onMove,
  isDisabled,
}: FolderMenuItemProps) {
  const childFolders = folder.children.filter(isFolder);
  const disabled = isDisabled(folder.id);

  if (childFolders.length === 0) {
    return (
      <DropdownMenuItem
        disabled={disabled}
        onClick={() => !disabled && onMove(folder.id)}
        className="gap-2 cursor-pointer"
      >
        <FolderIcon className="h-4 w-4 text-amber-500" />
        {folder.title || '(untitled)'}
      </DropdownMenuItem>
    );
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger
        className="gap-2 cursor-pointer"
        disabled={disabled}
        onClick={(e) => {
          if (disabled) return;
          e.preventDefault();
          onMove(folder.id);
        }}
      >
        <FolderIcon className="h-4 w-4 text-amber-500" />
        {folder.title || '(untitled)'}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {childFolders.map((child) => (
          <FolderMenuItem
            key={child.id}
            folder={child}
            itemToMove={itemToMove}
            onMove={onMove}
            isDisabled={isDisabled}
          />
        ))}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  );
}

export default memo(MoveToFolderDropdown);
