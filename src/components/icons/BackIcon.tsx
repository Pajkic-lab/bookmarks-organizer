import styled from 'styled-components';
import { theme } from '../../styles/theme';

export const BackIcon = () => (
  <BackArrow
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </BackArrow>
);

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