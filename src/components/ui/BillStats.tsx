import React from "react";
import {formatAddress, formatTon} from "../../utils/ton";
import {Card, CardRow, CardRowDivider, CardRowName, CardRowValue, TrailingIconButton} from "../styled/styled";
import WebApp from "@twa-dev/sdk";

type Props = {
    collected: number;
    goal: number;
    receiver: string;
    left: number;
};

export default function BillStats({ collected, goal, receiver, left }: Props) {
    return (<>
        <Card>
            <CardRow><CardRowName>Collected</CardRowName><CardRowValue>{formatTon(collected)} TON</CardRowValue></CardRow>
            <CardRow><CardRowName>Goal</CardRowName><CardRowValue>{formatTon(goal)} TON</CardRowValue></CardRow>
            <CardRowDivider/>
            <CardRow><CardRowName>Left</CardRowName><CardRowValue accent={true}>{formatTon(left)} TON</CardRowValue></CardRow>
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
