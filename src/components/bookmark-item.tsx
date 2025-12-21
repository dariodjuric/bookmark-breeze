import type React from "react"
import { useState, useRef, useEffect } from "react"
import type { Bookmark } from "@/types/bookmark"
import { ChevronRight, Folder, FolderOpen, Link, Trash2, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { isRootFolder } from "@/lib/chrome-bookmarks"

interface BookmarkItemProps {
  bookmark: Bookmark
  depth: number
  onUpdate: (id: string, updates: Partial<Bookmark>) => void
  onDelete: (id: string) => void
  onDragStart: (e: React.DragEvent, bookmark: Bookmark) => void
  onDragOver: (e: React.DragEvent, bookmark: Bookmark) => void
  onDrop: (e: React.DragEvent, targetBookmark: Bookmark) => void
  onDragEnd: () => void
  isDragOver: boolean
  dragOverId: string | null
}

export function BookmarkItem({
  bookmark,
  depth,
  onUpdate,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  dragOverId,
}: BookmarkItemProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState(bookmark.title)
  const [editUrl, setEditUrl] = useState(bookmark.url || "")
  const titleInputRef = useRef<HTMLInputElement>(null)

  // Check if this is a root folder that can't be edited/deleted
  const isRoot = isRootFolder(bookmark.id)

  useEffect(() => {
    if (isEditing && titleInputRef.current) {
      titleInputRef.current.focus()
    }
  }, [isEditing])

  const handleSave = () => {
    if (isRoot) return
    onUpdate(bookmark.id, {
      title: editTitle,
      url: bookmark.isFolder ? undefined : editUrl,
    })
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditTitle(bookmark.title)
    setEditUrl(bookmark.url || "")
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave()
    } else if (e.key === "Escape") {
      handleCancel()
    }
  }

  const isDragOverThis = dragOverId === bookmark.id

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors",
          "hover:bg-accent",
          isDragOverThis && bookmark.isFolder && "bg-accent ring-2 ring-primary",
        )}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        draggable={!isEditing && !isRoot}
        onDragStart={(e) => onDragStart(e, bookmark)}
        onDragOver={(e) => onDragOver(e, bookmark)}
        onDrop={(e) => onDrop(e, bookmark)}
        onDragEnd={onDragEnd}
      >
        {!isRoot && (
          <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        )}
        {isRoot && <div className="w-4" />}

        {bookmark.isFolder ? (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            <ChevronRight className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-90")} />
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-amber-500" />
            ) : (
              <Folder className="h-4 w-4 text-amber-500" />
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 pl-5">
            <Link className="h-4 w-4 text-muted-foreground" />
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
            <Button size="sm" className="h-7 px-2" onClick={handleSave}>
              Save
            </Button>
            <Button size="sm" variant="outline" className="h-7 px-2 bg-transparent" onClick={handleCancel}>
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => !isRoot && setIsEditing(true)}
            className={cn(
              "flex flex-1 items-center gap-2 text-left",
              isRoot && "cursor-default"
            )}
          >
            <span className="truncate">{bookmark.title}</span>
            {!bookmark.isFolder && bookmark.url && (
              <span className="truncate text-xs text-muted-foreground">{bookmark.url}</span>
            )}
          </button>
        )}

        {!isEditing && !isRoot && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation()
              onDelete(bookmark.id)
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
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
              onDragStart={onDragStart}
              onDragOver={onDragOver}
              onDrop={onDrop}
              onDragEnd={onDragEnd}
              isDragOver={dragOverId === child.id}
              dragOverId={dragOverId}
            />
          ))}
        </div>
      )}
    </div>
  )
}
