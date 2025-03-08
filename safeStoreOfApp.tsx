import { useEffect, useMemo, useReducer } from 'react';
import styled from 'styled-components';
import Masonry from 'react-masonry-css'
import Tippy from '@tippyjs/react';
import { theme } from './theme';

const FOLDER_ICON_URL = 'https://img.icons8.com/?size=100&id=12160&format=png&color=000000';

type BookmarkNode = chrome.bookmarks.BookmarkTreeNode;

interface ExtendedBookmarkNode extends BookmarkNode {
  isVirtual?: boolean;
}

type NavigationHeaderProps = {
  bookmark: ExtendedBookmarkNode | null,
  folderId: string,
  allBookmarks: ExtendedBookmarkNode[],
  navigateToParent: (currentId: string, parentId: string | undefined) => void
}

type BookmarkIconProps = {
  bookmark: ExtendedBookmarkNode
}

type TooltipContentProps = {
  fullName: string
}

interface BookmarkManagerState {
  bookmarks: ExtendedBookmarkNode[];
  visibleFolderIds: string[];
  isLoading: boolean;
  error: string | null;
}

type BookmarkManagerAction = 
  | { type: 'SET_BOOKMARKS'; payload: ExtendedBookmarkNode[] }
  | { type: 'SET_VISIBLE_FOLDER_IDS'; payload: string[] }
  | { type: 'NAVIGATE_TO_FOLDER'; payload: { id: string; parentId: string } }
  | { type: 'NAVIGATE_TO_PARENT'; payload: { id: string; parentId: string } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string };

export const App = () => {
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
  
  const visibleFolders = useMemo(() => 
    visibleFolderIds.map((folderId) => ({
      folderId,
      bookmark: findBookmarkById(bookmarks, folderId),
    })),
    [visibleFolderIds, bookmarks]
  );

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

  const breakpointColumnsObj = {
    default: theme.masonryColumns.default,    
    [parseInt(theme.breakpoints.xl)]: theme.masonryColumns.xl,       
    [parseInt(theme.breakpoints.lg)]: theme.masonryColumns.lg,       
    [parseInt(theme.breakpoints.md)]: theme.masonryColumns.md,       
    [parseInt(theme.breakpoints.sm)]: theme.masonryColumns.sm         
  };

  if (isLoading) {
    return <LoadingMessage>Loading bookmarks...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <Container>
      <MasonryContainer
        breakpointCols={breakpointColumnsObj}
        className="masonry-grid"
        columnClassName="masonry-grid_column"
      >
        {visibleFolders.map(({ folderId, bookmark }) => (
          <FolderPanel key={folderId}>
            <NavigationHeader 
              bookmark={bookmark} 
              folderId={folderId} 
              allBookmarks={bookmarks} 
              navigateToParent={navigateToParent} 
            />
            <BookmarkGrid>
              {bookmark?.children?.map((childBookmark) => (
                <Tippy 
                  delay={[theme.tooltip.delay, 0]}
                  placement="bottom"
                  content={
                  <TooltipContent fullName={childBookmark.title} />
                  }
                >
                  <BookmarkItem
                    key={childBookmark.id}
                    onClick={(e) => handleBookmarkInteraction(childBookmark, e)}
                    onMouseDown={(e) => handleBookmarkInteraction(childBookmark, e)}
                  >
                    <BookmarkIcon bookmark={childBookmark} />
                    <BookmarkTitle>{truncateText(childBookmark.title)}</BookmarkTitle>
                  </BookmarkItem>
                </Tippy>
              ))}
            </BookmarkGrid>
          </FolderPanel>
        ))}
      </MasonryContainer>
    </Container>
  );
}

const NavigationHeader = (props: NavigationHeaderProps) => {
  const { bookmark, folderId, allBookmarks, navigateToParent } = props;
  const parentBookmark = bookmark?.parentId ? findBookmarkById(allBookmarks, bookmark.parentId) : null;
  const bookmarkTitle = bookmark?.title || '';
  const truncatedTitle = bookmark ? truncateText(bookmark.title) : '';
  const isTitleTruncated = bookmarkTitle !== truncatedTitle;
  
  const content = (
    <>
      {parentBookmark && <BackIcon />}
      <FolderName>{truncatedTitle}</FolderName>
    </>
  );
  
  const wrappedContent = isTitleTruncated ? (
    <Tippy 
      delay={[theme.tooltip.delay, 0]}
      placement="bottom"
      content={<TooltipContent fullName={bookmarkTitle} />}
    >
      <span>{content}</span>
    </Tippy>
  ) : content;
  
  return (
    <NavigationButton 
      onClick={() => navigateToParent(folderId, bookmark?.parentId)} 
      hasParent={!!parentBookmark}
    >
      {wrappedContent}
    </NavigationButton>
  );
};

