import React, {useMemo, useCallback, useEffect, useRef} from "react";
import styled, {css} from "styled-components";

// --- Types ---
export type PaginationProps = {
    /** Current page (1-based) */
    page: number;
    /** Total number of items */
    total: number;
    /** Items per page */
    pageSize: number;
    /** Called with the next page number */
    onPageChange: (page: number) => void;
    /** Pages to show on each side of the current page */
    siblingCount?: number; // default 1
    /** Pages to always show at the beginning and end */
    boundaryCount?: number; // default 1
    /** Show « first / last » buttons */
    showFirstLast?: boolean; // default true
    /** Show ‹ prev / next › buttons */
    showPrevNext?: boolean; // default true
    /** Optional className to style the wrapper */
    className?: string;
    /** Optional aria-label override for the nav */
    ariaLabel?: string;
    /** Visual density */
    size?: "sm" | "md" | "lg"; // default md
};

// --- Constants ---
const DOTS = "…" as const;

// --- Helpers ---
const range = (start: number, end: number) =>
    Array.from({length: Math.max(0, end - start + 1)}, (_, i) => start + i);

// Build a pagination range like: 1 … 4 5 6 … 10
export const usePagination = (
    totalPages: number,
    page: number,
    siblingCount: number = 1,
    boundaryCount: number = 1
) => {
    return useMemo<(number | typeof DOTS)[]>(() => {
        const totalPageNumbers = boundaryCount * 2 + siblingCount * 2 + 3; // including current page

        if (totalPages <= totalPageNumbers) {
            return range(1, totalPages);
        }

        const leftSibling = Math.max(page - siblingCount, 1);
        const rightSibling = Math.min(page + siblingCount, totalPages);

        const showLeftDots = leftSibling > boundaryCount + 2; // gap after left boundary
        const showRightDots = rightSibling < totalPages - (boundaryCount + 1); // gap before right boundary

        const leftRange = range(1, boundaryCount);
        const rightRange = range(totalPages - boundaryCount + 1, totalPages);

        if (!showLeftDots && showRightDots) {
            const leftItemCount = boundaryCount + siblingCount * 2 + 2; // include current + next
            const leftItems = range(1, leftItemCount);
            return [...leftItems, DOTS, ...rightRange];
        }

        if (showLeftDots && !showRightDots) {
            const rightItemCount = boundaryCount + siblingCount * 2 + 2;
            const rightItems = range(totalPages - rightItemCount + 1, totalPages);
            return [...leftRange, DOTS, ...rightItems];
        }

        return [...leftRange, DOTS, ...range(leftSibling, rightSibling), DOTS, ...rightRange];
    }, [totalPages, page, siblingCount, boundaryCount]);
};

// --- Styles ---
const sizeStyles = {
    sm: css`
        min-width: 32px;
        height: 32px;
        padding: 0 8px;
        font-size: 14px;
        border-radius: 20px;
    `,
    md: css`
        min-width: 36px;
        height: 36px;
        padding: 0 12px;
        font-size: 16px;
        border-radius: 24px;
    `,
    lg: css`
        min-width: 40px;
        height: 40px;
        padding: 0 16px;
        font-size: 18px;
        border-radius: 28px;
    `,
} as const;

const Nav = styled.div<{ $gap: number }>`
    justify-content: center;
    display: flex;
    align-items: center;
    gap: ${({$gap}) => $gap}px;
`;

const buttonBase = css<{ $size: "sm" | "md" | "lg"; $active?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: var(--bg-secondary);
    color: ${({$active}) => ($active ? "var(--text)" : "var(--text-secondary)")}; /* gray-900 */
    cursor: pointer;
    user-select: none;
    transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
    ${({$size}) => sizeStyles[$size]};

    &:hover {
            //background: ${({$active}) => ($active ? "#1f2937" : "#f9fafb")}; /* gray-800 / gray-50 */
    }

    &:focus-visible {
        outline: none;
        box-shadow: 0 0 0 3px rgba(17, 24, 39, 0.25); /* focus ring gray-900 */
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    ${({$active}) =>
            $active &&
            css`
                background: var(--accent); /* gray-900 */
                border-color: #111827;
                color: #ffffff;
            `}
`;

const Btn = styled.button<{ $size: "sm" | "md" | "lg"; $active?: boolean }>`
    ${buttonBase}
`;

const Dots = styled.span<{ $size: "sm" | "md" | "lg" }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #6b7280; /* gray-500 */
    ${({$size}) => sizeStyles[$size]};
`;

const SrOnly = styled.span`
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
`;

// --- Core Component ---
export function Pagination({
                               page,
                               total,
                               pageSize,
                               onPageChange,
                               siblingCount = 1,
                               boundaryCount = 1,
                               showFirstLast = true,
                               showPrevNext = true,
                               className,
                               ariaLabel,
                               size = "md",
                           }: PaginationProps) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const pages = usePagination(totalPages, page, siblingCount, boundaryCount);
    const navRef = useRef<HTMLDivElement>(null);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLDivElement>) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                onPageChange(Math.max(1, page - 1));
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                onPageChange(Math.min(totalPages, page + 1));
            }
        },
        [onPageChange, page, totalPages]
    );

    useEffect(() => {
        if (page > totalPages) onPageChange(totalPages);
    }, [page, totalPages, onPageChange]);

    if (totalPages <= 1) return null;

    const gaps = {sm: 4, md: 8, lg: 8} as const;

    const goTo = (p: number) => () => onPageChange(p);

    const aria = (label: string) => ({"aria-label": label});

    return (
        <Nav
            ref={navRef}
            role="navigation"
            aria-label={ariaLabel ?? "Pagination"}
            className={className}
            onKeyDown={handleKeyDown}
            $gap={gaps[size]}
        >
            {showFirstLast && (
                <Btn
                    type="button"
                    {...aria("First page")}
                    $size={size}
                    disabled={page === 1}
                    onClick={goTo(1)}
                >
                    «
                    <SrOnly>First</SrOnly>
                </Btn>
            )}

            {showPrevNext && (
                <Btn
                    type="button"
                    {...aria("Previous page")}
                    $size={size}
                    disabled={page === 1}
                    onClick={goTo(Math.max(1, page - 1))}
                >
                    ‹
                    <SrOnly>Previous</SrOnly>
                </Btn>
            )}

            {pages.map((p, idx) => {
                if (p === DOTS) {
                    return (
                        <Dots key={`dots-${idx}`} $size={size}>
                            {DOTS}
                        </Dots>
                    );
                }
                const isActive = p === page;
                return (
                    <Btn
                        key={p}
                        type="button"
                        {...aria(`Page ${p}`)}
                        aria-current={isActive ? "page" : undefined}
                        $size={size}
                        $active={isActive}
                        onClick={goTo(p as number)}
                    >
                        {p}
                    </Btn>
                );
            })}

            {showPrevNext && (
                <Btn
                    type="button"
                    {...aria("Next page")}
                    $size={size}
                    disabled={page === totalPages}
                    onClick={goTo(Math.min(totalPages, page + 1))}
                >
                    ›
                    <SrOnly>Next</SrOnly>
                </Btn>
            )}

            {showFirstLast && (
                <Btn
                    type="button"
                    {...aria("Last page")}
                    $size={size}
                    disabled={page === totalPages}
                    onClick={goTo(totalPages)}
                >
                    »
                    <SrOnly>Last</SrOnly>
                </Btn>
            )}
        </Nav>
    );
}