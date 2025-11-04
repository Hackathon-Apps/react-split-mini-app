import React, {useEffect, useMemo, useState} from "react";
import styled, {css} from "styled-components";
import {Button} from "./styled/styled";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import PaySheet from "./PaySheet";
import {useTonConnect} from "../hooks/useTonConnect";
import {useBillQuery, useCreateTxMutation, useTonBalance, useTonTransfer} from "../api/queries";
import {buildContributePayload, formatTon} from "../utils/ton";
import {useTonAddress} from "@tonconnect/ui-react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {fromNano} from "@ton/core";
import BillTransactions from "./ui/BillTransactions";

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
    font-family: var(--fontSF), serif;
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
    font-family: var(--fontSF), serif !important;
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

export default function ProcessBill() {
    const navigate = useNavigate();
    const {id} = useParams<{ id?: string, created_at: string }>();
    const [searchParams, _] = useSearchParams();
    const created_at = searchParams.get("created_at");

    useEffect(() => {
        if (created_at && (Date.parse(created_at) / 1000 + 600 - Date.now() / 1000) < 0) navigate("/join/timeout");
    }, [created_at, navigate]);
    const {wallet, network} = useTonConnect();
    const sender = useTonAddress();

    const {data: bill, isLoading} = useBillQuery(id as string);
    const endTimeSec = Math.floor(bill? (Date.parse(bill.created_at) / 1000 + 600) : Date.now() / 1000);
    const [leftSec, setLeftSec] = useState<number>(Math.max(0, endTimeSec - Math.floor(Date.now() / 1000)))

    useEffect(() => {
        const interval = setInterval(() => {
            const now = Math.floor(Date.now() / 1000)
            setLeftSec(Math.max(0, endTimeSec - now));
        }, 1000);
        return () => clearInterval(interval);
    }, [leftSec, endTimeSec]);

    const percent = useMemo(
        () => (bill ? (bill.goal <= 0 ? 0 : (bill.collected / bill.goal) * 100) : 0),
        [bill?.goal, bill?.collected]
    );
    const leftTon = bill ? Math.max(0, bill.goal - bill.collected) : 0;
    const url = useMemo(
        () => buildMiniAppLink("CryptoSplitBot", {id: bill?.id, created_at: bill?.created_at}),
        [bill?.id, bill?.created_at]
    );

    const [shareOpen, setShareOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [amount, setAmount] = useState(0);

    const {data: bal, isLoading: balLoading} =
        useTonBalance(wallet || undefined, network || undefined);
    const balanceText = balLoading ? "•••" : formatTon(bal?.tons ?? 0);

    const transfer = useTonTransfer();
    const contribute = useCreateTxMutation(bill?.id ?? "", sender);

    const engaged = bill ? leftTon === 0 || leftSec == 0 : false;

    useEffect(() => {
        if (!bill) return;
        localStorage.setItem(LAST_BILL_KEY, bill.id);
    }, [bill?.id]);

    const handlePay = async (amount: number) => {
        try {
            if (!bill) return;
            const payload = buildContributePayload();
            await transfer.mutateAsync({
                to: bill.proxy_wallet,
                amountTons: amount,
                payload,
                stateInitBase64: bill.state_init_hash,
            });

            await contribute.mutateAsync({amount, op_type: "CONTRIBUTE"});
            setPayOpen(false);
        } catch (e) {
            console.error("TON transfer failed", e);
        }
    };

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
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                opacity: engaged ? 0 : 1,
                                transition: "opacity 300ms ease"
                            }}>
                                <ProgressRing value={percent} color="#2990ff"/>
                            </div>
                            <div style={{
                                position: "absolute",
                                inset: 0,
                                opacity: engaged ? 1 : 0,
                                transition: "opacity 300ms ease"
                            }}>
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

            <BillTransactions transactions={bill.transactions} />

            <ShareSheet open={shareOpen} url={url} onClose={() => setShareOpen(false)}
                        shareText="Split the bill with me"/>
            <PaySheet
                open={payOpen}
                onClose={() => setPayOpen(false)}
                totalTon={Number(fromNano(bill.goal))}
                amountTon={amount}
                onChange={setAmount}
                onPay={handlePay}
                balanceTon={balanceText}
            />
        </Screen>
    );
}
