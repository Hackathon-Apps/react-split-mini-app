import { useCallback } from "react";
import { useCreateTxMutation, useMarkBillRefundedMutation, useTonTransfer } from "../api/queries";
import { buildRefundPayload } from "../utils/ton";

export function useRefund(
    billId: string | undefined,
    proxyWallet: string | undefined,
    stateInitHash: string | undefined,
    sender: string | undefined
) {
    const transfer = useTonTransfer();
    const createTx = useCreateTxMutation(billId ?? "", sender ?? "");
    const markRefunded = useMarkBillRefundedMutation(billId ?? "", sender ?? "");

    const refund = useCallback(async () => {
        if (!billId || !proxyWallet) throw new Error("Bill not ready");
        const payload = buildRefundPayload();

        await transfer.mutateAsync({
            to: proxyWallet,
            amountTons: 0,
            payload,
            stateInitBase64: stateInitHash,
        });

        await markRefunded.mutateAsync();
    }, [billId, proxyWallet, stateInitHash, transfer, createTx, markRefunded]);

    const loading = transfer.isLoading || createTx.isLoading || markRefunded.isLoading;

    return { refund, loading };
}
