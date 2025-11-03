import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import styled from "styled-components";
import "@twa-dev/sdk";
import BottomTabBar, { TabKey } from "./components/BottomTabBar";
import {useEffect, useMemo, useRef, useState} from "react";
import HistoryScreen from "./components/HistoryScreen";
import {scanQR} from "./utils/scanQR";
import WebApp from "@twa-dev/sdk";
import {OpenBill, useBillStore} from "./state/billStore";
import BillsScreen from "./components/BillsScreen";
import {UIStateProvider} from "./state/uiState";
import {readStartPayload} from "./utils/deeplink";

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
    const handledRef = useRef(false); // защита от повторов (HMR/ремонтовка)
    const {setBill} = useBillStore();
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


    useEffect(() => {
        if (handledRef.current) return;
        handledRef.current = true;

        // Telegram WebApp готов к работе
        WebApp.ready();

        // 1) читаем параметр из initDataUnsafe / ?tgWebAppStartParam=
        const payload = readStartPayload<OpenBill>();
        if (!payload) return;

        console.log(payload);
        setBill(payload);

        const url = new URL(location.href);
        url.searchParams.delete("tgWebAppStartParam");
        history.replaceState({}, "", url);
    }, []);

  return (
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
  );
}

export default App;
