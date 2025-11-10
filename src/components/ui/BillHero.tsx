import React from "react";
import styled, { css } from "styled-components";

const Stage = styled.div`
  position: relative; width: 100%; min-height: 220px;
  display: flex; align-items: center; justify-content: center;
`;
const stackCenter = css`
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
`;
const TimerBox = styled.div<{ hidden?: boolean }>`
  display: inline-flex; align-items: center; justify-content: center; flex-direction: column;
  padding: 6px 10px; border-radius: 12px; background: transparent;
  ${stackCenter};
  transition: opacity 400ms ease, transform 400ms ease;
  opacity: ${({hidden}) => (hidden ? 0 : 1)};
  transform: ${({hidden}) => (hidden ? "translate(-50%, -50%) scale(0.98)" : "translate(-50%, -50%)")};
`;
const TimeLeft = styled.div`
  font-family: var(--fontSF), serif; font-weight: 450; font-size: 38px; letter-spacing: 0.3px;
`;
const RingBox = styled.div<{ pop?: boolean }>`
  ${stackCenter}; transition: transform 400ms ease;
  transform: ${({pop}) => (pop ? "translate(-50%, -50%) scale(1.04)" : "translate(-50%, -50%)")};
`;

function ProgressRing({value}: { value: number }) {
    const v = Math.max(0, Math.min(100, value));
    const color = v == 100? "var(--success-color)" : "var(--accent)";
    const radius = 44, stroke = 6, C = 2 * Math.PI * radius;
    const offset = C - (v / 100) * C;
    return (
        <svg width={200} height={200} viewBox="0 0 120 120">
            <circle cx="55" cy="55" r={radius} stroke="var(--ring-color)" strokeWidth={stroke} fill="none"/>
            <circle cx="55" cy="55" r={radius} stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    fill="none" strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 55 55)" />
            <text x="55" y="55" textAnchor="middle" fontWeight={400} fontSize="20" fill="currentColor">{Math.round(v)}%</text>
            <text x="55" y="70" textAnchor="middle" fontWeight={400} fontSize="10" fill="var(--text-secondary)">collected</text>
        </svg>
    );
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const formatMMSS = (sec: number) => {
    const m = Math.floor(sec / 60), s = Math.max(0, Math.floor(sec % 60));
    return `${pad2(m)}:${pad2(s)}`;
};

type Props = {
    percent: number;
    leftSec: number;
    closed: boolean;
};

export default function BillHero({ percent, leftSec, closed }: Props) {
    return (
        <Stage>
            <RingBox pop={closed} style={{
                transform: closed
                    ? "translate(-50%, -50%) scale(1.04)"
                    : "translate(calc(-50% - 75px), -50%) scale(1.0)",
                transition: "transform 420ms ease"
            }}>
                <div style={{position: "relative", width: 200, height: 200}}>
                    <div style={{ position: "absolute", inset: 0, transition: "color 300ms ease" }}>
                        <ProgressRing value={percent}/>
                    </div>
                </div>
            </RingBox>

            <TimerBox hidden={closed} aria-live="polite" style={{
                transform: closed
                    ? "translate(-50%, -50%) scale(0.98)"
                    : "translate(calc(-50% + 75px), -50%)",
                transition: "opacity 320ms ease, transform 420ms ease"
            }}>
                <TimeLeft>{formatMMSS(leftSec)}</TimeLeft>
                <span style={{color: "var(--text-secondary)", paddingBottom: 20}}>time left</span>
            </TimerBox>
        </Stage>
    );
}
