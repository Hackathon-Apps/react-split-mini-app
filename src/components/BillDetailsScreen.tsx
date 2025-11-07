import React, { useMemo, useState} from "react";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import {useBillQuery} from "../api/queries";
import {formatAddress} from "../utils/ton";
import {useParams} from "react-router-dom";
import BillTransactions from "./ui/BillTransactions";
import BillHero from "./ui/BillHero";
import BillStatsClosed from "./ui/BillStatsClosed";
import {Screen, Actions, IconBtn, SummaryCard, PrimaryAction} from "./styled/styled";
import LoadingOverlay from "./ui/Loading";
import {useBillSubscription} from "../hooks/useBillSubscription";
import WebApp from "@twa-dev/sdk";

export default function BillDetailsScreen() {
    const {id} = useParams<{ id?: string, created_at: string }>();

    const {data: bill, isLoading} = useBillQuery(id as string);
    useBillSubscription(id);

    const percent = useMemo(
        () => (bill?.goal ? (bill.goal <= 0 ? 0 : (bill.collected / bill.goal) * 100) : 0),
        [bill?.goal, bill?.collected]
    );
    const url = useMemo(
        () => buildMiniAppLink("CryptoSplitBot", {id: bill?.id, tab: "history"}),
        [bill?.id]
    );

    const [shareOpen, setShareOpen] = useState(false);

    if (isLoading || !bill) return <LoadingOverlay/>;

    return (
        <Screen>
            <SummaryCard>
                <BillHero percent={percent} leftSec={0} closed={true} />
            </SummaryCard>

            <BillStatsClosed collected={bill.collected} goal={bill.goal} receiver={formatAddress(bill.destination_address)} created_at={bill.created_at} closed_at={bill.ended_at}/>
            <Actions>
                <PrimaryAction onClick={() =>
                    WebApp.showConfirm(`Open ${url}?`, (confirmed) => {
                        if (confirmed) WebApp.openTelegramLink(url);
                })}>
                    <img src="/global.svg" width="20" height="20" alt="Global"/>
                    <span style={{verticalAlign: "top", marginLeft: 5}}>Blockchain Explorer</span>
                </PrimaryAction>
                <IconBtn aria-label="Share" onClick={() => setShareOpen(true)}>
                    <img src="/share.svg" width="20" height="20" alt="Share"/>
                </IconBtn>
            </Actions>
            <BillTransactions transactions={bill.transactions} />
            <ShareSheet open={shareOpen} url={url} onClose={() => setShareOpen(false)} shareText="Split the bill with me"/>
        </Screen>
    );
}
