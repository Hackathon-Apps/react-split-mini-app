import React, { useEffect, useRef } from "react";
import styled from "styled-components";

export type BottomSheetProps = {
    open: boolean;
    onClose: () => void;
    /** Заголовок для ARIA (можно не показывать визуально) */
    ariaTitle?: string;
    /** Контент шапки справа (например, иконка X). Если не передан, рисуем дефолтную X */
    renderClose?: () => React.ReactNode;
    children: React.ReactNode;
    /** Центрировать контент и ограничить ширину (по умолчанию true) */
    container?: boolean;
};

const Backdrop = styled.div<{ open: boolean }>`
  position: fixed; inset: 0;
  background: var(--backdrop);
  opacity: ${(p) => (p.open ? 1 : 0)};
  pointer-events: ${(p) => (p.open ? "auto" : "none")};
  transition: opacity .2s ease;
  z-index: 998;
`;

const Sheet = styled.div<{ open: boolean }>`
  position: fixed; left: 0; right: 0;
  bottom: env(safe-area-inset-bottom);
  transform: translateY(${(p) => (p.open ? "0%" : "110%")});
  transition: transform .24s ease;
  background: var(--surface-2);
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
  z-index: 999;
  pointer-events: ${(p) => (p.open ? "auto" : "none")};
  color: var(--text);
  box-shadow: -8px 24px rgba(0,0,0,.18);;
`;

const Inner = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Handle = styled.div`
  width: 44px; height: 4px; border-radius: 2px;
  background: var(--separator); margin: 0 auto 12px;
`;

const CloseX = styled.button`
  position: absolute; right: 12px; top: 12px;
  width: 32px; height: 32px; border-radius: 10px;
  border: 0; background: color-mix(in oklab, var(--text) 10%, transparent);
  color: inherit; display: inline-flex; align-items: center; justify-content: center;
  &:hover { background: color-mix(in oklab, var(--text) 16%, transparent); }
`;

export default function BottomSheet({
                                        open,
                                        onClose,
                                        ariaTitle = "Dialog",
                                        renderClose,
                                        children,
                                        container = true,
                                    }: BottomSheetProps) {
    const sheetRef = useRef<HTMLDivElement>(null);

    // ESC для закрытия
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
        if (open) document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    // Лочим скролл body когда открыт
    useEffect(() => {
        if (!open) return;
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    // Фокус внутрь шита при открытии (простой focus trap-lite)
    useEffect(() => {
        if (!open) return;
        const el = sheetRef.current;
        if (!el) return;
        const focusable = el.querySelector<HTMLElement>(
            "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        );
        focusable?.focus?.();
    }, [open]);

    return (
        <>
            <Backdrop open={open} onClick={onClose} aria-hidden={!open} data-modal="true" />
            <Sheet
                ref={sheetRef}
                open={open}
                role="dialog"
                aria-modal="true"
                aria-label={ariaTitle}
                aria-hidden={!open}
                data-modal="true"
                data-open={open}
            >
                {container ? <Inner>
                    <Handle />
                    {renderClose ? renderClose() : <CloseX onClick={onClose} aria-label="Close">✕</CloseX>}
                    {children}
                </Inner> : <>
                    <Handle />
                    {renderClose ? renderClose() : <CloseX onClick={onClose} aria-label="Close">✕</CloseX>}
                    {children}
                </>}
            </Sheet>
        </>
    );
}
