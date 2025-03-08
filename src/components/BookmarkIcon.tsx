import styled from 'styled-components';
import { BookmarkIconProps } from '../types/types';
import { FOLDER_ICON_URL } from '../utils/bookmarkUtils';
import { theme } from '../styles/theme';

export const BookmarkIcon = (props: BookmarkIconProps) => {
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

const IconImage = styled.img`
  width: ${theme.iconSize.md};
  height: ${theme.iconSize.md};
`;