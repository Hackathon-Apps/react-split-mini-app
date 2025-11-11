const BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://tagwaiter.ru/api";
const WS_BASE_URL = BASE_URL.replace(/^http/, "ws");

type RequestOpts = { sender?: string; signal?: AbortSignal };

function joinUrl(base: string, path: string) {
    return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

type HttpMethod = "GET" | "POST";

async function request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    opts: RequestOpts = {}
): Promise<T> {
    const headers: Record<string, string> = { };
    if (opts.sender) headers["Sender-Address"] = opts.sender;

    const res = await fetch(joinUrl(BASE_URL, path), {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: opts.signal,
    });

    const text = await res.text();
    const json = text ? JSON.parse(text) : null;

    if (!res.ok) {
        const msg = (json && (json.error || json.message)) || `HTTP ${res.status} ${res.statusText}`;
        throw new Error(msg);
    }
    return json as T;
}

export const http = {
    get: <T>(path: string, opts?: RequestOpts) => request<T>("GET", path, undefined, opts),
    post: <T>(path: string, body?: unknown, opts?: RequestOpts) =>
        request<T>("POST", path, body, opts),
    wsUrl: (path: string) => joinUrl(WS_BASE_URL, path),
    BASE_URL,
};
