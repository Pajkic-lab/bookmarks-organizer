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
  // MasonryContainer,
  LoadingMessage,
  ErrorMessage,
  FolderPanel,
  BookmarkGrid,
  BookmarkItem,
  BookmarkTitle
} from '../styles/styledComponents';
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"

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

  if (isLoading) {
    return <LoadingMessage>Loading bookmarks...</LoadingMessage>;
  }

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  return (
    <Container>
      <ResponsiveMasonry
          columnsCountBreakPoints={{750: 1, 900: 2, 1200: 3, 1400: 3, 1600: 4, 1800: 5, 2000: 4, 2200: 5, 2400: 6, 2600: 7, 2800: 8, 3000: 9}}
      >
        <Masonry>
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
        </Masonry>
      </ResponsiveMasonry>
     </Container>
  );
};