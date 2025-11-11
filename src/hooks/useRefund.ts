import { useCallback } from "react";
import { useCreateTxMutation, useTonTransfer } from "../api/queries";
import { buildRefundPayload } from "../utils/ton";

export function useRefund(
    billId: string | undefined,
    proxyWallet: string | undefined,
    stateInitHash: string | undefined,
    sender: string | undefined
) {
    const transfer = useTonTransfer();
    const createTx = useCreateTxMutation(billId ?? "", sender ?? "");

    const refund = useCallback(async () => {
        if (!billId || !proxyWallet) throw new Error("Bill not ready");
        const payload = buildRefundPayload();

        await transfer.mutateAsync({
            to: proxyWallet,
            amountTons: 0,
            payload,
            stateInitBase64: stateInitHash,
        });
    }, [billId, proxyWallet, stateInitHash, transfer, createTx]);

    const loading = transfer.isLoading || createTx.isLoading;

    return { refund, loading };
}
