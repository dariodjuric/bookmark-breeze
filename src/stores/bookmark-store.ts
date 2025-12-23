import {
  createBookmark,
  deleteBookmark,
  fetchBookmarks,
  isRootFolder,
  moveBookmark,
  sortFolderByName,
  updateBookmark,
} from '@/lib/chrome-bookmarks';
import {
  loadSettings,
  saveSettings,
  type Settings,
} from '@/lib/settings-storage';
import type { BookmarkOrFolder, Folder } from '@/types/bookmark';
import { isFolder } from '@/types/bookmark';
import { create } from 'zustand';

interface BookmarkState {
  // Core data
  bookmarksOrFolders: BookmarkOrFolder[];

  // Loading & error states
  status: 'idle' | 'loading' | 'error';
  error: string | null;

  // UI interaction states
  editingId: string | null;
  draggedBookmarkOrFolder: BookmarkOrFolder | null;
  dragOverFolderId: string | null;
  hoveredId: string | null;

  // Settings
  settings: Settings;
}

interface BookmarkActions {
  // Data loading
  openPage: () => Promise<void>;
  refreshBookmarks: () => Promise<void>;

  // Bookmark CRUD
  addFolder: (parentId: string, folderName: string) => Promise<void>;
  saveEdit: (
    id: string,
    updates: { title?: string; url?: string }
  ) => Promise<void>;
  removeBookmark: (id: string) => Promise<void>;
  sortFolderContents: (folderId: string) => Promise<void>;

  // Editing
  startEditing: (bookmarkId: string) => void;
  cancelEditing: () => void;
  editHoveredBookmark: () => void;

  // Drag & drop
  startDragging: (bookmarkOrFolder: BookmarkOrFolder) => void;
  hoverDropTarget: (folderId: string) => void;
  clearDropTarget: () => void;
  dropIntoFolder: (targetFolderId: string) => Promise<void>;
  stopDragging: () => void;

  // Hover (for keyboard shortcuts)
  hoverBookmarkOrFolder: (bookmarkOrFolderId: string) => void;
  unhoverBookmarkOrFolder: () => void;

  // Settings
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
}

type BookmarkStore = BookmarkState & BookmarkActions;

