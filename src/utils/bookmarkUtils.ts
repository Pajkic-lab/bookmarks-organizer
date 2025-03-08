import { theme } from '../styles/theme';
import { BookmarkNode, ExtendedBookmarkNode } from '../types/types';

export const FOLDER_ICON_URL = 'https://img.icons8.com/?size=100&id=12160&format=png&color=000000';

export const processTopLevelBookmarks = (bookmarks: BookmarkNode[]): ExtendedBookmarkNode[] => {
  return bookmarks.map(bookmark => {
    if (bookmark.url && !bookmark.children) {
      const virtualFolderId = `virtual-${bookmark.id}`;
      
      const virtualFolder: ExtendedBookmarkNode = {
        id: virtualFolderId,
        title: bookmark.title,
        parentId: bookmark.parentId,
        dateAdded: bookmark.dateAdded,
        index: bookmark.index,
        isVirtual: true,
        children: [{
          ...bookmark,
          parentId: virtualFolderId
        }]
      };
      
      return virtualFolder;
    }
    
    return bookmark;
  });
};

export const findBookmarkById = (bookmarks: ExtendedBookmarkNode[], targetId: string): ExtendedBookmarkNode | null => {
  for (const bookmark of bookmarks) {
    if (bookmark.id === targetId) {
      return bookmark;
    }
    if (bookmark.children && Array.isArray(bookmark.children)) {
      const found = findBookmarkById(bookmark.children as ExtendedBookmarkNode[], targetId);
      if (found) {
        return found;
      }
    }
  }
  return null;
};

export const truncateText = (text: string): string => {
  if (!text) return '';
  if (text.length > theme.truncate.maxLength) {
    return text.slice(0, theme.truncate.maxLength) + '...';
  }
  return text;
};