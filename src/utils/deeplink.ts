// utils/deeplink.ts
export function encodeStartParam(payload: unknown) {
    const json = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

/** https://t.me/<bot>?startapp=<payload> */
export function buildMiniAppLink(botUsername: string, payload: unknown, appname?: string) {
    const p = encodeStartParam(payload);
    return appname
        ? `https://t.me/${botUsername}/${appname}?startapp=${p}`
        : `https://t.me/${botUsername}?startapp=${p}`;
}