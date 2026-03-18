import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { isFolder, type Bookmark, type Folder } from '@/types/bookmark';

type DeleteDialogProps =
  | {
      bookmark: Bookmark;
      folder?: never;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onConfirm: () => void;
    }
  | {
      bookmark?: never;
      folder: Folder;
      open: boolean;
      onOpenChange: (open: boolean) => void;
      onConfirm: () => void;
    };

export default function DeleteDialog({
  bookmark: _bookmark,
  folder,
  open,
  onOpenChange,
  onConfirm,
}: DeleteDialogProps) {
  const isFolderItem = !!folder;

  const getDescription = () => {
    if (!isFolderItem) {
      return 'This bookmark will be permanently deleted.';
    }
    const count = countDescendants(folder!);
    if (count > 0) {
      return `This folder contains ${count} bookmark${count === 1 ? '' : 's'}. All items will be permanently deleted.`;
    }
    return 'This empty folder will be permanently deleted.';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Delete {isFolderItem ? 'Folder' : 'Bookmark'}?
          </DialogTitle>
          <DialogDescription>{getDescription()}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function countDescendants(folder: Folder): number {
  return folder.children.reduce((count, child) => {
    if (isFolder(child)) {
      return count + 1 + countDescendants(child);
    }
    return count + 1;
  }, 0);
}
