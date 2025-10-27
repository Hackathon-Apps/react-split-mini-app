import { Address, toNano } from "@ton/core";

export function buildTonTransferLink(params: {
  to: string;          // user input (ANY form)
  amountTon: string;   // e.g. "0.15"
  testnet?: boolean;
}) {
  const addr = Address.parse(params.to);
  // Для переводов на кошелёк — non-bounceable адрес:
  const friendly = addr.toString({ bounceable: false, testOnly: params.testnet === true });
  const amountNano = toNano(params.amountTon).toString(); // целое число нанотонов
  return `ton://transfer/${friendly}?amount=${amountNano}`;
}