import React from "react";
import { formatTon } from "../../utils/ton";
import {Card, CardRow, CardRowDivider, CardRowName, CardRowValue} from "../styled/styled";

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
            <CardRow><CardRowName>Receiver</CardRowName><CardRowValue>{receiver}</CardRowValue></CardRow>
        </Card>
    </>
    );
}
