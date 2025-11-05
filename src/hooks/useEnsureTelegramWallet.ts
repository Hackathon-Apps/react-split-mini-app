import {useTonConnectUI, useTonWallet} from "@tonconnect/ui-react";

export function useEnsureTelegramWallet() {
    const [ui] = useTonConnectUI();
    const wallet = useTonWallet();

    return async () => {
        const app = wallet?.device.appName ?? ui.wallet?.device?.appName ?? "Split Bill app";
        const isTG = app === 'tonwallet' || app === 'tonspace';
        if (!isTG) {
            await ui.openSingleWalletModal('tonwallet');
        }
    };
}