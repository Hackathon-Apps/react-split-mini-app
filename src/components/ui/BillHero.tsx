import React from "react";
import styled, { css } from "styled-components";

const Stage = styled.div`
  position: relative; width: 100%; min-height: 220px;
  display: flex; align-items: center; justify-content: center; overflow: hidden;
`;
const stackCenter = css`
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
`;
const TimerBox = styled.div<{ hidden?: boolean }>`
  display: inline-flex; align-items: center; justify-content: center;
  padding: 6px 10px; border-radius: 12px; background: transparent;
  ${stackCenter};
  transition: opacity 400ms ease, transform 400ms ease;
  opacity: ${({hidden}) => (hidden ? 0 : 1)};
  transform: ${({hidden}) => (hidden ? "translate(-50%, -50%) scale(0.98)" : "translate(-50%, -50%)")};
`;
const TimeLeft = styled.div`
  font-family: var(--fontSF), serif; font-weight: 450; font-size: 45px; letter-spacing: 0.3px;
`;
const RingBox = styled.div<{ pop?: boolean }>`
  ${stackCenter}; transition: transform 400ms ease;
  transform: ${({pop}) => (pop ? "translate(-50%, -50%) scale(1.04)" : "translate(-50%, -50%)")};
`;

function ProgressRing({value, color = "#2990ff"}: { value: number; color?: string }) {
    const radius = 44, stroke = 6, C = 2 * Math.PI * radius;
    const v = Math.max(0, Math.min(100, value));
    const offset = C - (v / 100) * C;
    return (
        <svg width={200} height={200} viewBox="0 0 110 110">
            <circle cx="55" cy="55" r={radius} stroke="#4c4c4c" strokeWidth={stroke} fill="none"/>
            <circle cx="55" cy="55" r={radius} stroke={color} strokeWidth={stroke} strokeLinecap="round"
                    fill="none" strokeDasharray={C} strokeDashoffset={offset} transform="rotate(-90 55 55)" />
            <text x="55" y="55" textAnchor="middle" fontWeight={400} fontSize="20" fill="currentColor">{Math.round(v)}%</text>
            <text x="55" y="70" textAnchor="middle" fontWeight={400} fontSize="10" fill="#4c4c4c">collected</text>
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
    engaged: boolean; // собрали цель или таймер истёк
};

export default function BillHero({ percent, leftSec, engaged }: Props) {
    return (
        <Stage>
            <RingBox pop={engaged} style={{
                transform: engaged
                    ? "translate(-50%, -50%) scale(1.04)"
                    : "translate(calc(-50% - 75px), -50%) scale(1.0)",
                transition: "transform 420ms ease"
            }}>
                <div style={{position: "relative", width: 200, height: 200}}>
                    <div style={{ position: "absolute", inset: 0, opacity: engaged ? 0 : 1, transition: "opacity 300ms ease" }}>
                        <ProgressRing value={percent} color="#2990ff"/>
                    </div>
                    <div style={{ position: "absolute", inset: 0, opacity: engaged ? 1 : 0, transition: "opacity 300ms ease" }}>
                        <ProgressRing value={percent} color="#27ae60"/>
                    </div>
                </div>
            </RingBox>

            <TimerBox hidden={engaged} aria-live="polite" style={{
                transform: engaged
                    ? "translate(-50%, -50%) scale(0.98)"
                    : "translate(calc(-50% + 75px), -50%)",
                transition: "opacity 320ms ease, transform 420ms ease"
            }}>
                <TimeLeft>{formatMMSS(leftSec)}</TimeLeft>
            </TimerBox>
        </Stage>
    );
}
