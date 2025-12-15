import {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {Address} from "@ton/ton";
import {Screen, Button, TrailingIconButton} from "./styled/styled";
import WebApp from "@twa-dev/sdk";
import {useUIState} from "../state/uiState";
import {useTonAddress} from "@tonconnect/ui-react";
import {useCreateBillMutation} from "../api/queries";
import {toNano} from "@ton/core";
import {useNavigate} from "react-router-dom";
import {FormField} from "./ui/FormField";

const Input = styled.input`
  flex: 1;
  box-sizing: border-box;
  height: 36px;
  padding: 10px 8px;
  border: 0;
  background: transparent;
  color: inherit;
  outline: none;
  font-size: 16px;
  line-height: 1.2;
  -webkit-appearance: none;
  border-radius: 0;

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
    font-family: var(--fontRoboto), serif;
    font-weight: 600;
    font-size: 16px;
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
  font-family: var(--fontSF), serif;
  font-size: 16px;
  cursor: pointer;
  padding: 0 6px;
  height: 29px;
  display: inline-flex;
  align-items: center;
`;

const ScanButton = styled(TrailingIconButton)`
  border-color: #2990FF;
  color: #2990FF;
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
  font-family: var(--fontSF), serif !important;
  font-weight: 600 !important;

  &:disabled {
    opacity: 0.6;
    pointer-events: none;
  }
`;

const CtaNote = styled.div`
  margin-top: 8px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 12px;
  line-height: 1.4;
`;

const LAST_BILL_KEY = "lastBillId";

export function CreateBill() {
    const [total, setTotal] = useState("");
    const [receiver, setReceiver] = useState("");
    const sender = useTonAddress();
    const {isEditing, isModalOpen} = useUIState();
    const createBill = useCreateBillMutation();
    const navigate = useNavigate();

    // восстановить последний id, если есть
    useEffect(() => {
        const last = localStorage.getItem(LAST_BILL_KEY);
        if (last) navigate(`/bills/${last}`, {replace: true});
    }, [navigate]);

    const onScan = useCallback(() => {
        try {
            WebApp.showScanQrPopup({text: "Scan TON address"}, (data) => {
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
            WebApp.readTextFromClipboard((text) => {
                if (text) return setReceiver(String(text).trim());
            });
        } catch {
        }
        try {
            const text = await navigator.clipboard.readText();
            if (text) return setReceiver(String(text).trim());
        } catch {
        }
        const fallback = window.prompt("Paste TON address");
        if (fallback) setReceiver(fallback.trim());
    }, []);

    const minPart = 0.1;
    const isValidAmount = (v: string) => {
        const n = Number(v);
        return Number.isFinite(n) && n >= minPart;
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
        try {
            const res = await createBill.mutateAsync({
                goal: Number(toNano(total)),
                destination_address: receiver,
                sender,
            });
            localStorage.setItem(LAST_BILL_KEY, res.id);
            navigate(`/bills/${res.id}`, {replace: true});
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <Screen>
            <FormField
                label="Bill"
                invalid={totalInvalid}
                error="Min amount is 0.1 TON"
            >
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
                    <img src="/ton_symbol.png" width="29" height="29" alt="TON symbol"/>
                </TonBadge>
            </FormField>
            <FormField
                label="Receiver"
                invalid={receiverInvalid}
                error="Enter address belonging to TON"
            >
            <Input
                placeholder="TON address"
                value={receiver}
                onChange={(e) => setReceiver(e.target.value)}
            />
            <PasteButton type="button" onClick={onPaste}>Paste</PasteButton>
            <ScanButton type="button" onClick={onScan} aria-label="Scan">
                <img src="/qr.svg" width="16" height="16" alt="Scan QR"/>
            </ScanButton>
        </FormField>
            <FixedCtaWrap hidden={isEditing || isModalOpen} aria-hidden={(isEditing || isModalOpen) ? true : undefined}>
                <FixedCtaInner>
                    <PrimaryAction onClick={handleCreate} disabled={!canCreate}>
                        Create
                    </PrimaryAction>
                    <CtaNote>If the goal is not achieved within 10 minutes, the funds will be returned back.</CtaNote>
                </FixedCtaInner>
            </FixedCtaWrap>
        </Screen>
    );
}

export default CreateBill;
