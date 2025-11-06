import {useEffect} from "react";
import {useQueryClient} from "@tanstack/react-query";
import {http} from "../api/http";
import {Bill} from "../api/types";

const RETRY_DELAY_MS = 2000;

export function useBillSubscription(billId?: string) {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!billId) return;

        const url = http.wsUrl(`/bills/${billId}/ws`);
        let stopped = false;
        let socket: WebSocket | null = null;
        let retryTimer: number | undefined;

        const connect = () => {
            if (stopped) return;

            socket = new WebSocket(url);

            socket.onmessage = (event: MessageEvent<string>) => {
                try {
                    const payload = JSON.parse(event.data) as Bill;
                    queryClient.setQueriesData({queryKey: ["bill", billId]}, () => payload);
                } catch (err) {
                    console.warn("bill ws: invalid payload", err);
                }
            };

            socket.onclose = () => {
                if (!stopped) {
                    retryTimer = window.setTimeout(connect, RETRY_DELAY_MS);
                }
            };

            socket.onerror = () => {
                socket?.close();
            };
        };

        connect();

        return () => {
            stopped = true;
            if (retryTimer !== undefined) {
                window.clearTimeout(retryTimer);
            }
            socket?.close();
        };
    }, [billId, queryClient]);
}
