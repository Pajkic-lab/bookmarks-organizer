import styled from 'styled-components';
import Tippy from '@tippyjs/react';
import { NavigationHeaderProps } from '../types/types';
import { findBookmarkById, truncateText } from '../utils/bookmarkUtils';
import { BackIcon } from './icons/BackIcon';
import { TooltipContent } from './TooltipContent';
import { theme } from '../styles/theme';

export const NavigationHeader = (props: NavigationHeaderProps) => {
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
      <>{content}</>
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