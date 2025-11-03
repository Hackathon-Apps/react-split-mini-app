// utils/startapp.ts
import { fromUint8Array, toUint8Array } from "js-base64";
import WebApp from "@twa-dev/sdk";

/** ENCODE: объект -> base64url(JSON), без '=' */
export function encodeStartParam(payload: unknown): string {
    const bytes = new TextEncoder().encode(JSON.stringify(payload));
    // urlSafe=true => '-'/'_', дополнительно срежем '=' на всякий случай
    return fromUint8Array(bytes, true).replace(/=+$/g, "");
}

/** DECODE: base64url(JSON) -> объект */
export function decodeStartParam<T = unknown>(encoded: string): T {
    // toUint8Array понимает url-safe и отсутствие '='
    const bytes = toUint8Array(encoded);
    const json = new TextDecoder().decode(bytes);
    return JSON.parse(json) as T;
}

/** Достаёт startapp/start/start_param из строки (tg/https URL или «чистый» payload) */
export function extractStartParam(input: string): string | null {
    const trimmed = input.trim();

    // Уже «чистый» payload (base64url)
    if (/^[A-Za-z0-9\-_]+$/.test(trimmed)) return trimmed;

    try {
        const normalized = trimmed.startsWith("tg://resolve?")
            ? trimmed.replace("tg://resolve?", "https://t.me/resolve?")
            : trimmed;
        const url = new URL(normalized);
        return (
            url.searchParams.get("startapp") ||
            url.searchParams.get("start") ||
            url.searchParams.get("start_param")
        );
    } catch {
        const m = trimmed.match(/[?&](startapp|start|start_param)=([A-Za-z0-9\-_]+)/);
        return m ? m[2] : null;
    }
}

/** Высокоуровневый парсер: строка -> payload | null */
export function parseStartPayload<T = unknown>(input: string): T | null {
    const encoded = extractStartParam(input);
    return encoded ? decodeStartParam<T>(encoded) : null;
}

export function readStartPayload<T = unknown>(): T | null {
    const fromSdk = WebApp?.initDataUnsafe?.start_param as string | undefined;
    const fromQuery = new URLSearchParams(location.search).get("tgWebAppStartParam") || undefined;
    const encoded = fromSdk ?? fromQuery;
    return encoded ? decodeStartParam<T>(encoded) : null;
}

/** https://t.me/<bot>?startapp=<payload> */
export function buildMiniAppLink(botUsername: string, payload: unknown, appname?: string) {
    const p = encodeStartParam(payload);
    return appname
        ? `https://t.me/${botUsername}/${appname}?startapp=${p}`
        : `https://t.me/${botUsername}?startapp=${p}`;
}