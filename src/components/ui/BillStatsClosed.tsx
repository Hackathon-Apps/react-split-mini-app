import React from "react";
import {formatTon} from "../../utils/ton";
import {Card, CardRow, CardRowName, CardRowValue} from "../styled/styled";

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
                <CardRow><CardRowName>Started</CardRowName><CardRowValue>{new Date(closed_at ?? (Date.parse(created_at) + 600000)).toLocaleString()}</CardRowValue></CardRow>
            </Card>
            <Card>
                <CardRow><CardRowName>Receiver</CardRowName><CardRowValue>{receiver}</CardRowValue></CardRow>
            </Card>
        </>
    );
}