// Helper to find a bookmark or folder by ID in the tree
const findBookmarkOrFolderById = (
  id: string,
  bookmarksOrFolders: BookmarkOrFolder[]
): BookmarkOrFolder | null => {
  for (const bookmarkOrFolder of bookmarksOrFolders) {
    if (bookmarkOrFolder.id === id) {
      return bookmarkOrFolder;
    }
    if (isFolder(bookmarkOrFolder)) {
      const found = findBookmarkOrFolderById(id, bookmarkOrFolder.children);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

// Helper to check if a bookmark is a descendant of another
const isDescendant = (parent: Folder, childId: string): boolean => {
  if (parent.id === childId) {
    return true;
  }
  return parent.children.some((child) => {
    if (child.id === childId) {
      return true;
    }
    if (isFolder(child)) {
      return isDescendant(child, childId);
    }
    return false;
  });
};

export const useBookmarkStore = create<BookmarkStore>((set, get) => ({
  // Initial state
  bookmarksOrFolders: [],
  status: 'idle',
  error: null,
  editingId: null,
  draggedBookmarkOrFolder: null,
  dragOverFolderId: null,
  hoveredId: null,
  settings: { confirmDeletions: true, expandAllByDefault: true },

  // Data loading actions
  openPage: async () => {
    try {
      set({ status: 'loading', error: null });
      const data = await fetchBookmarks();
      const settings = await loadSettings().catch(() => ({
        confirmDeletions: true,
        expandAllByDefault: true,
      }));
      set({ bookmarksOrFolders: data, settings, status: 'idle' });
    } catch (err) {
      set({
        status: 'error',
        error: err instanceof Error ? err.message : 'Failed to load bookmarks',
      });
    }
  },

  refreshBookmarks: async () => {
    try {
      const data = await fetchBookmarks();
      set({ bookmarksOrFolders: data });
    } catch (err) {
      console.error('Failed to refresh bookmarks:', err);
    }
  },

  // Bookmark CRUD actions
  addFolder: async (parentId, folderName) => {
    try {
      await createBookmark(parentId, folderName);
      await get().refreshBookmarks();
    } catch (err) {
      console.error('Failed to create folder:', err);
    }
  },

  saveEdit: async (id, updates) => {
    if (isRootFolder(id)) {
      return;
    }

    try {
      await updateBookmark(id, {
        title: updates.title,
        url: updates.url,
      });
      set({ editingId: null });
      await get().refreshBookmarks();
    } catch (err) {
      console.error('Failed to update bookmark:', err);
    }
  },

  removeBookmark: async (id) => {
    if (isRootFolder(id)) {
      return;
    }

    try {
      const { bookmarksOrFolders } = get();
      const bookmarkOrFolder = findBookmarkOrFolderById(id, bookmarksOrFolders);
      if (bookmarkOrFolder) {
        await deleteBookmark(bookmarkOrFolder);
        await get().refreshBookmarks();
      }
    } catch (err) {
      console.error('Failed to delete bookmark:', err);
    }
  },

  sortFolderContents: async (folderId) => {
    try {
      await sortFolderByName(folderId);
      await get().refreshBookmarks();
    } catch (err) {
      console.error('Failed to sort folder:', err);
    }
  },

  // Editing actions
  startEditing: (bookmarkId) => {
    if (isRootFolder(bookmarkId)) {
      return;
    }
    set({ editingId: bookmarkId });
  },

  cancelEditing: () => {
    set({ editingId: null });
  },

  editHoveredBookmark: () => {
    const { hoveredId, editingId } = get();
    if (!editingId && hoveredId && !isRootFolder(hoveredId)) {
      set({ editingId: hoveredId });
    }
  },

  // Drag & drop actions
  startDragging: (bookmarkOrFolder) => {
    if (isRootFolder(bookmarkOrFolder.id)) {
      return;
    }
    set({ draggedBookmarkOrFolder: bookmarkOrFolder });
  },

  hoverDropTarget: (folderId) => {
    const { draggedBookmarkOrFolder } = get();
    if (draggedBookmarkOrFolder && draggedBookmarkOrFolder.id !== folderId) {
      set({ dragOverFolderId: folderId });
    }
  },

  clearDropTarget: () => {
    set({ dragOverFolderId: null });
  },

  dropIntoFolder: async (targetFolderId) => {
    const { draggedBookmarkOrFolder } = get();

    if (
      !draggedBookmarkOrFolder ||
      draggedBookmarkOrFolder.id === targetFolderId
    ) {
      set({ draggedBookmarkOrFolder: null, dragOverFolderId: null });
      return;
    }

    if (isRootFolder(draggedBookmarkOrFolder.id)) {
      set({ draggedBookmarkOrFolder: null, dragOverFolderId: null });
      return;
    }

    // Prevent dropping a folder into itself or its descendants
    if (
      isFolder(draggedBookmarkOrFolder) &&
      isDescendant(draggedBookmarkOrFolder, targetFolderId)
    ) {
      set({ draggedBookmarkOrFolder: null, dragOverFolderId: null });
      return;
    }

    try {
      await moveBookmark(draggedBookmarkOrFolder.id, {
        parentId: targetFolderId,
      });
      await get().refreshBookmarks();
    } catch (err) {
      console.error('Failed to move bookmark:', err);
    }

    set({ draggedBookmarkOrFolder: null, dragOverFolderId: null });
  },

  stopDragging: () => {
    set({ draggedBookmarkOrFolder: null, dragOverFolderId: null });
  },

  // Hover actions
  hoverBookmarkOrFolder: (bookmarkId) => {
    set({ hoveredId: bookmarkId });
  },

  unhoverBookmarkOrFolder: () => {
    set({ hoveredId: null });
  },

  // Settings actions
  updateSettings: async (updates) => {
    const oldSettings = get().settings;
    const newSettings = { ...oldSettings, ...updates };
    set({ settings: newSettings });
    try {
      await saveSettings(newSettings);
    } catch (err) {
      console.error('Failed to save settings:', err);
      set({ settings: oldSettings });
    }
  },
}));
