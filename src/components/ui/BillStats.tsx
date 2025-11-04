import React from "react";
import styled from "styled-components";
import { formatTon } from "../../utils/ton";

const Card = styled.div` border: 1px solid #3a3a3a; border-radius: 16px; overflow: hidden; `;
const Row = styled.div`
  display: flex; align-items: center; justify-content: space-between; padding: 12px 14px;
  &:not(:last-child){ border-bottom:1px solid #2c2c2c }
`;
const Name = styled.span` opacity: .8; `;
const Value = styled.span` font-weight: 700; max-width: 200px; overflow:hidden; text-overflow:ellipsis; `;

type Props = {
    collected: number;
    goal: number;
    receiver: string;
    left: number;
};

export default function BillStats({ collected, goal, receiver, left }: Props) {
    return (
        <Card>
            <Row><Name>Collected</Name><Value>{formatTon(collected)} TON</Value></Row>
            <Row><Name>Goal</Name><Value>{formatTon(goal)} TON</Value></Row>
            <Row><Name>Receiver</Name><Value>{receiver}</Value></Row>
            <Row><Name>Left</Name><Value>{formatTon(left)} TON</Value></Row>
        </Card>
    );
}
