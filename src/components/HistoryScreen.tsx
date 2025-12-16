import {
    Card,
    CardRow,
    CardRowDivider,
    CardRowName,
    CardRowValue,
    HistoryHeader,
    HistoryItemInfo,
    InfoScreen,
    Screen
} from "./styled/styled";
import {useHistoryQuery} from "../api/queries";
import type {HistoryItem} from "../api/types";
import {useTonAddress} from "@tonconnect/ui-react";
import LoadingOverlay from "./ui/Loading";
import {formatAddress, formatTon} from "../utils/ton";
import {formatDayTitle, formatTime} from "../utils/date";
import {NavLink} from "react-router-dom";
import {useMemo, useState} from "react";

export default function HistoryScreen() {
    const sender = useTonAddress();
    const {data: history, isLoading, isError} = useHistoryQuery(sender)
    const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
    const grouped = useMemo(() => {
        if (!history) return [];
        return history.reduce((acc, item) => {
            const title = formatDayTitle(item.created_at);
            const last = acc[acc.length - 1];
            if (last && last.title === title) {
                last.items.push(item);
                return acc;
            }
            acc.push({title, items: [item]});
            return acc;
        }, [] as { title: string; items: HistoryItem[] }[]);
    }, [history]);

    if (!sender) return <InfoScreen>Connect wallet to get bills history</InfoScreen>
    if (isLoading) return <LoadingOverlay/>
    if (!history || history.length == 0) return <InfoScreen>No transactions</InfoScreen>
    if (isError) return <InfoScreen>Unable to load transactions</InfoScreen>
    return (
        <Screen>
            <div style={{padding: 6, marginLeft: 24, color: "var(--text-secondary)", fontSize: 18}}>Bills History</div>
            {grouped.map((group) => {
                const isOpen = openGroups[group.title] ?? true;
                return (
                    <Card key={group.title}>
                        <HistoryHeader open={isOpen} onClick={() => setOpenGroups((prev) => ({
                            ...prev,
                            [group.title]: !isOpen,
                        }))}>
                            <span>{group.title}</span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                                      strokeLinejoin="round"/>
                            </svg>
                        </HistoryHeader>
                        {isOpen && (
                            group.items.map((item, itemIdx) => {
                                const isLastInGroup = itemIdx === group.items.length - 1;
                                return (
                                    <NavLink style={{textDecoration: "none"}} to={`/history/${item.id}`} key={item.id}>
                                        <CardRow>
                                            <HistoryItemInfo>
                                                <CardRowName>
                                                    {formatTime(item.created_at)}
                                                </CardRowName>
                                                <CardRowValue style={{
                                                    fontWeight: 400,
                                                    fontSize: 18
                                                }}>{formatAddress(item.destination_address)}</CardRowValue>
                                            </HistoryItemInfo>
                                            <CardRowValue style={{fontWeight: 400, fontSize: 18}}>{formatTon(item.amount)} TON</CardRowValue>
                                        </CardRow>
                                        {!isLastInGroup && (<CardRowDivider/>)}
                                    </NavLink>
                                );
                            })
                        )}
                    </Card>
                );
            })}
        </Screen>
    );
}
