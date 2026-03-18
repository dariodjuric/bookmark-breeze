import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {isFolderItem ? 'Folder' : 'Bookmark'}?
          </AlertDialogTitle>
          <AlertDialogDescription>{getDescription()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-white hover:bg-destructive/90"
            onClick={() => {
              onConfirm();
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
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
