import {
  collectAllBookmarks,
  requestHostPermission,
  scanBookmarks,
} from '@/lib/link-checker';
import type { BookmarkOrFolder } from '@/types/bookmark';
import { create } from 'zustand';

interface ScanState {
  scanStatus: 'idle' | 'scanning' | 'done';
  brokenIds: Set<string>;
  scanProgress: number;
  scanTotal: number;
  permissionDenied: boolean;
}

interface ScanActions {
  startScan: (bookmarksOrFolders: BookmarkOrFolder[]) => Promise<void>;
  cancelScan: () => void;
  clearResults: () => void;
}

type ScanStore = ScanState & ScanActions;

// Tracks the active scan's AbortController. Lives outside the store so that
// successive startScan calls can cancel a previous in-flight scan. Only one
// scan can be active at a time.
let activeController: AbortController | null = null;

// Clean up the module-level controller reference, but only if it still
// points to `controller`. A newer startScan call may have already replaced
// it, in which case we must not null out the new one.
function releaseController(controller: AbortController) {
  if (activeController === controller) {
    activeController = null;
  }
}

export const useScanStore = create<ScanStore>((set, get) => ({
  scanStatus: 'idle',
  brokenIds: new Set<string>(),
  scanProgress: 0,
  scanTotal: 0,
  permissionDenied: false,

  startScan: async (bookmarksOrFolders) => {
    // Cancel any in-flight scan before starting a new one.
    activeController?.abort();

    const controller = new AbortController();
    activeController = controller;

    // Permission request is async — the user may start another scan while
    // this dialog is open, which would abort our controller.
    const granted = await requestHostPermission();
    if (!granted) {
      set({ permissionDenied: true });
      releaseController(controller);
      return;
    }

    // If a newer scan was started during the permission prompt, bail out.
    if (controller.signal.aborted) {
      return;
    }
    const bookmarks = collectAllBookmarks(bookmarksOrFolders);

    set({
      scanStatus: 'scanning',
      brokenIds: new Set<string>(),
      scanProgress: 0,
      scanTotal: bookmarks.length,
      permissionDenied: false,
    });

    await scanBookmarks(bookmarks, {
      onProgress: (checked, total) => {
        set({ scanProgress: checked, scanTotal: total });
      },
      onBrokenFound: (bookmarkId) => {
        const { brokenIds } = get();
        const next = new Set(brokenIds);
        next.add(bookmarkId);
        set({ brokenIds: next });
      },
      signal: controller.signal,
    });

    // Only transition to 'done' if this scan wasn't cancelled.
    if (!controller.signal.aborted) {
      set({ scanStatus: 'done' });
    }

    releaseController(controller);
  },

  cancelScan: () => {
    activeController?.abort();
    activeController = null;
    set({ scanStatus: 'done' });
  },

  clearResults: () => {
    set({
      scanStatus: 'idle',
      brokenIds: new Set<string>(),
      scanProgress: 0,
      scanTotal: 0,
      permissionDenied: false,
    });
  },
}));
