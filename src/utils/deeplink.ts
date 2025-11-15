import WebApp from "@twa-dev/sdk";

export function readStartBillId(): string | null {
    const fromSdk = WebApp?.initDataUnsafe?.start_param as string | undefined;
    const fromQuery = new URLSearchParams(location.search).get("tgWebAppStartParam") || undefined;
    return fromSdk ?? fromQuery ?? null;
}

export function buildMiniAppLink(botUsername: string, billId?: string, appname?: string) {
    if (!billId) return `https://t.me/${botUsername}`;
    const encodedBillId = encodeURIComponent(billId);
    return appname
        ? `https://t.me/${botUsername}/${appname}?startapp=${encodedBillId}`
        : `https://t.me/${botUsername}?startapp=${encodedBillId}`;
}
