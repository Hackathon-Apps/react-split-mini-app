import {Card, CardRow, CardRowDivider, CardRowName, CardRowValue, HistoryItemInfo, InfoScreen} from "./styled/styled";
import {useHistoryQuery} from "../api/queries";
import {useTonAddress} from "@tonconnect/ui-react";
import React from "react";
import LoadingOverlay from "./ui/Loading";
import {formatAddress, formatTon} from "../utils/ton";
import {NavLink} from "react-router-dom";

export default function HistoryScreen() {
    const sender = useTonAddress();
    const {data: history, isLoading, isError} = useHistoryQuery(sender)

    if (isLoading) return <LoadingOverlay/>
    if (!sender) return <InfoScreen>Connect wallet to get bills history</InfoScreen>
    if (isError) return <InfoScreen>No transactions</InfoScreen>
    return (
        <>
            <div style={{padding: 6, marginLeft: 24, color: "var(--text-secondary)", fontSize: 18}}>History</div>
            <Card>
                {history?.map((item) => (<NavLink style={{textDecoration: "none"}} to={`/history/${item.id}`} key={item.id}>
                        <CardRow>
                            <HistoryItemInfo>
                                <CardRowName>
                                    {new Date(item.created_at).toLocaleString()}
                                </CardRowName>
                                <CardRowValue style={{
                                    fontWeight: 400,
                                    fontSize: 18
                                }}>{formatAddress(item.destination_address)}</CardRowValue>
                            </HistoryItemInfo>
                            <CardRowValue style={{fontWeight: 400, fontSize: 18}}>{formatTon(item.amount)} TON</CardRowValue>
                        </CardRow>
                        {item.id != history[history.length - 1].id && (<CardRowDivider/>)}
                    </NavLink>
                ))}
            </Card>
        </>
    )
        ;
}

