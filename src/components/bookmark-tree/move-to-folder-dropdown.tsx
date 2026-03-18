import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBookmarkStore } from '@/stores/bookmark-store';
import type { BookmarkOrFolder, Folder } from '@/types/bookmark';
import { isFolder } from '@/types/bookmark';
import { Folder as FolderIcon, Search } from 'lucide-react';
import type { ReactNode } from 'react';
import { memo, useMemo, useState } from 'react';

interface MoveToFolderDropdownProps {
  item: BookmarkOrFolder;
  children: ReactNode;
}

function MoveToFolderDropdown({ item, children }: MoveToFolderDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
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
      if (item.parentId === folderId) {
        return true;
      }
      if (item.id === folderId) {
        return true;
      }
      if (isFolder(item) && isDescendantOf(item, folderId)) {
        return true;
      }
      return false;
    };
  }, [item]);

  const handleMove = (targetFolderId: string) => {
    moveToFolder(item.id, targetFolderId);
    setOpen(false);
    setSearch('');
  };

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) {
      setSearch('');
    }
  };

  const filteredFolders = useMemo(() => {
    if (!search.trim()) {
      return topLevelFolders;
    }
    return filterFolders(topLevelFolders, search.toLowerCase());
  }, [topLevelFolders, search]);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>{children}</PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Move to folder</TooltipContent>
      </Tooltip>
      <PopoverContent className="w-64 p-0" align="start">
        <div className="flex items-center gap-2 border-b px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search folders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
        <div className="max-h-60 overflow-y-auto p-1">
          {filteredFolders.length === 0 ? (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No folders found
            </div>
          ) : (
            filteredFolders.map((folder) => (
              <FolderTreeItem
                key={folder.id}
                folder={folder}
                depth={0}
                onMove={handleMove}
                isDisabled={isDisabled}
                searchQuery={search.toLowerCase()}
              />
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

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

function filterFolders(folders: Folder[], query: string): Folder[] {
  const result: Folder[] = [];
  for (const folder of folders) {
    const titleMatches = (folder.title || '').toLowerCase().includes(query);
    const childFolders = folder.children.filter(isFolder);
    const filteredChildren = filterFolders(childFolders, query);

    if (titleMatches || filteredChildren.length > 0) {
      result.push({
        ...folder,
        children: filteredChildren,
      });
    }
  }
  return result;
}

interface FolderTreeItemProps {
  folder: Folder;
  depth: number;
  onMove: (targetFolderId: string) => void;
  isDisabled: (folderId: string) => boolean;
  searchQuery: string;
}

function FolderTreeItem({
  folder,
  depth,
  onMove,
  isDisabled,
  searchQuery,
}: FolderTreeItemProps) {
  const disabled = isDisabled(folder.id);
  const childFolders = folder.children.filter(isFolder);

  return (
    <>
      <button
        disabled={disabled}
        onClick={() => !disabled && onMove(folder.id)}
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        <FolderIcon className="h-4 w-4 shrink-0 text-amber-500" />
        <span className="truncate">{folder.title || '(untitled)'}</span>
      </button>
      {childFolders.map((child) => (
        <FolderTreeItem
          key={child.id}
          folder={child}
          depth={depth + 1}
          onMove={onMove}
          isDisabled={isDisabled}
          searchQuery={searchQuery}
        />
      ))}
    </>
  );
}

export default memo(MoveToFolderDropdown);
