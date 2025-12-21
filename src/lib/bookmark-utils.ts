import type { Folder } from '@/types/bookmark'
import { isFolder } from '@/types/bookmark'

// Count total descendants in a folder (recursive)
export function countDescendants(folder: Folder): number {
  return folder.children.reduce((count, child) => {
    if (isFolder(child)) {
      return count + 1 + countDescendants(child)
    }
    return count + 1
  }, 0)
}

// Calculate left padding based on depth
export function getDepthPadding(depth: number): string {
  return `${depth * 20 + 8}px`
}

// Generate favicon URL for a bookmark
export function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`
  } catch {
    return ''
  }
}
