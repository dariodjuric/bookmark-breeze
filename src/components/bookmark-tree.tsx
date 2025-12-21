import type React from "react"
import { useState, useCallback, useEffect } from "react"
import type { Bookmark } from "@/types/bookmark"
import { BookmarkItem } from "./bookmark-item"
import { BookmarkPlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  fetchBookmarks,
  createBookmark,
  updateBookmark,
  deleteBookmark,
  moveBookmark,
  sortFolderByName,
  isRootFolder,
} from "@/lib/chrome-bookmarks"

export function BookmarkTree() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [draggedBookmark, setDraggedBookmark] = useState<Bookmark | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks()
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingId(null)
      } else if (e.key === 'Enter' && !editingId && hoveredId && !isRootFolder(hoveredId)) {
        e.preventDefault()
        setEditingId(hoveredId)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [editingId, hoveredId])

  const loadBookmarks = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true)
      setError(null)
      const data = await fetchBookmarks()
      setBookmarks(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load bookmarks')
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  const findBookmarkById = useCallback((id: string, items: Bookmark[]): Bookmark | null => {
    for (const item of items) {
      if (item.id === id) return item
      if (item.children) {
        const found = findBookmarkById(id, item.children)
        if (found) return found
      }
    }
    return null
  }, [])

  const handleUpdate = useCallback(
    async (id: string, updates: Partial<Bookmark>) => {
      // Don't allow updating root folders
      if (isRootFolder(id)) return

      try {
        await updateBookmark(id, {
          title: updates.title,
          url: updates.url,
        })
        setEditingId(null)
        await loadBookmarks(false)
      } catch (err) {
        console.error('Failed to update bookmark:', err)
      }
    },
    [],
  )

  const handleDelete = useCallback(
    async (id: string) => {
      // Don't allow deleting root folders
      if (isRootFolder(id)) return

      try {
        const bookmark = findBookmarkById(id, bookmarks)
        if (bookmark) {
          await deleteBookmark(id, bookmark.isFolder)
          await loadBookmarks(false)
        }
      } catch (err) {
        console.error('Failed to delete bookmark:', err)
      }
    },
    [bookmarks, findBookmarkById],
  )

  const handleDragStart = useCallback((e: React.DragEvent, bookmark: Bookmark) => {
    // Don't allow dragging root folders
    if (isRootFolder(bookmark.id)) {
      e.preventDefault()
      return
    }
    setDraggedBookmark(bookmark)
    e.dataTransfer.effectAllowed = "move"
  }, [])

  const handleDragOver = useCallback(
    (e: React.DragEvent, bookmark: Bookmark) => {
      e.preventDefault()
      if (bookmark.isFolder && draggedBookmark?.id !== bookmark.id) {
        setDragOverId(bookmark.id)
      }
    },
    [draggedBookmark],
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent, targetBookmark: Bookmark) => {
      e.preventDefault()
      setDragOverId(null)

      if (!draggedBookmark || draggedBookmark.id === targetBookmark.id) {
        return
      }

      // Don't allow dragging root folders
      if (isRootFolder(draggedBookmark.id)) {
        return
      }

      // Prevent dropping a folder into itself or its children
      const isDescendant = (parent: Bookmark, childId: string): boolean => {
        if (parent.id === childId) return true
        if (parent.children) {
          return parent.children.some((child) => isDescendant(child, childId))
        }
        return false
      }

      if (draggedBookmark.isFolder && isDescendant(draggedBookmark, targetBookmark.id)) {
        return
      }

      if (targetBookmark.isFolder) {
        try {
          await moveBookmark(draggedBookmark.id, { parentId: targetBookmark.id })
          await loadBookmarks(false)
        } catch (err) {
          console.error('Failed to move bookmark:', err)
        }
      }
    },
    [draggedBookmark],
  )

  const handleDragEnd = useCallback(() => {
    setDraggedBookmark(null)
    setDragOverId(null)
  }, [])

  const handleAddBookmark = async () => {
    try {
      // Add to the first folder (Bookmarks Bar) by default
      const parentId = bookmarks[0]?.id || '1'
      await createBookmark(parentId, "New Bookmark", "https://example.com")
      await loadBookmarks(false)
    } catch (err) {
      console.error('Failed to create bookmark:', err)
    }
  }

  const handleAddFolder = useCallback(async (parentId: string, folderName: string) => {
    try {
      await createBookmark(parentId, folderName)
      await loadBookmarks(false)
    } catch (err) {
      console.error('Failed to create folder:', err)
    }
  }, [])

  const handleSortFolder = useCallback(async (folderId: string) => {
    try {
      await sortFolderByName(folderId)
      await loadBookmarks(false)
    } catch (err) {
      console.error('Failed to sort folder:', err)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-destructive">
        <p>Error: {error}</p>
        <Button variant="outline" className="mt-4" onClick={() => loadBookmarks()}>
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleAddBookmark}>
          <BookmarkPlus className="mr-2 h-4 w-4" />
          Add Bookmark
        </Button>
      </div>
      <div className="rounded-lg border bg-card" onDragOver={(e) => e.preventDefault()}>
        {bookmarks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <p>No bookmarks yet</p>
            <p className="text-sm">Add a bookmark or folder to get started</p>
          </div>
        ) : (
          bookmarks.map((bookmark) => (
            <BookmarkItem
              key={bookmark.id}
              bookmark={bookmark}
              depth={0}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onAddFolder={handleAddFolder}
              onSortFolder={handleSortFolder}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragOver={dragOverId === bookmark.id}
              dragOverId={dragOverId}
              editingId={editingId}
              onSetEditingId={setEditingId}
              onHover={setHoveredId}
            />
          ))
        )}
      </div>
    </div>
  )
}
