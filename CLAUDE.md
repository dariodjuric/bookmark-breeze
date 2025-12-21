# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev      # Start development server
pnpm build    # Production build
pnpm lint     # Run ESLint
pnpm start    # Start production server
```

## Architecture

This is a Next.js 16 bookmark manager app using the App Router, React 19, Tailwind CSS 4, and shadcn/ui components.

### Key Files

- `types/bookmark.ts` - Core `Bookmark` interface (id, title, url, isFolder, children, parentId)
- `components/bookmark-tree.tsx` - Main bookmark manager with drag-and-drop, CRUD operations, and recursive tree state management
- `components/bookmark-item.tsx` - Recursive component for individual bookmarks/folders with inline editing
- `lib/sample-bookmarks.ts` - Demo data structure
- `components/ui/` - shadcn/ui component library

### State Management

All bookmark state is managed in `BookmarkTree` via useState with recursive helper functions:

- `findBookmarkById`, `removeBookmarkById`, `updateBookmarkById`, `addBookmarkToFolder`

These recursively traverse the tree structure for all operations.

### Styling

Uses Tailwind CSS 4 with PostCSS. The `cn()` utility in `lib/utils.ts` combines clsx and tailwind-merge for conditional class names.

## Notes

- TypeScript build errors are ignored in `next.config.mjs` (`ignoreBuildErrors: true`)
- Images are unoptimized for simpler deployment
- Uses pnpm as package manager
