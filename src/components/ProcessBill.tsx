import React, {useEffect, useMemo, useRef, useState} from "react";
import styled, {css} from "styled-components";
import {Button} from "./styled/styled";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import PaySheet from "./PaySheet";
import {useTonConnect} from "../hooks/useTonConnect";
import {useBillQuery, useCreateTxMutation, useTonBalance, useTonTransfer} from "../api/queries";
import {buildContributePayload, formatTon} from "../utils/ton";
import {SendTransactionResponse, useTonAddress} from "@tonconnect/ui-react";
import {useNavigate, useParams} from "react-router-dom";

// ========== styles ==========
const Screen = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 900px;
    margin: 0 auto;
    padding-bottom: 120px; /* leave space for bottom bar */
`;

const SummaryCard = styled.div`
    display: grid;
    justify-items: center;
    align-items: center;
    gap: 16px;
    padding: 16px;
`;

const Stage = styled.div`
    position: relative;
    width: 100%;
    min-height: 220px; /* используется только в режиме наложения */
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
`;

const stackCenter = css`
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
`;

const TimerBox = styled.div<{ hidden?: boolean }>`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 6px 10px;
    border-radius: 12px;
    background: transparent;
    ${stackCenter};
    transition: opacity 400ms ease, transform 400ms ease;
    opacity: ${({hidden}) => (hidden ? 0 : 1)};
    transform: ${({hidden}) => (hidden ? "translate(-50%, -50%) scale(0.98)" : "translate(-50%, -50%)")};
`;

const TimeLeft = styled.div`
    font-family: var(--fontSF),serif;
    font-weight: 450;
    font-size: 45px;
    letter-spacing: 0.3px;
`;

const RingBox = styled.div<{ pop?: boolean }>`
    ${stackCenter};
    transition: transform 400ms ease;
    transform: ${({pop}) => (pop ? "translate(-50%, -50%) scale(1.04)" : "translate(-50%, -50%)")};
`;

const Actions = styled.div<{ disabled?: boolean }>`
    display: flex;
    width: 100%;
    gap: 8px;
    opacity: ${({disabled}) => (disabled ? 0.5 : 1)};
    pointer-events: ${({disabled}) => (disabled ? "none" : "auto")};
`;

const PrimaryAction = styled(Button)`
    border-radius: 14px;
    padding: 14px 20px;
    font-size: 16px;
    flex-grow: 2;
    background-color: #2990ff !important;
    color: #ffffff !important;
    font-family: var(--fontSF),serif !important;
    font-weight: 600 !important;
`;

const IconBtn = styled.button<{ disabled?: boolean }>`
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #2990ff;
    color: #2990ff;
    background: #2990ff;
    opacity: ${({disabled}) => (disabled ? 0.5 : 1)};
    pointer-events: ${({disabled}) => (disabled ? "none" : "auto")};
`;

const StatCard = styled.div`
    border: 1px solid #3a3a3a;
    border-radius: 16px;
    overflow: hidden;
`;
const StatRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;

    &:not(:last-child) {
        border-bottom: 1px solid #2c2c2c;
    }
`;
const StatName = styled.span`
    opacity: 0.8;
`;
const StatValue = styled.span`
    font-weight: 700;
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
`;

const HistoryCard = styled.div`
    border: 1px solid #2c2c2c;
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
`;

const HistoryHeader = styled.button<{ open?: boolean }>`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    background: transparent;
    border: 0;
    cursor: pointer;
    color: inherit;

    & > span {
        font-weight: 700;
        font-size: 16px;
    }

    & svg {
        transition: transform 250ms ease;
        transform: rotate(${({open}) => (open ? 180 : 0)}deg);
    }
`;

const HistoryBodyOuter = styled.div`
    overflow: hidden;
`;

const HistoryBodyInner = styled.div`
    padding: 12px 14px;
`;

const HistoryEmpty = styled.div`
    opacity: 0.6;
    text-align: center;
    padding: 12px 0;
`;
const HistoryItem = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 0;

    &:not(:last-child) {
        border-bottom: 1px dashed #2c2c2c;
    }
