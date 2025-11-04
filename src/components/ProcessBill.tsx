import React, {useEffect, useMemo, useState} from "react";
import styled from "styled-components";
import {Button} from "./styled/styled";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import PaySheet from "./PaySheet";
import {useTonConnect} from "../hooks/useTonConnect";
import {useBillQuery, useTonBalance} from "../api/queries";
import {formatTon} from "../utils/ton";
import {useTonAddress} from "@tonconnect/ui-react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {fromNano} from "@ton/core";
import BillTransactions from "./ui/BillTransactions";
import {useBillCountdown} from "../hooks/useBillCountDown";
import {useContribute} from "../hooks/useContribute";
import BillStats from "./ui/BillStats";
import BillHero from "./ui/BillHero";

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

const LAST_BILL_KEY = "lastBillId";

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
    const leftSec = useBillCountdown(bill?.created_at);

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

    const {contribute, loading: paying} = useContribute(bill?.id, bill?.proxy_wallet, bill?.state_init_hash, sender)

    const engaged = bill ? leftTon === 0 || leftSec == 0 : false;

    useEffect(() => {
        if (!bill) return;
        localStorage.setItem(LAST_BILL_KEY, bill.id);
    }, [bill?.id]);

    useEffect(() => {
        if (leftSec == 0) {
            localStorage.removeItem(LAST_BILL_KEY);
        }
    }, [leftSec]);

    const handlePay = async (amount: number) => {
        try {
            await contribute(amount);
            setPayOpen(false);
        } catch (e) {
            console.error("TON transfer failed", e);
        }
    };

    if (isLoading || !bill) return <div>Loading…</div>;

    return (
        <Screen>
            <SummaryCard>
                <BillHero percent={percent} leftSec={leftSec} engaged={engaged} />
                <Actions disabled={engaged}>
                    <PrimaryAction onClick={() => setPayOpen(true)} disabled={engaged}>Contribute</PrimaryAction>
                    <IconBtn aria-label="Share" onClick={() => setShareOpen(true)} disabled={engaged}>
                        <img src="/share.svg" width="20" height="20" alt="Share"/>
                    </IconBtn>
                </Actions>
            </SummaryCard>

            <BillStats collected={bill.collected} goal={bill.goal} receiver={bill.destination_address} left={leftTon}/>

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
