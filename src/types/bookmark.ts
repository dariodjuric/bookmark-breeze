export interface Bookmark {
  id: string
  title: string
  url?: string
  isFolder: boolean
  children?: Bookmark[]
  parentId: string | null
}
