// components/PaySheet.tsx
import React, { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import BottomSheet from "./ui/BottomSheet";
import { Button } from "./styled/styled";

const AmountField = styled.div`
  display: flex; justify-content: center; align-items: baseline; gap: 8px;
  margin: 6px 0 12px;
`;
const AmountInput = styled.input`
  width: 100%;
  max-width: 320px;
  text-align: right;
  font-size: 34px;          /* >=16px чтобы iOS не зумил */
  font-weight: 700;
  background: transparent;
  color: inherit;
  border: none;
  outline: none;
  padding: 6px 1px;
  border-radius: 12px;

  /* убираем спиннеры */
  &[type="number"] { -moz-appearance: textfield; appearance: textfield; }
  &::-webkit-outer-spin-button,&::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;
const Unit = styled.small`
  font-size: 24px; font-weight: 600; opacity: .8;
  padding-right: 33%;
`;

const QuickRow = styled.div`
  display: flex; flex-wrap: wrap; gap: 8px; justify-content: center;
  margin-bottom: 12px;
`;
const Chip = styled.button`
  min-width: 64px; height: 36px; padding: 0 10px;
  border-radius: 10px; border: 1px solid #2c2c2c; background: transparent; color: inherit;
  font-weight: 600;
`;

const PayBtn = styled(Button)`
  width: 100%;
  border-radius: 12px;
  padding: 14px 20px; font-size: 16px;
  margin: 4px 0 10px;
  background-color: #2676ff !important;
  color: #fff !important; font-weight: 700 !important;
`;

const Balance = styled.div`
  display: flex; align-items: center; justify-content: center; gap: 6px;
  opacity: .85; font-size: 14px;
  & img { width: 16px; height: 16px; }
`;

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}
function sanitizeDecimal(str: string) {
    return str.replace(",", ".").replace(/[^0-9.]/g, "");
}

export default function PaySheet({
                                     open,
                                     onClose,
                                     amountTon,
                                     onChange,
                                     onPay,
                                     totalTon,
                                     balanceTon,
                                     clampToTotal = true,
                                 }: {
    open: boolean;
    onClose: () => void;
    amountTon: number;
    onChange: (v: number) => void;
    onPay: () => void;
    totalTon: number;       // проценты считаются от общей суммы счёта
    balanceTon?: string;
    clampToTotal?: boolean;
}) {
    const [input, setInput] = useState<string>(() => (amountTon || 0).toString());

    useEffect(() => { setInput(amountTon ? String(amountTon) : ""); }, [amountTon]);

    const setAmount = (v: number) => {
        const next = clampToTotal ? clamp(v, 0, totalTon) : Math.max(0, v);
        onChange(Number(next.toFixed(9)));
    };
    const add = (delta: number) => setAmount((amountTon || 0) + delta);
    const pct = (p: number) => setAmount(totalTon * p);

    const canPay = useMemo(() => amountTon > 0, [amountTon]);

    return (
        <BottomSheet open={open} onClose={onClose} ariaTitle="Pay">
            {/* ЕДИНСТВЕННЫЙ инпут суммы */}
            <AmountField>
                <AmountInput
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    value={input}
                    onChange={(e) => {
                        const clean = sanitizeDecimal(e.target.value);
                        setInput(clean);
                        const n = Number(clean);
                        if (!Number.isNaN(n)) setAmount(n);
                    }}
                    onBlur={() => setInput((amountTon || 0).toString())}
                />
                <Unit>TON</Unit>
            </AmountField>

            <QuickRow>
                <Chip onClick={() => pct(0.25)}>25%</Chip>
                <Chip onClick={() => pct(0.5)}>50%</Chip>
                <Chip onClick={() => add(0.5)}>+0.5</Chip>
                <Chip onClick={() => add(1)}>+1</Chip>
                <Chip onClick={() => add(5)}>+5</Chip>
            </QuickRow>

            <PayBtn onClick={onPay} disabled={!canPay}>
                Pay {amountTon || 0} TON
            </PayBtn>

            <Balance>
                <img src="/ton_symbol.png" alt="TON" />
                Balance: {balanceTon ?? "…"} TON
            </Balance>
        </BottomSheet>
    );
}
