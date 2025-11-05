import React, {useEffect, useRef, useState} from "react";
import type {Transaction} from "../../api/types";
import {formatAddress, formatTon} from "../../utils/ton";
import {
    Card,
    CardEmpty,
    CardRow,
    CardRowDivider,
    CardRowName,
    CardRowValue, HistoryBodyInner,
    HistoryBodyOuter,
    HistoryHeader, HistoryItemInfo
} from "../styled/styled";

type Props = {
    transactions?: Transaction[];
    defaultOpen?: boolean;
};

export default function BillTransactions({transactions, defaultOpen = false}: Props) {
    const [open, setOpen] = useState(defaultOpen);
    const bodyOuterRef = useRef<HTMLDivElement | null>(null);
    const bodyInnerRef = useRef<HTMLDivElement | null>(null);
    const [bodyHeight, setBodyHeight] = useState(0);

    useEffect(() => {
        const measure = () => {
            const h = bodyInnerRef.current?.scrollHeight ?? 0;
            setBodyHeight(open ? h + 12 : 0);
        };
        measure();
        window.addEventListener("resize", measure);
        return () => window.removeEventListener("resize", measure);
    }, [open, transactions?.length]);

    return (
        <Card>
            <HistoryHeader open={open} onClick={() => setOpen(o => !o)} aria-expanded={open}>
                <span>History</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                          strokeLinejoin="round"/>
                </svg>
            </HistoryHeader>

            <HistoryBodyOuter ref={bodyOuterRef} style={{height: bodyHeight, transition: "height 260ms ease"}}>
                <HistoryBodyInner ref={bodyInnerRef}>
                    {!transactions || transactions.length === 0 ? (
                        <CardEmpty>No transactions</CardEmpty>
                    ) : (
                        transactions.map((t) => (
                            <>
                                <CardRow key={t.id}>
                                    <HistoryItemInfo>
                                        <CardRowName>
                                            {new Date(t.created_at).toLocaleString()}
                                        </CardRowName>
                                        <CardRowValue style={{
                                            fontWeight: 400,
                                            fontSize: 18
                                        }}>{formatAddress(t.sender_address)}</CardRowValue>
                                    </HistoryItemInfo>
                                    <CardRowValue
                                        style={{color: "var(--success-color)", fontSize: 18}}>+{formatTon(t.amount)} TON
                                    </CardRowValue>
                                </CardRow>
                                {t.id != transactions[transactions.length - 1].id && (<CardRowDivider/>)}
                            </>
                        )))}
                </HistoryBodyInner>
            </HistoryBodyOuter>
        </Card>
    );
}
