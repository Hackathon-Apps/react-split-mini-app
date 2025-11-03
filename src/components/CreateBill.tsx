import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { Address } from "@ton/ton";
import { Button } from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import {OpenBill} from "../state/billStore";
import {useUIState} from "../state/uiState";
import {useTonAddress} from "@tonconnect/ui-react";
import {useCreateBillMutation} from "../api/queries";
import {toNano} from "@ton/core";

const Screen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  max-width: 900px;
  margin: 0 auto;
  /* Keep content height stable even when the keyboard is visible */
  min-height: calc(var(--tg-viewport-stable-height, 100svh) - 160px);
`;

const Field = styled.fieldset<{ invalid?: boolean }>`
  margin: 0;
  padding: 6px 12px 10px;
  border-radius: 20px;
  border: 1px solid ${(p) => (p.invalid ? "#ff4d4f" : "var(--stroke)")};
  background: transparent;

`;

const Legend = styled.legend`
  padding: 0 6px;
  opacity: 0.9;
  font-weight: 600;
  font-size: 15px;
  font-family: var(--fontRoboto);
  line-height: 1;
  margin-left: 4px;
  margin-bottom: -4px; /* tighten gap to input */
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px 8px;
  border: 0;
  background: transparent;
  color: inherit;
  outline: none;
  font-size: 16px; /* prevent iOS auto-zoom */

  /* Hide number input spinners on all browsers */
  &[type="number"] {
    -moz-appearance: textfield; /* Firefox */
    appearance: textfield;
  }
  &[type="number"]::-webkit-outer-spin-button,
  &[type="number"]::-webkit-inner-spin-button {
    -webkit-appearance: none; /* Chrome, Safari, Edge */
    margin: 0;
  }

  &::placeholder {
    color: #888;
    opacity: 1;
    font-family: var(--fontRoboto);
    font-weight: 600;
    font-size: 16px;
  }
`;

const TrailingIconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 29px;
  height: 29px;
  border-radius: 8px;
  border: 1px solid #c2c2c2;
  background: transparent;
  color: inherit;
  cursor: pointer;

  @media (prefers-color-scheme: dark) {
    border-color: #3a3a3a;
  }
`;

const TonBadge = styled.div`
  width: 29px;
  height: 29px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

const PasteButton = styled.button`
  border: 0;
  background: transparent;
  color: #2990FF;
  font-weight: 600;
  font-family: var(--fontSF);
  font-size: 16px;
  cursor: pointer;
  padding: 0 6px;
  height: 44px;
  display: inline-flex;
  align-items: center;
`;

const ScanButton = styled(TrailingIconButton)`
  border-color: #2990FF;
  color: #2990FF;
`;

const ErrorText = styled.small`
  color: #ff4d4f;
  padding-left: 6px;
`;

const Footer = styled.div`
  height: 96px; /* reduced to avoid extra scroll while keeping CTA clear */
`;

const FixedCtaWrap = styled.div<{ hidden?: boolean }>`
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--bottom-bar-height, 88px) + 24px + env(safe-area-inset-bottom));
  display: flex;
  justify-content: center;
  padding: 0 16px;
  z-index: 900; /* below tab bar (1000), above content */
  transition: transform 0.2s ease, opacity 0.2s ease;
  transform: ${(p) => (p.hidden ? "translateY(140%)" : "translateY(0)")};
  opacity: ${(p) => (p.hidden ? 0 : 1)};
  pointer-events: ${(p) => (p.hidden ? "none" : "auto")};
`;

const FixedCtaInner = styled.div`
  width: min(900px, 92%);
`;

const PrimaryAction = styled(Button)`
  width: 100%;
  border-radius: 16px;
  padding: 14px 20px;
  font-size: 16px;
  background-color: #2990FF !important;
  color: #FFFFFF !important;
  font-family: var(--fontSF) !important;
  font-weight: 600 !important;
  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
`;

export function CreateBill({ onCreated }: { onCreated: (payload: OpenBill) => void}) {
  const [total, setTotal] = useState("");
  const [receiver, setReceiver] = useState("");
  const sender = useTonAddress();
  const { isEditing, isModalOpen } = useUIState();
  const createBill = useCreateBillMutation(sender);

  const onScan = useCallback(() => {
    // Telegram WebApp QR scanner. Fallback: prompt paste
    try {
      WebApp.showScanQrPopup({ text: "Scan TON address" }, (data) => {
        if (data) {
          setReceiver(data.replaceAll("ton://transfer/", ""));
          WebApp.closeScanQrPopup();
        }
      });
    } catch (e) {
      const pasted = window.prompt("Paste TON address");
      if (pasted) setReceiver(pasted);
    }
  }, []);

  const onPaste = useCallback(async () => {
    try {
      const anyWebApp: any = WebApp as any;
      if (anyWebApp?.readTextFromClipboard) {
        const text = await anyWebApp.readTextFromClipboard();
        if (text) return setReceiver(String(text).trim());
      }
    } catch {}
    try {
      const text = await navigator.clipboard.readText();
      if (text) return setReceiver(String(text).trim());
    } catch {}
    const fallback = window.prompt("Paste TON address");
    if (fallback) setReceiver(fallback.trim());
  }, []);

  const minPart = 0.1;
  const isValidAmount = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) && n > minPart;
  };
  const totalInvalid = total !== "" && !isValidAmount(total);
  const receiverInvalid = receiver !== "" && (() => {
    try {
      Address.parse(receiver);
      return false;
    } catch {
      return true;
    }
  })();

  const canCreate = useMemo(() => {
    return (
      !!receiver &&
      !!total &&
      !totalInvalid &&
      !receiverInvalid &&
      !!sender
    );
  }, [receiver, total, sender]);

  const handleCreate = async () => {
    const res = await createBill.mutateAsync({
        goal: toNano(total).toString(),
        dest_address: receiver
    })
    onCreated({
        id: res.id,
        receiver: res.destination_address,
        destAddress: res.proxy_wallet_address,
        goalTon: parseFloat(total),
        endTimeSec: Math.floor(Date.parse(res.created_at) / 1000) + 600,
        collectedTon: res.collected,
        status: res.status,
        transactions: res.transactions,
    })
  }

  return (
    <Screen>
      <Field invalid={totalInvalid}>
        <Legend>Bill</Legend>
        <Row>
          <Input
            type="number"
            inputMode="decimal"
            placeholder="Total amount"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            min={0}
            step="0.01"
          />
          <TonBadge>
            <img src="/ton_symbol.png" width="29" height="29" alt="TON symbol" />
          </TonBadge>
        </Row>
        {totalInvalid && <ErrorText>Min amount is 0.1 TON</ErrorText>}
      </Field>

      <Field invalid={receiverInvalid}>
        <Legend>Receiver</Legend>
        <Row>
          <Input
            placeholder="TON address"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
          />
          <PasteButton type="button" onClick={onPaste}>Paste</PasteButton>
          <ScanButton type="button" onClick={onScan} aria-label="Scan">
            <img src="/qr.svg" width="16" height="16" alt="Scan QR" />
          </ScanButton>
        </Row>
        {receiverInvalid && <ErrorText>Enter address belonging to TON</ErrorText>}
      </Field>

      <Footer />

      <FixedCtaWrap hidden={isEditing || isModalOpen} aria-hidden={(isEditing || isModalOpen) ? true : undefined}>
        <FixedCtaInner>
          <PrimaryAction onClick={handleCreate} disabled={!canCreate}>
            Create
          </PrimaryAction>
        </FixedCtaInner>
      </FixedCtaWrap>
    </Screen>
  );
}

export default CreateBill;
