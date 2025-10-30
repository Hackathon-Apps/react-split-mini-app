// src/state/uiState.tsx
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

type UIState = {
    isEditing: boolean;
    isModalOpen: boolean;
};

const UIStateCtx = createContext<UIState | null>(null);

function detectEditing(el: HTMLElement | null) {
    if (!el) return false;
    const tag = el.tagName;
    return (
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        el.getAttribute("contenteditable") === "true"
    );
}

function hasOpenModal(): boolean {
    // 1) «наши» модалки
    const mine = document.querySelector('[data-modal="true"][data-open="true"]');
    if (mine) return true;

    // 2) любые диалоги из библиотек
    const dialogs = document.querySelectorAll<HTMLElement>('[role="dialog"]');
    for (const d of dialogs) {
        const hidden = d.getAttribute("aria-hidden");
        const pe = getComputedStyle(d).pointerEvents;
        if (hidden === "true") continue;
        if (pe === "none") continue;

        const r = d.getBoundingClientRect();
        const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
        if (visible) return true;
    }
    return false;
}

export const UIStateProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Фокус ввода
    useEffect(() => {
        const onFocusIn = (e: Event) => {
            setIsEditing(detectEditing(e.target as HTMLElement));
        };
        const onFocusOut = () => {
            // небольшой debounce, чтобы не мигало при переходе между инпутами
            setTimeout(() => {
                const ae = document.activeElement as HTMLElement | null;
                setIsEditing(detectEditing(ae));
            }, 50);
        };

        document.addEventListener("focusin", onFocusIn);
        document.addEventListener("focusout", onFocusOut);
        return () => {
            document.removeEventListener("focusin", onFocusIn);
            document.removeEventListener("focusout", onFocusOut);
        };
    }, []);

    // Наличие открытой модалки
    useEffect(() => {
        const update = () => setIsModalOpen(hasOpenModal());
        update();

        const mo = new MutationObserver(update);
        mo.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class", "open", "hidden", "aria-hidden", "data-open"]
        });
        window.addEventListener("resize", update);

        return () => {
            mo.disconnect();
            window.removeEventListener("resize", update);
        };
    }, []);

    const value = useMemo(() => ({ isEditing, isModalOpen }), [isEditing, isModalOpen]);

    return <UIStateCtx.Provider value={value}>{children}</UIStateCtx.Provider>;
};

export function useUIState() {
    const ctx = useContext(UIStateCtx);
    if (!ctx) throw new Error("useUIState must be used within UIStateProvider");
    return ctx;
}

export function useIsEditing() {
    return useUIState().isEditing;
}

export function useIsModalOpen() {
    return useUIState().isModalOpen;
}
