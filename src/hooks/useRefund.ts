import { useCallback } from "react";
import { useMarkBillRefundedMutation, useTonTransfer } from "../api/queries";
import { buildRefundPayload } from "../utils/ton";

export function useRefund(
    billId: string | undefined,
    proxyWallet: string | undefined,
    stateInitHash: string | undefined,
    sender: string | undefined
) {
    const transfer = useTonTransfer();
    const markRefunded = useMarkBillRefundedMutation(billId ?? "", sender ?? "");

    const refund = useCallback(async () => {
        if (!billId || !proxyWallet) throw new Error("Bill not ready");
        const payload = buildRefundPayload();

        await transfer.mutateAsync({
            to: proxyWallet,
            amountTons: 0.01,
            payload,
            stateInitBase64: stateInitHash,
        });

        await markRefunded.mutateAsync();
    }, [billId, proxyWallet, stateInitHash, transfer, markRefunded]);

    const loading = transfer.isLoading || markRefunded.isLoading;

    return { refund, loading };
}
