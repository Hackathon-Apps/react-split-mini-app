import React from "react";
import styled, { keyframes, css } from "styled-components";

// Reusable inline spinner
export type SpinnerProps = {
    /** Diameter in px */
    size?: number;
    /** Thickness in px */
    stroke?: number;
    /** Accessible label (aria) */
    label?: string;
    /** Inherit currentColor if true */
    inheritColor?: boolean;
    className?: string;
    style?: React.CSSProperties;
};

const spin = keyframes`
  to { transform: rotate(360deg); }
`;

const SpinnerRoot = styled.span<Required<Pick<SpinnerProps, "size" | "stroke" | "inheritColor">>>`
  display: inline-block;
  width: ${(p) => p.size}px;
  height: ${(p) => p.size}px;
  border-radius: 50%;
  border: ${(p) => p.stroke}px solid
    ${(p) => (p.inheritColor ? "currentColor" : "rgba(0,0,0,0.15)")};
  border-top-color: ${(p) => (p.inheritColor ? "currentColor" : "#4b9cff")};
  animation: ${spin} 0.7s linear infinite;

  /* dark mode tweak if not inheriting color */
  ${(p) =>
    !p.inheritColor &&
    css`
      @media (prefers-color-scheme: dark) {
        border-color: rgba(255, 255, 255, 0.15);
        border-top-color: #8ab4ff;
      }
    `}
`;

export const Spinner: React.FC<SpinnerProps> = ({
                                                    size = 24,
                                                    stroke = 3,
                                                    label = "Loading",
                                                    inheritColor = false,
                                                    className,
                                                    style,
                                                }) => (
    <SpinnerRoot
        role="progressbar"
        aria-label={label}
        aria-busy="true"
        size={size}
        stroke={stroke}
        inheritColor={inheritColor}
        className={className}
        style={style}
    />
);

// Fullscreen / container overlay with spinner + optional text
export type LoadingOverlayProps = {
    /** Show/Hide overlay */
    open?: boolean;
    /** Fill entire viewport (fixed) or parent (absolute) */
    fullscreen?: boolean;
    /** Blur and dim background */
    backdrop?: boolean;
    /** Optional helper text under the spinner */
    text?: string;
    /** Pass-through spinner props */
    spinnerSize?: number;
    spinnerStroke?: number;
    className?: string;
    style?: React.CSSProperties;
};

const Backdrop = styled.div<Required<Pick<LoadingOverlayProps, "open" | "fullscreen" | "backdrop">>>`
  position: ${(p) => (p.fullscreen ? "fixed" : "absolute")};
  inset: 0;
  display: ${(p) => (p.open ? "flex" : "none")};
  align-items: center;
  justify-content: center;
  z-index: 999;
  ${(p) =>
    p.backdrop
        ? css`
          background: rgba(0, 0, 0, 0.35);
          @media (prefers-color-scheme: dark) {
            background: rgba(0, 0, 0, 0.45);
          }
        `
        : css`
          pointer-events: none; /* let clicks go through if no backdrop */
        `}
`;

const Card = styled.div`
  min-width: 140px;
  max-width: 80vw;
  padding: 16px 18px;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  color: var(--text);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
`;

const Text = styled.div`
  font-size: 14px;
  opacity: 0.8;
  text-align: center;
`;

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
                                                                  open = true,
                                                                  fullscreen = true,
                                                                  backdrop = true,
                                                                  text,
                                                                  spinnerSize = 28,
                                                                  spinnerStroke = 3,
                                                                  className,
                                                                  style,
                                                              }) => (
    <Backdrop
        role="alert"
        aria-live="polite"
        aria-busy={open}
        open={open}
        fullscreen={fullscreen}
        backdrop={backdrop}
        className={className}
        style={style}
    >
        <Card>
            <Spinner size={spinnerSize} stroke={spinnerStroke} />
            {text ? <Text>{text}</Text> : null}
        </Card>
    </Backdrop>
);

// Helper: wrap content to show overlay above it when open=false it renders children as-is
export const WithLoading: React.FC<{
    loading: boolean;
    text?: string;
    children: React.ReactNode;
}> = ({ loading, text, children }) => (
    <div style={{ position: "relative" }}>
        {children}
        <LoadingOverlay open={loading} fullscreen={false} backdrop text={text} />
    </div>
);

export default LoadingOverlay;
