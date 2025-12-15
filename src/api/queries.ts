import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {CHAIN, useTonConnectUI} from "@tonconnect/ui-react";
import {http} from "./http";
import {Bill, HistoryItem, qk, TxPayload} from "./types";
import {toncenterBase} from "../utils/ton";
import {Cell, fromNano, toNano} from "@ton/core";

export function useBillQuery(id: string, sender?: string) {
    return useQuery({
        queryKey: qk.bill(id, sender),
        queryFn: ({ signal }) => http.get<Bill>(`/bills/${id}`, { sender, signal }),
        enabled: !!id,
        keepPreviousData: true,
    });
}

export function useHistoryQuery(sender: string) {
    const path = `/history`;
    return useQuery({
        queryKey: qk.history(sender),
        queryFn: ({ signal }) => http.get<HistoryItem[]>(path, { sender, signal }),
        enabled: !!sender,
    });
}

export function useCreateBillMutation() {
    return useMutation({
        mutationFn: (payload: { goal: number; destination_address: string; sender: string }) =>
            http.post<Bill>("/bills", payload, { sender: payload.sender }),
    });
}

export function useCreateTxMutation(billId: string, sender: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (tx: TxPayload) =>
            http.post(
                `/bills/${billId}/transactions`,
                {...tx, amount: toNano(tx.amount).toString()},
                { sender }
            ),
        onSuccess: (_res, _vars, _ctx) => {
            qc.invalidateQueries({ queryKey: ["bill"] });
            qc.invalidateQueries({ queryKey: ["history"] });
        },
    });
}

export function useMarkBillRefundedMutation(billId: string, sender: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () =>
            http.post(
                `/bills/${billId}/refund`,
                undefined,
                { sender }
            ),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bill"] });
            qc.invalidateQueries({ queryKey: ["history"] });
        },
    });
}

export function useCancelBillMutation(billId?: string, sender?: string) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () => {
            if (!billId) throw new Error("Bill id is required");
            return http.post(
                `/bills/${billId}/cancel`,
                undefined,
                { sender }
            );
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["bill"] });
            qc.invalidateQueries({ queryKey: ["history"] });
        },
    });
}

type BalanceResponse =
    | { result?: string | number | { balance?: string | number } }
    | { balance?: string | number }
    | unknown;

async function fetchBalance(address: string, chain?: CHAIN, signal?: AbortSignal) {
    const apiKey = import.meta.env.VITE_TONCENTER_API_KEY as string | undefined;
    const base = toncenterBase(chain);
    const url = `${base}/api/v2/getAddressBalance?address=${encodeURIComponent(address)}`;
    const res = await fetch(url, {
        signal,
        headers: apiKey ? { "X-API-Key": apiKey } : undefined,
    });
    if (!res.ok) throw new Error(`TON balance HTTP ${res.status}`);
    const data = (await res.json()) as BalanceResponse;

    let nanoStr: string | undefined;
    const any = data as any;
    if (typeof any?.result === "string" || typeof any?.result === "number") nanoStr = String(any.result);
    else if (typeof any?.balance === "string" || typeof any?.balance === "number") nanoStr = String(any.balance);
    else if (typeof any?.result?.balance === "string" || typeof any?.result?.balance === "number")
        nanoStr = String(any.result.balance);

    if (!nanoStr) throw new Error("Unexpected TON balance response");
    return {
        nano: nanoStr,
        tons: Number(fromNano(nanoStr)),
    };
}

export function useTonBalance(address?: string, chain?: CHAIN, opts?: { refetchInterval?: number; enabled?: boolean }) {
    return useQuery({
        queryKey: ["ton", "balance", chain, address],
        enabled: !!address && (opts?.enabled ?? true),
        refetchInterval: opts?.refetchInterval ?? 20_000,
        queryFn: ({ signal }) => fetchBalance(address!, chain, signal),
    });
}

type TransferArgs = {
    to: string;
    amountTons: number;
    payload?: Cell | string;
    stateInitBase64?: string;
    validForSec?: number;
};

export function useTonTransfer() {
    const [tonConnectUI] = useTonConnectUI();

    return useMutation({
        mutationFn: async ({ to, amountTons, payload, stateInitBase64, validForSec = 300 }: TransferArgs) => {
            const amount = toNano(amountTons).toString();
            const payloadBase64 =
                typeof payload === "string" ? payload : payload ? payload.toBoc().toString("base64") : undefined;

            return await tonConnectUI.sendTransaction({
                validUntil: Math.floor(Date.now() / 1000) + validForSec,
                messages: [{address: to, amount, payload: payloadBase64, stateInit: stateInitBase64}],
            });
        },
    });
}
