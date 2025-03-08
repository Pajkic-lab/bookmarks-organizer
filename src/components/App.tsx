import { useMemo } from 'react';
import Tippy from '@tippyjs/react';
import { useBookmarkManager } from '../hooks/useBookmarkManager';
import { findBookmarkById } from '../utils/bookmarkUtils';
import { NavigationHeader } from './NavigationHeader';
import { BookmarkIcon } from './BookmarkIcon';
import { TooltipContent } from './TooltipContent';
import { truncateText } from '../utils/bookmarkUtils';
import { theme } from '../styles/theme';
import {
  Container,
  MasonryContainer,
  LoadingMessage,
  ErrorMessage,
  FolderPanel,
  BookmarkGrid,
  BookmarkItem,
  BookmarkTitle
} from '../styles/styledComponents';

/**
 MasonryContainer is not good choice, find alternative, 
 its massing with css and its not responsive, it requires hardcoded number of columns
 */
export const App = () => {
  const {
    bookmarks,
    visibleFolderIds,
    isLoading,
    error,
    navigateToParent,
    handleBookmarkInteraction
  } = useBookmarkManager();
  
  const visibleFolders = useMemo(() => 
    visibleFolderIds.map((folderId) => ({
      folderId,
      bookmark: findBookmarkById(bookmarks, folderId),
    })),
    [visibleFolderIds, bookmarks]
  );

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
                  key={childBookmark.id}
                  delay={[theme.tooltip.delay, 0]}
                  placement="bottom"
                  content={
                    <TooltipContent fullName={childBookmark.title} />
                  }
                >
                  <BookmarkItem
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
};