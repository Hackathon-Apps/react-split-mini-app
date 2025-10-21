import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import styled from "styled-components";
import "@twa-dev/sdk";
import SplitBill from "./components/SplitBill";
import BottomTabBar, { TabKey } from "./components/BottomTabBar";
import { useEffect, useMemo, useState } from "react";
import JoinScreen from "./components/JoinScreen";
import HistoryScreen from "./components/HistoryScreen";

const StyledApp = styled.div`
  background-color: #e8e8e8;
  color: black;

  @media (prefers-color-scheme: dark) {
    background-color: #222;
    color: white;
  }
  min-height: 100svh;
  /* keep space for bottom tab bar only */
  padding: 16px 16px calc(88px + env(safe-area-inset-bottom));
`;

const AppContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  /* tighten spacing so Connect button remains visible without scroll */
  margin: 12px 0 24px;
`;

function App() {
  const [tab, setTab] = useState<TabKey>(() => {
    const raw = window.location.hash.replace("#", "");
    const candidate = (raw || "new") as TabKey;
    const valid: TabKey[] = ["new", "join", "history"];
    return valid.includes(candidate) ? candidate : "new";
  });
  const [isEditing, setIsEditing] = useState(false);

  // keep URL hash in sync so it persists after reload
  useEffect(() => {
    window.location.hash = tab;
  }, [tab]);

  // Detect when any input/textarea gains focus to hide UI elements
  useEffect(() => {
    const onFocusIn = (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const tag = t.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || t.getAttribute("contenteditable") === "true") {
        setIsEditing(true);
      }
    };
    const onFocusOut = () => {
      // small delay to avoid flicker when switching fields
      setTimeout(() => {
        const ae = document.activeElement as HTMLElement | null;
        if (!ae) return setIsEditing(false);
        const tag = ae.tagName;
        if (tag !== "INPUT" && tag !== "TEXTAREA" && ae.getAttribute("contenteditable") !== "true") {
          setIsEditing(false);
        }
      }, 50);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const Screen = useMemo(() => {
    switch (tab) {
      case "join":
        return <JoinScreen />;
      case "history":
        return <HistoryScreen />;
      default:
        return <SplitBill hideCta={isEditing} />;
    }
  }, [tab]);

  return (
    <StyledApp>
      <AppContainer>
        <HeaderRow>
          <TonConnectButton />
        </HeaderRow>
        {Screen}
      </AppContainer>
      <BottomTabBar active={tab} onChange={setTab} hidden={isEditing} />
    </StyledApp>
  );
}

export default App;
