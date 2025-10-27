import React, {useCallback, useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import WebApp from "@twa-dev/sdk";
import {Button} from "./styled/styled";

/**
 * BillDetails screen ("Split bill" details)
 * ------------------------------------------------------------
 * Props are intentionally simple so the component can be reused.
 * Pass numbers in TON (not nano) for readability.
 */
export type BillDetailsProps = {
    title?: string; // e.g. "Split bill"
    goalTon: number; // 15.3
    collectedTon: number; // 0
    reciever: string;
    /**
     * UNIX seconds when the campaign ends. The timer syncs to this moment
     * using optional serverNowSec or will rely on client time if not provided.
     */
    endTimeSec: number;
    /** server's current UNIX seconds (optional but recommended for sync) */
    serverNowSec?: number;
    /** re-sync period in ms (default 2 minutes). Set 0 to disable */
    resyncEveryMs?: number;
    onContribute?: () => void;
    onShare?: () => void;
    /** Optional: list of tx history items to render (most recent first) */
    history?: Array<{ id: string; from: string; amountTon: number; atSec: number }>;
};

// ========== styles ==========
const Screen = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 120px; /* leave space for bottom bar */
`;

const Header = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 6px;
`;
const TitleWrap = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-items: center;
  gap: 2px;
`;
const Title = styled.h1`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
`;
const Subtitle = styled.span`
  font-size: 12px;
  opacity: 0.7;
`;

const SummaryCard = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
`;

const GaugeWrap = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;
const TimeLeft = styled.div`
  font-family: var(--fontSF);
  font-weight: 450;
  font-size: 45px;
  letter-spacing: 0.3px;
`;

const Actions = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`;

const PrimaryAction = styled(Button)`
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 16px;
  flex-grow: 2;
  background-color: #2990ff !important;
  color: #ffffff !important;
  font-family: var(--fontSF) !important;
  font-weight: 600 !important;
`;

const IconBtn = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #2990ff;
  color: #2990ff;
  background: #2990ff;
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

// ========== helpers ==========
const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.max(0, Math.floor(sec % 60));
    return `${pad2(m)}:${pad2(s)}`;
};

const formatTon = (n: number) => n.toLocaleString(undefined, {minimumFractionDigits: 3, maximumFractionDigits: 3});

// SVG progress ring
function ProgressRing({value}: { value: number }) {
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
                stroke="#2990ff"
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
function useSyncedCountdown(endTimeSec: number, serverNowSec?: number, resyncEveryMs: number = 120_000) {
    // offset = serverNow - clientNow (in seconds)
    const initialOffset = useMemo(() => {
        if (!serverNowSec) return 0;
        return serverNowSec - Math.floor(Date.now() / 1000);
    }, [serverNowSec]);

    const [offset, setOffset] = useState(initialOffset);
    const [left, setLeft] = useState(() => Math.max(0, endTimeSec - (Math.floor(Date.now() / 1000) + initialOffset)));

    useEffect(() => {
        const id = setInterval(() => {
            const now = Math.floor(Date.now() / 1000) + offset;
            setLeft(Math.max(0, endTimeSec - now));
        }, 1000);
        return () => clearInterval(id);
    }, [endTimeSec, offset]);

    useEffect(() => {
        if (!serverNowSec || resyncEveryMs <= 0) return;
        const r = setInterval(() => {
            try {
                const anyWebApp: any = WebApp as any;
                // If your API returns time, replace this block with a fetch to /api/time
                // Here we keep it simple: we rely on the original serverNowSec value,
                // but recompute offset against current client clock to minimize drift.
                const newOffset = serverNowSec - Math.floor(Date.now() / 1000);
                setOffset(newOffset);
            } catch {
            }
        }, resyncEveryMs);
        return () => clearInterval(r);
    }, [serverNowSec, resyncEveryMs]);

    return left;
}

// ========== component ==========
export default function BillDetails({
                                        title = "Split bill",
                                        goalTon,
                                        collectedTon,
                                        reciever,
                                        endTimeSec,
                                        serverNowSec,
                                        resyncEveryMs,
                                        onContribute,
                                        onShare,
                                        history,
                                    }: BillDetailsProps) {
    const leftSec = useSyncedCountdown(endTimeSec, serverNowSec, resyncEveryMs);

    const percent = useMemo(() => (goalTon <= 0 ? 0 : (collectedTon / goalTon) * 100), [goalTon, collectedTon]);
    const leftTon = Math.max(0, goalTon - collectedTon);

    const handleShare = useCallback(() => {
        if (onShare) return onShare();
        // Fallback share via Telegram native popup
        try {
            WebApp.openTelegramLink("https://t.me/share/url?url=" + encodeURIComponent(window.location.href));
        } catch {
        }
    }, [onShare]);

    return (
        <Screen>
            <Header>
                <TitleWrap>
                    <Title>{title}</Title>
                    <Subtitle>bot</Subtitle>
                </TitleWrap>
            </Header>

            <SummaryCard>
                <GaugeWrap>
                    <ProgressRing value={percent}/>
                    <TimeLeft aria-live="polite">{formatMMSS(leftSec)}</TimeLeft>
                </GaugeWrap>
                <Actions>
                    <PrimaryAction onClick={onContribute}>Contribute</PrimaryAction>
                    <IconBtn aria-label="Share" onClick={handleShare}>
                        <img src="/share.svg" width="20" height="20" alt="Share"/>
                    </IconBtn>
                </Actions>
            </SummaryCard>

            <StatCard>
                <StatRow>
                    <StatName>Collected</StatName>
                    <StatValue>{formatTon(collectedTon)} TON</StatValue>
                </StatRow>
                <StatRow>
                    <StatName>Goal</StatName>
                    <StatValue>{formatTon(goalTon)} TON</StatValue>
                </StatRow>
                <StatRow>
                    <StatName>Reciever</StatName>
                    <StatValue>{reciever}</StatValue>
                </StatRow>
                <StatRow>
                    <StatName>Left</StatName>
                    <StatValue>{formatTon(leftTon)} TON</StatValue>
                </StatRow>
            </StatCard>

            <HistoryCard>
                <Title as="h2" style={{fontSize: 16, margin: 0, marginBottom: 8, fontWeight: 700}}>History</Title>
                {!history || history.length === 0 ? (
                    <HistoryEmpty>No transactions</HistoryEmpty>
                ) : (
                    history.map((h) => (
                        <HistoryItem key={h.id}>
              <span>
                <strong>{formatTon(h.amountTon)} TON</strong> from {h.from}
              </span>
                            <span style={{opacity: 0.7}}>{new Date(h.atSec * 1000).toLocaleTimeString()}</span>
                        </HistoryItem>
                    ))
                )}
            </HistoryCard>
        </Screen>
    );
}