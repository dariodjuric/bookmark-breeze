import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { isRootFolder } from '@/lib/chrome-bookmarks'
import { cn } from '@/lib/utils'
import type { Bookmark } from '@/types/bookmark'
import {
  ArrowDownAZ,
  ChevronRight,
  ExternalLink,
  Folder,
  FolderOpen,
  FolderPlus,
  GripVertical,
  Trash2,
} from 'lucide-react'
import type React from 'react'
import { useEffect, useRef, useState } from 'react'

interface BookmarkItemProps {
  bookmark: Bookmark
  depth: number
  onUpdate: (id: string, updates: Partial<Bookmark>) => void
  onDelete: (id: string) => void
  onAddFolder: (parentId: string, folderName: string) => void
  onSortFolder: (folderId: string) => void
  onDragStart: (e: React.DragEvent, bookmark: Bookmark) => void
  onDragOver: (e: React.DragEvent, bookmark: Bookmark) => void
  onDrop: (e: React.DragEvent, targetBookmark: Bookmark) => void
  onDragEnd: () => void
  isDragOver: boolean
  dragOverId: string | null
  editingId: string | null
  onSetEditingId: (id: string | null) => void
  onHover: (id: string | null) => void
}

export function BookmarkItem({
  bookmark,
  depth,
  onUpdate,
  onDelete,
  onAddFolder,
  onSortFolder,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragOverId,
  editingId,
  onSetEditingId,
  onHover,
}: BookmarkItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [editTitle, setEditTitle] = useState(bookmark.title)
  const [editUrl, setEditUrl] = useState(bookmark.url || '')
  const [isAddFolderOpen, setIsAddFolderOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const titleInputRef = useRef<HTMLInputElement>(null)
  const folderNameInputRef = useRef<HTMLInputElement>(null)

  // Count total bookmarks in a folder (recursive)
  const countDescendants = (bm: Bookmark): number => {
    if (!bm.isFolder || !bm.children) return 0
    return bm.children.reduce(
      (count, child) => count + 1 + countDescendants(child),
      0
    )
  }

  // Check if this is a root folder that can't be edited/deleted
  const isRoot = isRootFolder(bookmark.id)
  const isEditing = editingId === bookmark.id

  useEffect(() => {
    if (isEditing) {
      // Use setTimeout to ensure the input is rendered before focusing
      const timer = setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus()
          const len = titleInputRef.current.value.length
          titleInputRef.current.setSelectionRange(len, len)
        }
      }, 0)
      return () => clearTimeout(timer)
    }
  }, [isEditing])

  // Reset edit values when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setEditTitle(bookmark.title)
      setEditUrl(bookmark.url || '')
    }
  }, [isEditing, bookmark.title, bookmark.url])

  const handleSave = () => {
    if (isRoot) return
    onUpdate(bookmark.id, {
      title: editTitle,
      url: bookmark.isFolder ? undefined : editUrl,
    })
  }

  const handleCancel = () => {
    onSetEditingId(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation()
      handleSave()
    } else if (e.key === 'Escape') {
      e.stopPropagation()
      handleCancel()
    }
  }

  const handleAddFolderSubmit = () => {
    if (newFolderName.trim()) {
      onAddFolder(bookmark.id, newFolderName.trim())
      setNewFolderName('')
      setIsAddFolderOpen(false)
    }
  }

  const handleAddFolderKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddFolderSubmit()
    }
  }

  const isDragOverThis = dragOverId === bookmark.id

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors',
          'hover:bg-accent',
          isDragOverThis && bookmark.isFolder && 'bg-accent ring-2 ring-primary'
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        draggable={!isEditing && !isRoot}
        onDragStart={(e) => onDragStart(e, bookmark)}
        onDragOver={(e) => onDragOver(e, bookmark)}
        onDrop={(e) => onDrop(e, bookmark)}
        onDragEnd={onDragEnd}
        onMouseEnter={() => onHover(bookmark.id)}
        onMouseLeave={() => onHover(null)}
      >
        {!isRoot && (
          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        {isRoot && <div className="w-4" />}

        {bookmark.isFolder ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground"
          >
            <ChevronRight
              className={cn(
                'h-4 w-4 transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-amber-500" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 pl-5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${
                bookmark.url ? new URL(bookmark.url).hostname : ''
              }&sz=16`}
              alt=""
              className="h-4 w-4"
            />
          </div>
        )}

        {isEditing && !isRoot ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title"
              className="h-7 flex-1"
            />
            {!bookmark.isFolder && (
              <Input
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="URL"
                className="h-7 flex-1"
              />
            )}
            <Button
              type="button"
              size="sm"
              className="h-7 px-2"
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 px-2 bg-transparent"
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
            <button
              onClick={() => !isRoot && onSetEditingId(bookmark.id)}
              className={cn(
                'flex flex-1 items-center gap-2 text-left min-w-0',
                !isRoot && !bookmark.isFolder && 'cursor-pointer',
                isRoot && 'cursor-default'
              )}
            >
              <span className="truncate max-w-48">{bookmark.title}</span>
              {!bookmark.isFolder && bookmark.url && (
                <span className="truncate max-w-72 text-xs text-muted-foreground">
                  {bookmark.url}
                </span>
              )}
            </button>
            {!bookmark.isFolder && bookmark.url && (
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  window.open(bookmark.url, '_blank', 'noopener,noreferrer')
                }}
                title="Open in new tab"
              >
                <ExternalLink className="size-4 text-muted-foreground" />
              </Button>
            )}
          </>
        )}

        {!isEditing && bookmark.isFolder && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                onSortFolder(bookmark.id)
              }}
              title="Sort by name"
            >
              <ArrowDownAZ className="size-4 text-muted-foreground" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation()
                setIsAddFolderOpen(true)
              }}
            >
              <FolderPlus className="size-4 text-muted-foreground" />
            </Button>
          </>
        )}
        {!isEditing && !isRoot && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>

      {bookmark.isFolder && isExpanded && bookmark.children && (
        <div>
          {bookmark.children.map((child) => (
            <BookmarkItem
              key={child.id}
              bookmark={child}
              depth={depth + 1}
              onUpdate={onUpdate}
              onDelete={onDelete}
              onAddFolder={onAddFolder}
              onSortFolder={onSortFolder}
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              isDragOver={dragOverId === child.id}
              dragOverId={dragOverId}
              editingId={editingId}
              onSetEditingId={onSetEditingId}
              onHover={onHover}
            />
          ))}
        </div>
      )}

      <Dialog open={isAddFolderOpen} onOpenChange={setIsAddFolderOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              ref={folderNameInputRef}
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={handleAddFolderKeyDown}
              placeholder="Folder name"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddFolderOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddFolderSubmit}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              Delete {bookmark.isFolder ? 'Folder' : 'Bookmark'}?
            </DialogTitle>
            <DialogDescription>
              {bookmark.isFolder
                ? (() => {
                    const count = countDescendants(bookmark)
                    return count > 0
                      ? `This folder contains ${count} bookmark${
                          count === 1 ? '' : 's'
                        }. All items will be permanently deleted.`
                      : 'This empty folder will be permanently deleted.'
                  })()
                : 'This bookmark will be permanently deleted.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              autoFocus
              onClick={() => {
                onDelete(bookmark.id)
                setIsDeleteDialogOpen(false)
              }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
