import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode } from '@ton/core';

export type SplitterConfig = {
    id: number;
};

export function splitterConfigToCell(config: SplitterConfig): Cell {
    return beginCell().storeUint(config.id, 32).endCell();
}

export const Opcodes = {
    increase: 0x7e8764ef,
};

export class Splitter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Splitter(address);
    }

    static createFromConfig(config: SplitterConfig, code: Cell, workchain = 0) {
        const data = splitterConfigToCell(config);
        const init = { code, data };
        return new Splitter(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async getID(provider: ContractProvider) {
        const result = await provider.get('get_id', []);
        return result.stack.readNumber();
    }
}
