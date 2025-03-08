import styled from 'styled-components';
import { TooltipContentProps } from '../types/types';
import { theme } from '../styles/theme';

export const TooltipContent = (props: TooltipContentProps) => {
  const { fullName } = props;
  return (
    <TooltipContainer>
      <TooltipText>{fullName}</TooltipText>
    </TooltipContainer>
  );
};

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