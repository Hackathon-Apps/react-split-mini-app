import { useEffect, useState } from "react";

export function useBillCountdown(createdAt?: string | null) {
    const safeEnd = createdAt ? Math.floor(Date.parse(createdAt) / 1000 + 600) : 0;

    const [left, setLeft] = useState(() =>
        Math.min(Math.max(0, safeEnd - Math.floor(Date.now() / 1000)), 600)
    );

    // тик раз в секунду
    useEffect(() => {
        if (!safeEnd) return;
        const id = setInterval(() => {
            const now = Math.floor(Date.now() / 1000);
            setLeft(Math.min(Math.max(0, safeEnd - now), 600));
        }, 1000);
        return () => clearInterval(id);
    }, [safeEnd]);
    return left;
}
