import {BillStatus} from "../state/billStore";


export interface Bill {
    id: string;
    goal: number;         // nanoton
    collected: number;    // nanoton
    dest_address: string;
    status: BillStatus;
    created_at: string;
}

export type OpType = "CONTRIBUTE" | "REFUND" | "WITHDRAW";

export interface TxPayload {
    amount: string;        // nanoton (строка)
    sender_address: string;
    op_type: OpType;
}

export interface HistoryItem {
    bill_id: string;
    dest_address: string;
    total_amount: string;  // nanoton
    created_at?: string;
}

// Удобные ключи для RQ
export const qk = {
    bill: (id: string, sender?: string) => ["bill", id, sender] as const,
    history: (sender?: string) => ["history", sender] as const,
};