`;

// ========== utils ==========
const LAST_BILL_KEY = "lastBillId";
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.max(0, Math.floor(sec % 60));
    return `${pad2(m)}:${pad2(s)}`;
};

// SVG progress ring
function ProgressRing({value, color = "#2990ff"}: { value: number; color?: string }) {
    const radius = 44;
    const stroke = 6;
    const circumference = 2 * Math.PI * radius;
    const clamped = Math.max(0, Math.min(100, value));
    const offset = circumference - (clamped / 100) * circumference;

    return (
        <svg width={200} height={200} viewBox="0 0 110 110" role="img" aria-label={`${Math.round(clamped)}% collected`}>
            <circle cx="55" cy="55" r={radius} stroke="#4c4c4c" strokeWidth={stroke} fill="none"/>
            <circle
                cx="55"
                cy="55"
                r={radius}
                stroke={color}
                strokeWidth={stroke}
                strokeLinecap="round"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                transform="rotate(-90 55 55)"
            />
            <text x="55" y="55" textAnchor="middle" fontWeight={400} fontSize="20" fill="currentColor">
                {Math.round(clamped)}%
            </text>
            <text x="55" y="70" textAnchor="middle" fontWeight={400} fontSize="10" fill="#4c4c4c">
                collected
            </text>
        </svg>
    );
}

// ========== hooks ==========
function useSyncedCountdown(endTimeSec: number | null, serverNowSec?: number, resyncEveryMs: number = 120_000) {
  // защищаемся: если endTimeSec нет — не запускаем таймеры
  const safeEnd = endTimeSec ?? 0;

  const initialOffset = useMemo(() => {
    if (!serverNowSec) return 0;
    return serverNowSec - Math.floor(Date.now() / 1000);
  }, [serverNowSec]);

  const [offset, setOffset] = useState(initialOffset);
  const [left, setLeft] = useState(() => Math.max(0, safeEnd - Math.floor(Date.now() / 1000)));

  useEffect(() => {
    if (!safeEnd) return;                           // <-- guard
    const id = setInterval(() => {
      const now = Math.floor(Date.now() / 1000) + offset;
      setLeft(Math.max(0, safeEnd - now));
    }, 1000);
    return () => clearInterval(id);
  }, [safeEnd, offset]);

  useEffect(() => {
    if (!serverNowSec || resyncEveryMs <= 0) return;
    const r = setInterval(() => {
      const newOffset = serverNowSec - Math.floor(Date.now() / 1000);
      setOffset(newOffset);
    }, resyncEveryMs);
    return () => clearInterval(r);
  }, [serverNowSec, resyncEveryMs]);

  return left;
}

export default function ProcessBill() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();

  // Навигацию при отсутствии id делаем через useEffect,
  // НО хуки ниже всё равно вызываются всегда (с безопасными значениями)
  useEffect(() => {
    if (!id) navigate("/bills", { replace: true });
  }, [id, navigate]);

  // даже если id нет — хук должен быть вызван.
  // В твоём useBillQuery внутри должно быть enabled: !!id
  const { data: bill, isLoading } = useBillQuery(id as string);
  const { wallet, network } = useTonConnect();
  const sender = useTonAddress();

  // вычисления — через безопасные дефолты
  const endEpochSec = bill ? Math.floor(Date.parse(bill.created_at) / 1000) + 600 : null;
  const leftSec = useSyncedCountdown(endEpochSec);

  const percent = useMemo(
    () => (bill ? (bill.goal <= 0 ? 0 : (bill.collected / bill.goal) * 100) : 0),
    [bill?.goal, bill?.collected]
  );
  const leftTon = bill ? Math.max(0, bill.goal - bill.collected) : 0;
  const url = useMemo(
    () => buildMiniAppLink("CryptoSplitBot", { bill }), 
    [bill]
  );

  const [shareOpen, setShareOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);
  const [amount, setAmount] = useState(0);

  const { data: bal, isLoading: balLoading } =
    useTonBalance(wallet || undefined, network || undefined);
  const balanceText = balLoading ? "•••" : formatTon(bal?.tons ?? 0);

  const transfer = useTonTransfer();
  const contribute = useCreateTxMutation(bill?.id ?? "", sender);

  const engaged = bill ? leftTon === 0 : false;

  // история (фикс deps: было history?.length — такой переменной нет)
  const [historyOpen, setHistoryOpen] = useState(false);
  const bodyOuterRef = useRef<HTMLDivElement | null>(null);
  const bodyInnerRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState(0);

  useEffect(() => {
    if (!bill) return;
    localStorage.setItem(LAST_BILL_KEY, bill.id);
  }, [bill?.id]);

  useEffect(() => {
    if (leftSec === 0 && bill) {
      localStorage.removeItem(LAST_BILL_KEY);
      navigate("/bills", { replace: true });
    }
  }, [leftSec, bill, navigate]);

  useEffect(() => {
    const measure = () => {
      const h = bodyInnerRef.current?.scrollHeight ?? 0;
      setBodyHeight(historyOpen ? h : 0);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [historyOpen, bill?.transactions?.length]);

  const handlePay = async (amount: number) => {
    try {
      if (!bill) return;
      const payload = buildContributePayload();
      await transfer.mutateAsync({
        to: bill.proxy_wallet,
        amountTons: amount,
        payload,
      });
      
      await contribute.mutateAsync({ amount, op_type: "CONTRIBUTE" });
      setPayOpen(false);
    } catch (e) {
      console.error("TON transfer failed", e);
    }
  };

  // ----- РЕНДЕР -----
  // Никаких ранних return ДО хуков; ниже — условный JSX:
  if (!id) return null;               // теперь это безопасно: все хуки уже вызваны
  if (isLoading || !bill) return <div>Loading…</div>;

  return (
    <Screen>
      <SummaryCard>
        <Stage>
          <RingBox pop={engaged} style={{
            transform: engaged
              ? "translate(-50%, -50%) scale(1.04)"
              : "translate(calc(-50% - 75px), -50%) scale(1.0)",
            transition: "transform 420ms ease"
          }}>
            <div style={{position: "relative", width: 200, height: 200}}>
              <div style={{ position: "absolute", inset: 0, opacity: engaged ? 0 : 1, transition: "opacity 300ms ease" }}>
                <ProgressRing value={percent} color="#2990ff"/>
              </div>
              <div style={{ position: "absolute", inset: 0, opacity: engaged ? 1 : 0, transition: "opacity 300ms ease" }}>
                <ProgressRing value={percent} color="#27ae60"/>
              </div>
            </div>
          </RingBox>

          <TimerBox hidden={engaged} aria-live="polite" style={{
            transform: engaged
              ? "translate(-50%, -50%) scale(0.98)"
              : "translate(calc(-50% + 75px), -50%)",
            transition: "opacity 320ms ease, transform 420ms ease"
          }}>
            <TimeLeft>{formatMMSS(leftSec)}</TimeLeft>
          </TimerBox>
        </Stage>

        <Actions disabled={engaged}>
          <PrimaryAction onClick={() => setPayOpen(true)} disabled={engaged}>Contribute</PrimaryAction>
          <IconBtn aria-label="Share" onClick={() => setShareOpen(true)} disabled={engaged}>
            <img src="/share.svg" width="20" height="20" alt="Share"/>
          </IconBtn>
        </Actions>
      </SummaryCard>

      <StatCard>
        <StatRow><StatName>Collected</StatName><StatValue>{formatTon(bill.collected)} TON</StatValue></StatRow>
        <StatRow><StatName>Goal</StatName><StatValue>{formatTon(bill.goal)} TON</StatValue></StatRow>
        <StatRow><StatName>Receiver</StatName><StatValue>{bill.destination_address}</StatValue></StatRow>
        <StatRow><StatName>Left</StatName><StatValue>{formatTon(leftTon)} TON</StatValue></StatRow>
      </StatCard>

      <HistoryCard>
        <HistoryHeader open={historyOpen} onClick={() => setHistoryOpen(o => !o)} aria-expanded={historyOpen}>
          <span>History</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </HistoryHeader>
        <HistoryBodyOuter ref={bodyOuterRef} style={{height: bodyHeight, transition: "height 260ms ease"}}>
          <HistoryBodyInner ref={bodyInnerRef}>
            {!bill.transactions || bill.transactions.length === 0 ? (
              <HistoryEmpty>No transactions</HistoryEmpty>
            ) : (
              bill.transactions.map((h) => (
                <HistoryItem key={h.id}>
                  <span><strong>{formatTon(h.amount)} TON</strong> from {h.sender_address}</span>
                  <span style={{opacity: 0.7}}>{new Date(h.created_at).toLocaleTimeString()}</span>
                </HistoryItem>
              ))
            )}
          </HistoryBodyInner>
        </HistoryBodyOuter>
      </HistoryCard>

      <ShareSheet open={shareOpen} url={url} onClose={() => setShareOpen(false)} shareText="Split the bill with me" />
      <PaySheet
        open={payOpen}
        onClose={() => setPayOpen(false)}
        totalTon={bill.goal}
        amountTon={amount}
        onChange={setAmount}
        onPay={handlePay}
        balanceTon={balanceText}
      />
    </Screen>
  );
}
