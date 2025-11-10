import {CHAIN} from "@tonconnect/protocol";
import {beginCell, Cell, fromNano} from "@ton/core";

export function formatTon(n: number | string, fd: number = 3) {
    return Number(fromNano(n)).toLocaleString(undefined, { maximumFractionDigits: fd });
}

export function formatAddress(address: string) {
    return address.substring(0, 6) + "..." + address.substring(address.length - 4, address.length);
}

export function toncenterBase(chain?: CHAIN) {
    // можно прокинуть через .env, если нужно
    return chain === CHAIN.TESTNET ? "https://testnet.toncenter.com" : "https://toncenter.com";
}

export function buildContributePayload(): Cell {
    return beginCell()
        .storeUint(0xCF4D2AC0, 32)
        .endCell();
}