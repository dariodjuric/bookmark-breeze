import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useInlineEdit } from '@/hooks/use-inline-edit'
import { getDepthPadding, getFaviconUrl } from '@/lib/bookmark-utils'
import { cn } from '@/lib/utils'
import { useBookmarkStore } from '@/stores/bookmark-store'
import type { Bookmark } from '@/types/bookmark'
import { ExternalLink, GripVertical, Trash2 } from 'lucide-react'
import { useState } from 'react'
import DeleteDialog from './dialogs/delete-dialog'

interface BookmarkNodeProps {
  bookmark: Bookmark
  depth: number
}

export default function BookmarkNode({ bookmark, depth }: BookmarkNodeProps) {
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const startEditing = useBookmarkStore((state) => state.startEditing)
  const removeBookmark = useBookmarkStore((state) => state.removeBookmark)
  const startDragging = useBookmarkStore((state) => state.startDragging)
  const endDrag = useBookmarkStore((state) => state.endDrag)
  const setHoveredBookmark = useBookmarkStore(
    (state) => state.setHoveredBookmark
  )
  const clearHoveredBookmark = useBookmarkStore(
    (state) => state.clearHoveredBookmark
  )

  const {
    isEditing,
    editTitle,
    setEditTitle,
    editUrl,
    setEditUrl,
    titleInputRef,
    handleSave,
    handleCancel,
    handleKeyDown,
  } = useInlineEdit({
    bookmark,
    isRoot: false,
  })

  const handleDragStart = (e: React.DragEvent) => {
    startDragging(bookmark)
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div className="select-none">
      <div
        className={cn(
          'group flex items-center gap-1 rounded-md px-2 py-1.5 transition-colors',
          'hover:bg-accent'
        )}
        style={{ paddingLeft: getDepthPadding(depth) }}
        draggable={!isEditing}
        onDragStart={handleDragStart}
        onDragEnd={endDrag}
        onMouseEnter={() => setHoveredBookmark(bookmark.id)}
        onMouseLeave={clearHoveredBookmark}
      >
        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="flex items-center gap-1 pl-5">
          <img src={getFaviconUrl(bookmark.url)} alt="" className="h-4 w-4" />
        </div>

        {isEditing ? (
          <div className="flex flex-1 items-center gap-2">
            <Input
              ref={titleInputRef}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Title"
              className="h-7 flex-1"
            />
            <Input
              value={editUrl}
              onChange={(e) => setEditUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="URL"
              className="h-7 flex-1"
            />
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
          <button
            onClick={() => startEditing(bookmark.id)}
            className="flex flex-1 items-center gap-2 text-left min-w-0 cursor-pointer"
          >
            <span className="truncate max-w-48">{bookmark.title}</span>
            <div className="flex items-center gap-1 min-w-0">
              <span className="truncate max-w-72 text-xs text-muted-foreground">
                {bookmark.url}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(bookmark.url, '_blank', 'noopener,noreferrer')
                    }}
                  >
                    <ExternalLink className="size-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground" />
                  </span>
                </TooltipTrigger>
                <TooltipContent>Open in new tab</TooltipContent>
              </Tooltip>
            </div>
          </button>
        )}

        {!isEditing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation()
                  setDeleteDialogOpen(true)
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete</TooltipContent>
          </Tooltip>
        )}
      </div>

      <DeleteDialog
        bookmark={bookmark}
        open={isDeleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={() => removeBookmark(bookmark.id)}
      />
    </div>
  )
}
