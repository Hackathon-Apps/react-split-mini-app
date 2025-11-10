import React from "react";
import {formatAddress, formatTon} from "../../utils/ton";
import {Card, CardRow, CardRowName, CardRowValue, TrailingIconButton} from "../styled/styled";
import WebApp from "@twa-dev/sdk";

type Props = {
    collected: number;
    goal: number;
    receiver: string;
    created_at: string;
    closed_at?: string;
};

export default function BillStatsClosed({collected, goal, receiver, created_at, closed_at}: Props) {
    return (<>
            <Card>
                <CardRow><CardRowName>Collected</CardRowName><CardRowValue>{formatTon(collected)} TON</CardRowValue></CardRow>
                <CardRow><CardRowName>Goal</CardRowName><CardRowValue>{formatTon(goal)} TON</CardRowValue></CardRow>
            </Card>
            <Card>
                <CardRow><CardRowName>Started</CardRowName><CardRowValue>{new Date(created_at).toLocaleString()}</CardRowValue></CardRow>
                <CardRow><CardRowName>Ended</CardRowName><CardRowValue>{new Date(closed_at ?? (Date.parse(created_at) + 600000)).toLocaleString()}</CardRowValue></CardRow>
            </Card>
            <Card>
                <CardRow>
                    <CardRowName>Receiver</CardRowName>
                    <CardRowValue>{formatAddress(receiver)}
                        <TrailingIconButton onClick={async () => {
                            await navigator.clipboard.writeText(receiver);
                            WebApp.HapticFeedback?.notificationOccurred("success")
                        }} style={{marginLeft: 10, border: "none"}}>
                            <img src="/copy.svg" alt="Copy"/>
                        </TrailingIconButton>
                    </CardRowValue>
                </CardRow>
            </Card>
        </>
    );
}
