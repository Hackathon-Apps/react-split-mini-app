import styled from "styled-components";

const Bar = styled.nav<{ hidden?: boolean }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: transparent;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
  z-index: 1000;
  transition: transform 0.2s ease, opacity 0.2s ease;
  transform: ${(p) => (p.hidden ? "translateY(120%)" : "translateY(0)")};
  opacity: ${(p) => (p.hidden ? 0 : 1)};
  pointer-events: ${(p) => (p.hidden ? "none" : "auto")};
`;

const Dock = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 0 auto;
  width: fit-content;
  max-width: 92%;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 22px;
  padding: 4px;
  backdrop-filter: saturate(170%) blur(8px);
`;

const Item = styled.button<{active?: boolean}>`
  appearance: none;
  background: ${(p) => (p.active ? "rgba(255,255,255,0.08)" : "transparent")};
  border: ${(p) => (p.active ? "2px solid #2990FF" : "2px solid transparent")};
  box-shadow: ${(p) => (p.active ? "0 0 0 2px rgba(46,173,220,0.25) inset" : "none")};
  color: ${(p) => (p.active ? "#2990FF" : "#cfcfcf")};
  opacity: ${(p) => (p.active ? 1 : 0.8)};
  border-radius: 22px;
  display: flex;
  width: 94px;
  height: 52px;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  line-height: 1;
` as any;

const Label = styled.span`
  font-size: 11px;
  line-height: 1;
`;

const IconImg = styled.img`
  width: 22px;
  height: 22px;
`;

export type TabKey = "new" | "join" | "history";

export default function BottomTabBar({
  active,
  onChange,
  hidden,
}: {
  active: TabKey;
  onChange: (key: TabKey) => void;
  hidden?: boolean;
}) {
  return (
    <Bar hidden={hidden} aria-hidden={hidden ? true : undefined}>
      <Dock>
        <Item active={active === "new"} onClick={() => onChange("new")}>
          <IconImg src={active === "new" ? "/bill-active.svg" : "/bill.svg"} alt="New" />
          <Label>New</Label>
        </Item>
        <Item active={active === "join"} onClick={() => onChange("join")}>
          <IconImg src={active === "join" ? "/qr-active.svg" : "/qr.svg"} alt="Join" />
          <Label>Join</Label>
        </Item>
        <Item active={active === "history"} onClick={() => onChange("history")}>
          <IconImg src={active === "history" ? "/clock-active.svg" : "/clock.svg"} alt="History" />
          <Label>History</Label>
        </Item>
      </Dock>
    </Bar>
  );
}
