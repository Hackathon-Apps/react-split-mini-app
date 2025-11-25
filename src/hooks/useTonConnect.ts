import { CHAIN } from "@tonconnect/protocol";
import { Sender, SenderArguments, beginCell, storeStateInit } from "@ton/core";
import { useTonConnectUI, useTonWallet } from "@tonconnect/ui-react";

export function useTonConnect(): {
  sender: Sender;
  connected: boolean;
  wallet: string | null;
  network: CHAIN | null;
} {
  const [tonConnectUI] = useTonConnectUI();
  const wallet = useTonWallet();
  const nowSec = Math.floor(Date.now() / 1000);

  return {
    sender: {
      send: async (args: SenderArguments) => {
        const stateInitBoc = args.init
          ? beginCell().store(storeStateInit(args.init)).endCell().toBoc().toString("base64")
          : undefined;

        await tonConnectUI.sendTransaction({
            messages: [
                {
                    address: args.to.toString(),
                    amount: args.value.toString(),
                    payload: args.body?.toBoc().toString("base64"),
                    stateInit: stateInitBoc,
                },
            ],
            validUntil: nowSec + 10 * 60, // 5 minutes for user to approve
        });
      },
    },
    connected: !!wallet?.account.address,
    wallet: wallet?.account.address ?? null,
    network: wallet?.account.chain ?? null,
  };
}
