import { useBookmarkStore } from '@/stores/bookmark-store';
import type { BookmarkOrFolder } from '@/types/bookmark';
import { isBookmark } from '@/types/bookmark';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseInlineEditOptions {
  bookmarkOrFolder: BookmarkOrFolder;
  isRoot: boolean;
}

export function useInlineEdit({
  bookmarkOrFolder,
  isRoot,
}: UseInlineEditOptions) {
  const isEditing = useBookmarkStore(
    (state) => state.editingId === bookmarkOrFolder.id
  );
  const saveEdit = useBookmarkStore((state) => state.saveEdit);
  const cancelEditing = useBookmarkStore((state) => state.cancelEditing);

  const [editTitle, setEditTitle] = useState(bookmarkOrFolder.title);
  const [editUrl, setEditUrl] = useState(
    isBookmark(bookmarkOrFolder) ? bookmarkOrFolder.url : ''
  );
  const titleInputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing) {
      const timer = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
          const len = titleInputRef.current.value.length;
          titleInputRef.current.setSelectionRange(len, len);
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isEditing]);

  // Reset values when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditTitle(bookmarkOrFolder.title);
      setEditUrl(isBookmark(bookmarkOrFolder) ? bookmarkOrFolder.url : '');
    }
  }, [isEditing, bookmarkOrFolder]);

  const handleSave = useCallback(() => {
    if (isRoot) {
      return;
    }
    saveEdit(bookmarkOrFolder.id, {
      title: editTitle,
      url: isBookmark(bookmarkOrFolder) ? editUrl : undefined,
    });
  }, [bookmarkOrFolder, editTitle, editUrl, isRoot, saveEdit]);

  const handleCancel = useCallback(() => {
    cancelEditing();
  }, [cancelEditing]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.stopPropagation();
        handleSave();
      } else if (e.key === 'Escape') {
        e.stopPropagation();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  return {
    isEditing,
    editTitle,
    setEditTitle,
    editUrl,
    setEditUrl,
    titleInputRef,
    handleSave,
    handleCancel,
    handleKeyDown,
  };
}
