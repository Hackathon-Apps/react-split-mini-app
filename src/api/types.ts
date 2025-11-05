export type BillStatus = "ACTIVE" | "COMPLETED" | "REFUNDED" | "CANCELLED";

export interface Bill {
    id: string;
    goal: number;         // nanoton
    collected: number;    // nanoton
    creator_address: string;
    destination_address: string;
    created_at: string;
    status: BillStatus;
    proxy_wallet: string;
    state_init_hash: string;
    transactions?: Transaction[];
}

export interface Transaction {
    id: string;
    bill_id: string;
    amount: number;
    sender_address: string;
    created_at: string;
    op_type: OpType;
}

export type OpType = "CONTRIBUTE" | "REFUND" | "WITHDRAW";

export interface TxPayload {
    amount: number;
    op_type: OpType;
}

export interface HistoryItem {
    id: string;
    destination_address: string;
    goal: string;
    status: BillStatus;
    created_at: string;
}

// Удобные ключи для RQ
export const qk = {
    bill: (id: string, sender?: string) => ["bill", id, sender] as const,
    history: (sender?: string) => ["history", sender] as const,
};
