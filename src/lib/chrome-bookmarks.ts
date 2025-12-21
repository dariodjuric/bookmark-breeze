import type { Bookmark } from '../types/bookmark'

// Convert Chrome's BookmarkTreeNode to our Bookmark type
export function mapChromeBookmark(node: chrome.bookmarks.BookmarkTreeNode): Bookmark {
  return {
    id: node.id,
    title: node.title,
    url: node.url,
    isFolder: !node.url,
    children: node.children?.map(mapChromeBookmark),
    parentId: node.parentId ?? null,
  }
}

// Fetch all bookmarks from Chrome
export async function fetchBookmarks(): Promise<Bookmark[]> {
  const tree = await chrome.bookmarks.getTree()
  // The root node (id "0") contains the main bookmark folders
  // We return its children which are the top-level folders
  const rootChildren = tree[0]?.children || []
  return rootChildren.map(mapChromeBookmark)
}

// Create a new bookmark or folder
export async function createBookmark(
  parentId: string,
  title: string,
  url?: string
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return chrome.bookmarks.create({
    parentId,
    title,
    url,
  })
}

// Update a bookmark's title and/or URL
export async function updateBookmark(
  id: string,
  changes: { title?: string; url?: string }
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return chrome.bookmarks.update(id, changes)
}

// Delete a bookmark (use removeTree for folders with children)
export async function deleteBookmark(id: string, isFolder: boolean): Promise<void> {
  if (isFolder) {
    await chrome.bookmarks.removeTree(id)
  } else {
    await chrome.bookmarks.remove(id)
  }
}

// Move a bookmark to a new parent folder
export async function moveBookmark(
  id: string,
  destination: { parentId: string; index?: number }
): Promise<chrome.bookmarks.BookmarkTreeNode> {
  return chrome.bookmarks.move(id, destination)
}

// Sort bookmarks in a folder alphabetically by title
export async function sortFolderByName(folderId: string): Promise<void> {
  const results = await chrome.bookmarks.getChildren(folderId)

  // Sort: folders first, then bookmarks, both alphabetically by title
  const sorted = [...results].sort((a, b) => {
    const aIsFolder = !a.url
    const bIsFolder = !b.url
    if (aIsFolder && !bIsFolder) return -1
    if (!aIsFolder && bIsFolder) return 1
    return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' })
  })

  // Move each bookmark to its new position
  for (let i = 0; i < sorted.length; i++) {
    await chrome.bookmarks.move(sorted[i].id, { parentId: folderId, index: i })
  }
}

// Check if a bookmark ID is a special Chrome root folder (cannot be edited/deleted)
export function isRootFolder(id: string): boolean {
  // "0" is the root, "1" is Bookmarks Bar, "2" is Other Bookmarks
  // Some browsers also have "3" for Mobile Bookmarks
  return ['0', '1', '2', '3'].includes(id)
}

// Get the display name for root folders
export function getRootFolderName(id: string): string {
  switch (id) {
    case '1':
      return 'Bookmarks Bar'
    case '2':
      return 'Other Bookmarks'
    case '3':
      return 'Mobile Bookmarks'
    default:
      return 'Bookmarks'
  }
}
