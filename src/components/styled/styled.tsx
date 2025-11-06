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
    border-radius: 16px;
    overflow: hidden;
    background: var(--bg-secondary);
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

export const Screen = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
    padding: 0 16px 100px; /* leave space for bottom bar */
`;

export const SummaryCard = styled.div`
    display: grid;
    justify-items: center;
    align-items: center;
    gap: 16px;
    padding: 16px;
`;

export const Actions = styled.div<{ disabled?: boolean }>`
    display: flex;
    width: 100%;
    gap: 8px;
    opacity: ${({disabled}) => (disabled ? 0.5 : 1)};
    pointer-events: ${({disabled}) => (disabled ? "none" : "auto")};
`;

export const PrimaryAction = styled(Button)`
    border-radius: 14px;
    padding: 14px 20px;
    font-size: 16px;
    flex-grow: 2;
    background-color: #2990ff !important;
    color: #ffffff !important;
    font-family: var(--fontSF), serif !important;
    font-weight: 600 !important;
`;

export const PrimaryActionLink = styled.a`
    border-radius: 14px;
    padding: 14px 20px;
    font-size: 16px;
    flex-grow: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    background-color: #2990ff !important;
    color: #ffffff !important;
    font-family: var(--fontSF), serif !important;
    font-weight: 600 !important;
`;

export const IconBtn = styled.button<{ disabled?: boolean }>`
    width: 50px;
    height: 50px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #2990ff;
    color: #2990ff;
    background: #2990ff;
    pointer-events: ${({disabled}) => (disabled ? "none" : "auto")};
`;

export const HistoryHeader = styled.button<{ open?: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: transparent;
    border: 0;
    cursor: pointer;
    color: var(--text-secondary);

    & > span {
        font-weight: 400;
        font-size: 18px;
    }

    & svg {
        transition: transform 250ms ease;
        transform: rotate(${({open}) => (open ? 180 : 0)}deg);
    }
`;

export const HistoryBodyOuter = styled.div`
    overflow: hidden;
`;

export const HistoryBodyInner = styled.div`
`;

export const HistoryItemInfo = styled.div`
    display: flex;
    flex-direction: column;
`

export const InfoScreen = styled.div`
    justify-content: center;
    display: flex;
    align-items: center;
    min-height: 60vh;
    text-align: center;
`