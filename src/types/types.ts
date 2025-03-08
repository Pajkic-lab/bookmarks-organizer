export type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

export interface ExtendedBookmarkNode extends BookmarkNode {
  isVirtual?: boolean;
}

export type NavigationHeaderProps = {
  bookmark: ExtendedBookmarkNode | null,
  folderId: string,
  allBookmarks: ExtendedBookmarkNode[],
  navigateToParent: (currentId: string, parentId: string | undefined) => void
}

export type BookmarkIconProps = {
  bookmark: ExtendedBookmarkNode
}

export type TooltipContentProps = {
  fullName: string
}

export interface BookmarkManagerState {
  bookmarks: ExtendedBookmarkNode[];
  visibleFolderIds: string[];
  isLoading: boolean;
  error: string | null;
}

export type BookmarkManagerAction = 
  | { type: 'SET_BOOKMARKS'; payload: ExtendedBookmarkNode[] }
  | { type: 'SET_VISIBLE_FOLDER_IDS'; payload: string[] }
  | { type: 'NAVIGATE_TO_FOLDER'; payload: { id: string; parentId: string } }
  | { type: 'NAVIGATE_TO_PARENT'; payload: { id: string; parentId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };