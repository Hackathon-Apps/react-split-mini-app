import React, {createContext, useContext, useEffect, useMemo, useState} from "react";

export type BillStatus = "ACTIVE" | "COMPLETED" | "REFUNDED" | "CANCELLED";

export type OpenBill = {
    id: string;
    receiver: string;
    destAddress: string; //proxy
    goalTon: number;
    endTimeSec: number;
    status: BillStatus;
    collectedTon: number;
};

type BillCtx = {
    bill: OpenBill | null;
    setBill: (b: OpenBill) => void;
    clearBill: () => void;
};

const Ctx = createContext<BillCtx | null>(null);
const STORAGE_KEY = "openBill";

export function BillProvider({children}: {children: React.ReactNode}) {
    const [bill, setBillState] = useState<OpenBill | null>(null);

    // загрузка из localStorage
    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) setBillState(JSON.parse(raw));
        } catch {}
    }, []);

    // автосейв
    useEffect(() => {
        try {
            if (bill) localStorage.setItem(STORAGE_KEY, JSON.stringify(bill));
            else localStorage.removeItem(STORAGE_KEY);
        } catch {}
    }, [bill]);

    const api = useMemo<BillCtx>(() => ({
        bill,
        setBill: (b) => setBillState(b),
        clearBill: () => setBillState(null),
    }), [bill]);

    return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useBillStore() {
    const ctx = useContext(Ctx);
    if (!ctx) throw new Error("useBillStore must be used within BillProvider");
    return ctx;
}
