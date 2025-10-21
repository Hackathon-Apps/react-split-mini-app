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
  const [tab, setTab] = useState<TabKey>(() =>
    (window.location.hash.replace("#", "") as TabKey) || "new"
  );

  // keep URL hash in sync so it persists after reload
  useEffect(() => {
    window.location.hash = tab;
  }, [tab]);

  const Screen = useMemo(() => {
    switch (tab) {
      case "join":
        return <JoinScreen />;
      case "history":
        return <HistoryScreen />;
      default:
        return <SplitBill />;
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
      <BottomTabBar active={tab} onChange={setTab} />
    </StyledApp>
  );
}

export default App;
