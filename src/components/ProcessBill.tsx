import React, {useEffect, useMemo, useState} from "react";
import {Screen, Actions, IconBtn, PrimaryAction, SummaryCard} from "./styled/styled";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import PaySheet from "./PaySheet";
import {useTonConnect} from "../hooks/useTonConnect";
import {useBillQuery, useTonBalance} from "../api/queries";
import {formatAddress, formatTon} from "../utils/ton";
import {useTonAddress} from "@tonconnect/ui-react";
import {useNavigate, useParams, useSearchParams} from "react-router-dom";
import {fromNano} from "@ton/core";
import BillTransactions from "./ui/BillTransactions";
import {useBillCountdown} from "../hooks/useBillCountDown";
import {useContribute} from "../hooks/useContribute";
import BillStats from "./ui/BillStats";
import BillHero from "./ui/BillHero";
import {useEnsureTelegramWallet} from "../hooks/useEnsureTelegramWallet";
import LoadingOverlay from "./ui/Loading";

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
        () => (bill?.goal ? (bill.goal <= 0 ? 0 : (bill.collected / bill.goal) * 100) : 0),
        [bill?.goal, bill?.collected]
    );
    const leftTon = bill ? Math.max(0, bill.goal - bill.collected) : 0;
    const url = useMemo(
        () => buildMiniAppLink("CryptoSplitBot", {id: bill?.id, created_at: bill?.created_at, tab: "bills"}),
        [bill?.id, bill?.created_at]
    );

    const [shareOpen, setShareOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [amount, setAmount] = useState(0);

    const {data: bal, isLoading: balLoading} =
        useTonBalance(wallet || undefined, network || undefined);
    const balanceText = balLoading ? "•••" : formatTon(bal?.nano ?? 0);

    const {contribute, loading: paying} = useContribute(bill?.id, bill?.proxy_wallet, bill?.state_init_hash, sender)

    const closed = bill ? leftTon === 0 || leftSec == 0 : false;

    useEffect(() => {
        if (!bill) return;
        localStorage.setItem(LAST_BILL_KEY, bill.id);
    }, [bill?.id]);

    useEffect(() => {
        if (leftSec == 0) {
            localStorage.removeItem(LAST_BILL_KEY);
        }
    }, [leftSec]);

    const ensureTGWallet = useEnsureTelegramWallet();
    const handlePay = async (amount: number) => {
        try {
            await contribute(amount);
            await ensureTGWallet();
            setPayOpen(false);
        } catch (e) {
            console.error("TON transfer failed", e);
        }
    };

    if (isLoading || !bill) return <LoadingOverlay/>;

    return (
        <Screen>
            <SummaryCard>
                <BillHero percent={percent} leftSec={leftSec} closed={closed} />
                <Actions disabled={closed}>
                    <PrimaryAction onClick={() => setPayOpen(true)} disabled={closed}>Contribute</PrimaryAction>
                    <IconBtn aria-label="Share" onClick={() => setShareOpen(true)} disabled={closed}>
                        <img src="/share.svg" width="20" height="20" alt="Share"/>
                    </IconBtn>
                </Actions>
            </SummaryCard>

            <BillStats collected={bill.collected} goal={bill.goal} receiver={formatAddress(bill.destination_address)} left={leftTon}/>

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
