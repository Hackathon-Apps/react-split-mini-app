import React, { useMemo, useState} from "react";
import {buildMiniAppLink} from "../utils/deeplink";
import ShareSheet from "./ShareSheet";
import {useBillQuery} from "../api/queries";
import {formatAddress} from "../utils/ton";
import {useNavigate, useParams} from "react-router-dom";
import BillTransactions from "./ui/BillTransactions";
import BillHero from "./ui/BillHero";
import BillStatsClosed from "./ui/BillStatsClosed";
import {Screen, Actions, IconBtn, PrimaryAction, SummaryCard} from "./styled/styled";

export default function BillDetailsScreen() {
    const navigate = useNavigate();
    const {id} = useParams<{ id?: string, created_at: string }>();

    const {data: bill, isLoading} = useBillQuery(id as string);

    const percent = useMemo(
        () => (bill?.goal ? (bill.goal <= 0 ? 0 : (bill.collected / bill.goal) * 100) : 0),
        [bill?.goal, bill?.collected]
    );
    const url = useMemo(
        () => buildMiniAppLink("CryptoSplitBot", {id: bill?.id, tab: "history"}),
        [bill?.id]
    );

    const [shareOpen, setShareOpen] = useState(false);

    if (isLoading || !bill) return <div>Loading…</div>;

    return (
        <Screen>
            <SummaryCard>
                <BillHero percent={percent} leftSec={0} closed={true} />
            </SummaryCard>

            <BillStatsClosed collected={bill.collected} goal={bill.goal} receiver={formatAddress(bill.destination_address)} created_at={bill.created_at}/>
            <Actions>
                <PrimaryAction onClick={() => navigate(`https://tonviewer.com/${bill.proxy_wallet}`)} disabled={closed}>Blockchain Explorer</PrimaryAction>
                <IconBtn aria-label="Share" onClick={() => setShareOpen(true)} disabled={closed}>
                    <img src="/share.svg" width="20" height="20" alt="Share"/>
                </IconBtn>
            </Actions>
            <BillTransactions transactions={bill.transactions} />
            <ShareSheet open={shareOpen} url={url} onClose={() => setShareOpen(false)} shareText="Split the bill with me"/>
        </Screen>
    );
}
