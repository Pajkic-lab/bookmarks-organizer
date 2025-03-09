import styled from 'styled-components';
import { theme } from './theme';


export const Container = styled.div`
  padding: ${theme.spacing.md};
  width: 98%;
  `;

export const LoadingMessage = styled.div`
  color: ${theme.colors.text};
  font-size: ${theme.fontSize.lg};
  text-align: center;
  padding: ${theme.spacing.xl};
`;

export const ErrorMessage = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.fontSize.lg};
  text-align: center;
  padding: ${theme.spacing.xl};
`;

export const FolderPanel = styled.div`
  background-color: ${theme.colors.background};
  border-radius: ${theme.borderRadius.lg};
  margin: ${theme.spacing.md};
`;

export const BookmarkGrid = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.xxl};
  display: grid;
  grid-template-columns: repeat(${theme.grid.columns}, 1fr); 
  gap: ${theme.grid.gap}; 
  justify-items: center; 
  align-items: center;
`;

export const BookmarkItem = styled.div`
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

export const BookmarkTitle = styled.span`
  color: ${theme.colors.text};
`;