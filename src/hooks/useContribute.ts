import { useCallback } from "react";
import { useCreateTxMutation, useTonTransfer } from "../api/queries";
import { buildContributePayload } from "../utils/ton";

export function useContribute(
    billId: string | undefined,
    proxyWallet: string | undefined,
    stateInitHash: string | undefined,
    sender: string | undefined
) {
    const transfer = useTonTransfer();
    const createTx = useCreateTxMutation(billId ?? "", sender ?? "");

    const contribute = useCallback(async (amountTons: number) => {
        if (!billId || !proxyWallet) throw new Error("Bill not ready");
        const payload = buildContributePayload();

        await transfer.mutateAsync({
            to: proxyWallet,
            amountTons,
            payload,
            stateInitBase64: stateInitHash,
        });

        await createTx.mutateAsync({
            amount: amountTons,
            op_type: "CONTRIBUTE",
        });
    }, [billId, proxyWallet, transfer, createTx]);

    const loading = transfer.isLoading || createTx.isLoading;

    return { contribute, loading };
}
