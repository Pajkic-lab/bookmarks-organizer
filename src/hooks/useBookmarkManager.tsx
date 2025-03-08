import { useEffect, useReducer } from 'react';
import { ExtendedBookmarkNode } from '../types/types';
import { bookmarkManagerReducer } from '../reducers/bookmarkManagerReducer';
import { processTopLevelBookmarks, findBookmarkById } from '../utils/bookmarkUtils';

export const useBookmarkManager = () => {
  const [state, dispatch] = useReducer(bookmarkManagerReducer, {
    bookmarks: [],
    visibleFolderIds: [],
    isLoading: true,
    error: null
  });
  
  const { bookmarks, visibleFolderIds, isLoading, error } = state;

  const navigateToFolder = (id: string, parentId: string | undefined) => {
    if (parentId) {
      dispatch({ type: 'NAVIGATE_TO_FOLDER', payload: { id, parentId } });
    }
  };

  const navigateToParent = (id: string, parentId: string | undefined) => {
    if (!parentId) return;
    const parentBookmark = findBookmarkById(bookmarks, parentId);
    if (!parentBookmark) return;
    
    dispatch({ type: 'NAVIGATE_TO_PARENT', payload: { id, parentId } });
  };

  const handleBookmarkClick = (bookmark: ExtendedBookmarkNode, event: React.MouseEvent) => {
    const openInNewTab = event.button === 1 || event.shiftKey;
    
    if (bookmark.url) {
      if (openInNewTab) {
        if (chrome?.tabs) {
          chrome.tabs.create({ url: bookmark.url, active: false });
        } else {
          window.open(bookmark.url, '_blank');
        }
        event.preventDefault();
      } else {
        window.open(bookmark.url, '_self');
      }
    } else if (bookmark.children) {
      navigateToFolder(bookmark.id, bookmark.parentId);
    }
  };

  const handleBookmarkInteraction = (
    bookmark: ExtendedBookmarkNode,
    event: React.MouseEvent
  ) => {
    if (event.type === 'mousedown' && event.button === 1) {
      handleBookmarkClick(bookmark, event);
      event.preventDefault();
    } else if (event.type === 'click') {
      handleBookmarkClick(bookmark, event); 
    }
  };

  useEffect(() => {
    if (chrome?.bookmarks) {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        chrome.bookmarks.getTree((tree) => {
          const rootBookmarks = tree[0]?.children?.[0]?.children || [];
          const processedBookmarks = processTopLevelBookmarks(rootBookmarks);
          dispatch({ type: 'SET_BOOKMARKS', payload: processedBookmarks });
          const initialVisibleFolderIds = processedBookmarks.map((folder) => folder.id);
          dispatch({ type: 'SET_VISIBLE_FOLDER_IDS', payload: initialVisibleFolderIds });
        });
      } catch (err) {
        dispatch({ 
          type: 'SET_ERROR', 
          payload: err instanceof Error ? err.message : 'Failed to load bookmarks' 
        });
      }
    }
  }, []);

  return {
    bookmarks,
    visibleFolderIds,
    isLoading,
    error,
    navigateToFolder,
    navigateToParent,
    handleBookmarkInteraction
  };
};