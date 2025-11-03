const BASE_URL =
    import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "https://tagwaiter.ru/api";

type RequestOpts = { sender?: string; signal?: AbortSignal };

async function request<T>(
    method: "GET" | "POST",
    path: string,
    body?: unknown,
    opts: RequestOpts = {}
): Promise<T> {
    const headers: Record<string, string> = { };
    if (opts.sender) headers["sender-address"] = opts.sender;

    const res = await fetch(`${BASE_URL}${path}`, {
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
    BASE_URL,
};