const BookmarkIcon = (props: BookmarkIconProps) => {
  const { bookmark } = props;
  let iconSrc = '';
  
  if (bookmark?.children) {
    iconSrc = FOLDER_ICON_URL;
  } else if (bookmark?.url) {
    iconSrc = `https://www.google.com/s2/favicons?sz=128&domain=${bookmark.url}`;
  }
  
  if (!iconSrc) return null;
  return <IconImage src={iconSrc} alt="icon" />;
};

const TooltipContent = (props: TooltipContentProps) => {
  const { fullName } = props;
  return (
    <TooltipContainer>
      <TooltipText>{fullName}</TooltipText>
    </TooltipContainer>
  )
}

const bookmarkManagerReducer = (state: BookmarkManagerState, action: BookmarkManagerAction): BookmarkManagerState => {
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
}

const processTopLevelBookmarks = (bookmarks: BookmarkNode[]): ExtendedBookmarkNode[] => {
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

const findBookmarkById = (bookmarks: ExtendedBookmarkNode[], targetId: string): ExtendedBookmarkNode | null => {
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

const truncateText = (text: string): string => {
  if (!text) return '';
  if (text.length > theme.truncate.maxLength) {
    return text.slice(0, theme.truncate.maxLength) + '...';
  }
  return text;
};

const BackIcon = () => (
  <BackArrow
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </BackArrow>
);

const MasonryContainer = styled(Masonry)`
  display: flex;
  justify-content: center;
  text-align: center;
  width: 100%;
  
  .masonry-grid_column {
    background-clip: padding-box;
  }

  .masonry-grid {
    display: flex;
    width: 100%;
  }
`;

const Container = styled.div`
  padding: ${theme.spacing.md};
  display: flex;
  justify-content: center;
  align-items: center;
`;

const LoadingMessage = styled.div`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.lg};
  text-align: center;
  padding: ${theme.spacing.xl};
`;

const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.fontSize.lg};
  text-align: center;
  padding: ${theme.spacing.xl};
`;

const BackArrow = styled.svg`
  width: ${theme.iconSize.sm};
  height: ${theme.iconSize.sm};
  fill: none;
  stroke: ${theme.colors.text};
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
  cursor: pointer;
  margin-right: ${theme.spacing.sm};
`;

const FolderPanel = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  margin: ${theme.spacing.md};
`;

const BookmarkGrid = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.xxl};
  display: grid;
  grid-template-columns: repeat(${theme.grid.columns}, 1fr); 
  gap: ${theme.grid.gap}; 
  justify-items: center; 
  align-items: center;
`;

const BookmarkItem = styled.div`
  width: ${theme.bookmarkItem.width};
  height: ${theme.bookmarkItem.height};
  display: flex;
  flex-direction: column;  
  align-items: center;   
  justify-content: center; 
  transition: ${theme.animation.transition}; 
  cursor: pointer;
  border-radius: ${theme.borderRadius.md};

  &:hover {
    background-color: ${theme.colors.hover};
  }
`;

const IconImage = styled.img`
  width: ${theme.iconSize.md};
  height: ${theme.iconSize.md};
`;

const NavigationButton = styled.div<{hasParent: boolean}>`
  padding-left: ${theme.navigation.paddingLeft};
  display: flex;
  align-items: center;
  min-height: ${theme.navigation.minHeight};
  border-radius: ${theme.borderRadius.lg} ${theme.borderRadius.lg} 0 0;
  cursor: default;

  ${(props) => props.hasParent && `
    cursor: pointer;
    transition: ${theme.animation.transition};
    padding-left: ${theme.navigation.parentPaddingLeft};

    &:hover {
      background-color: ${theme.colors.hover};
    }
  `}
`;

const FolderName = styled.span`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.base};
  font-weight: bolder;
`;

const BookmarkTitle = styled.span`
  color: ${theme.colors.text};
`;

const TooltipContainer = styled.div`
  background-color: ${theme.colors.tooltip.background}; 
  border-radius: ${theme.borderRadius.sm};
  padding: ${theme.tooltip.padding};
  max-width: ${theme.tooltip.maxWidth};
  box-shadow: 0 4px 8px rgba(0, 0, 0, ${theme.tooltip.shadowOpacity});
  border: 1px solid ${theme.colors.tooltip.border}; 
`;

const TooltipText = styled.p`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.sm};
  margin: 0;
  text-align: center;
`;