import {CHAIN} from "@tonconnect/protocol";
import {beginCell, Cell, fromNano} from "@ton/core";

export function formatTon(n: number | string, fd: number = 3) {
    return Number(fromNano(n)).toLocaleString(undefined, { minimumFractionDigits: fd, maximumFractionDigits: fd });
}

export function toncenterBase(chain?: CHAIN) {
    // можно прокинуть через .env, если нужно
    return chain === CHAIN.TESTNET ? "https://testnet.toncenter.com" : "https://toncenter.com";
}

export function buildContributePayload(extra?: (cell: import("@ton/core").Builder) => void): Cell {
    const b = beginCell();
    return b.endCell();
}