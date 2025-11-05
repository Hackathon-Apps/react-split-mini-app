import styled from "styled-components";

export const Button = styled.button`
  background-color: ${(props) =>
    props.disabled ? "#6e6e6e" : "var(--tg-theme-button-color)"};
  border: 0;
  border-radius: 8px;
  padding: 10px 20px;
  color: var(--tg-theme-button-text-color);
  font-weight: 700;
  cursor: pointer;
  pointer-events: ${(props) => (props.disabled ? "none" : "inherit")};
`;

export const Card = styled.div`
    border: 1px solid #3a3a3a;
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary);
    margin: 0 14px;
`;
export const CardRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 6px 14px; margin: 6px 0;
`;
export const CardRowDivider = styled.div`
    border-bottom: 1px solid var(--separator);
    margin: 12px 14px;
`
export const CardRowName = styled.span`
    color: var(--text-secondary);
    font-size: 18px;
`;
export const CardRowValue = styled.span<{accent?: boolean}>`
    font-weight: 700;
    max-width: 200px;
    color: ${({accent}) => (accent ? "var(--accent)" : "var(--text)")};
`;
export const CardEmpty = styled.div`
  opacity: 0.6; text-align: center; padding: 12px 0;
`;