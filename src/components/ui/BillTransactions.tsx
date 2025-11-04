import React, {useEffect, useRef, useState} from "react";
import styled from "styled-components";
import type { Transaction } from "../../api/types";
import { formatTon } from "../../utils/ton";

const HistoryCard = styled.div`
  border: 1px solid #2c2c2c;
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
`;

const HistoryHeader = styled.button<{ open?: boolean }>`
  width: 100%;
  display: flex; align-items: center; justify-content: space-between;
  padding: 12px 14px; background: transparent; border: 0; cursor: pointer; color: inherit;

  & > span { font-weight: 700; font-size: 16px; }
  & svg { transition: transform 250ms ease; transform: rotate(${({open}) => (open ? 180 : 0)}deg); }
`;

const HistoryBodyOuter = styled.div`
  overflow: hidden;
`;

const HistoryBodyInner = styled.div`
  padding: 12px 14px;
`;

const HistoryEmpty = styled.div`
  opacity: 0.6; text-align: center; padding: 12px 0;
`;

const HistoryItem = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 8px 0;
  &:not(:last-child) { border-bottom: 1px dashed #2c2c2c; }
`;

type Props = {
    transactions?: Transaction[];
    defaultOpen?: boolean;
    className?: string;
};

export default function BillTransactions({ transactions, defaultOpen = false, className }: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const bodyOuterRef = useRef<HTMLDivElement | null>(null);
    const bodyInnerRef = useRef<HTMLDivElement | null>(null);
    const [bodyHeight, setBodyHeight] = useState(0);

    useEffect(() => {
        const measure = () => {
            const h = bodyInnerRef.current?.scrollHeight ?? 0;
            setBodyHeight(open ? h : 0);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [open, transactions?.length]);

    return (
        <HistoryCard className={className}>
            <HistoryHeader open={open} onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <span>History</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </HistoryHeader>

            <HistoryBodyOuter ref={bodyOuterRef} style={{ height: bodyHeight, transition: "height 260ms ease" }}>
                <HistoryBodyInner ref={bodyInnerRef}>
                    {!transactions || transactions.length === 0 ? (
                        <HistoryEmpty>No transactions</HistoryEmpty>
                    ) : (
                        transactions.map((h) => (
                            <HistoryItem key={h.id}>
                                <span><strong>{formatTon(h.amount)} TON</strong> from {h.sender_address}</span>
                                <span style={{ opacity: 0.7 }}>
                  {new Date(h.created_at).toLocaleTimeString()}
                </span>
                            </HistoryItem>
                        ))
                    )}
                </HistoryBodyInner>
            </HistoryBodyOuter>
        </HistoryCard>
    );
}
