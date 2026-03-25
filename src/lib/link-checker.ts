import type { Bookmark, BookmarkOrFolder } from '@/types/bookmark';
import { isBookmark, isFolder } from '@/types/bookmark';

export async function requestHostPermission(): Promise<boolean> {
  return chrome.permissions.request({ origins: ['<all_urls>'] });
}

export function collectAllBookmarks(tree: BookmarkOrFolder[]): Bookmark[] {
  const result: Bookmark[] = [];
  for (const node of tree) {
    if (isBookmark(node)) {
      result.push(node);
    } else if (isFolder(node)) {
      result.push(...collectAllBookmarks(node.children));
    }
  }
  return result;
}

function isCheckableUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

async function checkLink(url: string, signal?: AbortSignal): Promise<boolean> {
  if (!isCheckableUrl(url)) {
    return false;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  // Merge the per-request timeout signal with the caller's cancellation signal
  // so the fetch aborts if either the timeout fires or the scan is cancelled.
  const combinedSignal = signal
    ? AbortSignal.any([controller.signal, signal])
    : controller.signal;

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: combinedSignal,
      redirect: 'follow',
    });
    return response.status === 404;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

interface ScanOptions {
  onProgress: (checked: number, total: number) => void;
  onBrokenFound: (bookmarkId: string) => void;
  signal: AbortSignal;
}

export async function scanBookmarks(
  bookmarks: Bookmark[],
  { onProgress, onBrokenFound, signal }: ScanOptions
): Promise<void> {
  const batchSize = 5;
  let checked = 0;
  const total = bookmarks.length;

  for (let i = 0; i < total; i += batchSize) {
    if (signal.aborted) {
      return;
    }

    const batch = bookmarks.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (bookmark) => {
        if (signal.aborted) {
          return;
        }
        const isBroken = await checkLink(bookmark.url, signal);
        if (isBroken && !signal.aborted) {
          onBrokenFound(bookmark.id);
        }
      })
    );

    if (signal.aborted) {
      return;
    }

    checked += results.length;
    onProgress(checked, total);
  }
}
