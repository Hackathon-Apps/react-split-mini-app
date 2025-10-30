import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import styled from "styled-components";
import "@twa-dev/sdk";
import BottomTabBar, { TabKey } from "./components/BottomTabBar";
import { useEffect, useMemo, useState } from "react";
import HistoryScreen from "./components/HistoryScreen";
import {scanQR} from "./utils/scanQR";
import WebApp from "@twa-dev/sdk";
import {BillProvider} from "./state/billStore";
import BillsScreen from "./components/BillsScreen";
import {UIStateProvider} from "./state/uiState";

const StyledApp = styled.div`
  background-color: var(--bg);
  color: var(--text);
  min-height: var(--tg-viewport-stable-height, 100svh);
  overflow: visible;
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
    const candidate = (raw || "bills") as TabKey;
    const valid: TabKey[] = ["bills", "join", "history"];
    return valid.includes(candidate) ? candidate : "bills";
  });
  // keep URL hash in sync so it persists after reload
  useEffect(() => {
    window.location.hash = tab;
  }, [tab]);

  const Screen = useMemo(() => {
    switch (tab) {
      case "history":
        return <HistoryScreen />;
      default:
        return <BillsScreen/>;
    }
  }, [tab]);

  useEffect(() => {
    if (tab == "join") {
      scanQR((link) => {
        WebApp.openTelegramLink(link)
      })
    }
  }, [tab]);



  return (
      <BillProvider>
        <UIStateProvider>
          <StyledApp>
            <AppContainer>
              <HeaderRow>
                <TonConnectButton />
              </HeaderRow>
              {Screen}
            </AppContainer>
            <BottomTabBar
                active={tab}
                onChange={setTab}
            />
          </StyledApp>
        </UIStateProvider>
      </BillProvider>
  );
}

export default App;
