import { BookmarkManagerState, BookmarkManagerAction } from '../types/types';

export const bookmarkManagerReducer = (
  state: BookmarkManagerState, 
  action: BookmarkManagerAction
): BookmarkManagerState => {
  switch (action.type) {
    case 'SET_BOOKMARKS':
      return {
        ...state,
        bookmarks: action.payload,
        isLoading: false
      };
    case 'SET_VISIBLE_FOLDER_IDS':
      return {
        ...state,
        visibleFolderIds: action.payload
      };
    case 'NAVIGATE_TO_FOLDER': {
      const { id, parentId } = action.payload;
      const parentIndex = state.visibleFolderIds.indexOf(parentId);
      if (parentIndex !== -1) {
        const updatedFolderIds = [...state.visibleFolderIds];
        updatedFolderIds[parentIndex] = id;
        return {
          ...state,
          visibleFolderIds: updatedFolderIds
        };
      }
      return state;
    }
    case 'NAVIGATE_TO_PARENT': {
      const { id, parentId } = action.payload;
      const index = state.visibleFolderIds.indexOf(id);
      if (index !== -1) {
        const updatedFolderIds = [...state.visibleFolderIds];
        updatedFolderIds[index] = parentId;
        return {
          ...state,
          visibleFolderIds: updatedFolderIds
        };
      }
      return state;
    }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false
      };
    default:
      return state;
  }
};