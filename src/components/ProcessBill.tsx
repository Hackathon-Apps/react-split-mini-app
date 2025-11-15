import React, {useEffect, useMemo, useState} from "react";
import {Screen, Actions, IconBtn, PrimaryAction, SummaryCard} from "./styled/styled";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import PaySheet from "./PaySheet";
import {useTonConnect} from "../hooks/useTonConnect";
import {useBillQuery, useTonBalance} from "../api/queries";
import {formatTon} from "../utils/ton";
import {useTonAddress} from "@tonconnect/ui-react";
import {useParams} from "react-router-dom";
import {fromNano} from "@ton/core";
import BillTransactions from "./ui/BillTransactions";
import {useBillCountdown} from "../hooks/useBillCountDown";
import {useContribute} from "../hooks/useContribute";
import BillStats from "./ui/BillStats";
import BillHero from "./ui/BillHero";
import {useEnsureTelegramWallet} from "../hooks/useEnsureTelegramWallet";
import LoadingOverlay from "./ui/Loading";
import {useBillSubscription} from "../hooks/useBillSubscription";
import {useRefund} from "../hooks/useRefund";

const LAST_BILL_KEY = "lastBillId";

export default function ProcessBill() {
    const {id} = useParams<{ id?: string }>();
    const {wallet, network} = useTonConnect();
    const sender = useTonAddress();

    const {data: bill, isLoading} = useBillQuery(id as string);
    useBillSubscription(id);
    const leftSec = useBillCountdown(bill?.created_at);

    const percent = useMemo(
        () => (bill?.goal ? (bill.goal <= 0 ? 0 : (bill.collected / bill.goal) * 100) : 0),
        [bill?.goal, bill?.collected]
    );
    const leftTon = bill ? Math.max(0, bill.goal - bill.collected) : 0;
    const url = useMemo(
        () => buildMiniAppLink("CryptoSplitBot", bill?.id),
        [bill?.id]
    );

    const [shareOpen, setShareOpen] = useState(false);
    const [payOpen, setPayOpen] = useState(false);
    const [amount, setAmount] = useState(0);

    const {data: bal, isLoading: balLoading} =
        useTonBalance(wallet || undefined, network || undefined);
    const balanceText = balLoading ? "•••" : formatTon(bal?.nano ?? 0);

    const {contribute, loading: paying} = useContribute(bill?.id, bill?.proxy_wallet, bill?.state_init_hash, sender);
    const {refund, loading: refunding} = useRefund(bill?.id, bill?.proxy_wallet, bill?.state_init_hash, sender);

    const isCreator = useMemo(() => {
        if (!sender || !bill?.creator_address) return false;
        return sender.toLowerCase() === bill.creator_address.toLowerCase();
    }, [sender, bill?.creator_address]);
    const isRefunded = bill?.status === "REFUNDED";
    const closedByStatus = bill ? bill.status === "DONE" || bill.status === "REFUNDED" : false;
    const closed = bill ? closedByStatus || leftTon === 0 || leftSec == 0 : false;
    const showRefundAction = bill?.status === "TIMEOUT" && isCreator && bill.collected != 0;
    const showRefundedState = isRefunded && isCreator;
    const hideShare = isCreator && (showRefundAction || showRefundedState);

    useEffect(() => {
        if (!bill) return;

        if (bill.status === "REFUNDED") {
            localStorage.removeItem(LAST_BILL_KEY);
            return;
        }

        if (bill.status === "DONE" || (!isCreator && bill.status === "TIMEOUT") || (bill.status === "TIMEOUT" && bill.collected === 0)) {
            localStorage.removeItem(LAST_BILL_KEY);
            return;
        }

        localStorage.setItem(LAST_BILL_KEY, bill.id);
    }, [bill?.id, bill?.status, isCreator]);

    useEffect(() => {
        if (isRefunded) {
            localStorage.removeItem(LAST_BILL_KEY);
        }
    }, [isRefunded]);

    useEffect(() => {
        if (leftSec == 0 && !isCreator) {
            localStorage.removeItem(LAST_BILL_KEY);
        }
    }, [leftSec, isCreator]);

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
    const handleRefund = async () => {
        try {
            await refund();
            await ensureTGWallet();
        } catch (e) {
            console.error("TON refund failed", e);
        }
    };

    if (isLoading || !bill) return <LoadingOverlay/>;

    return (
        <Screen>
            <SummaryCard>
                <BillHero percent={percent} leftSec={leftSec} closed={closed} />
                <Actions disabled={!sender}>
                    {showRefundAction || showRefundedState ? (
                        <PrimaryAction
                            onClick={showRefundAction ? handleRefund : undefined}
                            disabled={showRefundedState || refunding}
                        >
                            {showRefundedState ? "Refunded" : refunding ? "Refunding..." : "Refund"}
                        </PrimaryAction>
                    ) : (
                        <PrimaryAction onClick={() => setPayOpen(true)} disabled={closed || paying}>
                            Contribute
                        </PrimaryAction>
                    )}
                    {!hideShare && (
                        <IconBtn aria-label="Share" onClick={() => setShareOpen(true)} disabled={closed}>
                            <img src="/share.svg" width="20" height="20" alt="Share"/>
                        </IconBtn>
                    )}
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
