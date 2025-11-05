import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import styled from "styled-components";
import "@twa-dev/sdk";
import BottomTabBar, { TabKey } from "./components/BottomTabBar";
import {useEffect, useMemo, useRef} from "react";
import HistoryScreen from "./components/HistoryScreen";
import WebApp from "@twa-dev/sdk";
import {UIStateProvider} from "./state/uiState";
import {readStartPayload} from "./utils/deeplink";
import {Navigate, Outlet, Route, Routes, useLocation, useNavigate} from "react-router-dom";
import JoinScreen from "./components/JoinScreen";
import CreateBill from "./components/CreateBill";
import ProcessBill from "./components/ProcessBill";
import JoinTimeOutScreen from "./components/JoinTimeOutScreen";

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
  margin: 12px 0 12px;
`;

function RootLayout() {
    const navigate = useNavigate();
    const routerLocation = useLocation();

    const activeTab: TabKey = useMemo(() => {
        if (routerLocation.pathname.startsWith("/history")) return "history";
        if (routerLocation.pathname.startsWith("/join")) return "join";
        return "bills";
    }, [routerLocation.pathname]);

    const handledRef = useRef(false);
    useEffect(() => {
        if (handledRef.current) return;
        handledRef.current = true;

        WebApp.ready();

        // читаем диплинк-пейлоад при старте
        const payload = readStartPayload<{ id: string; created_at: number }>();
        if (payload) {
            const q = payload.created_at ? `?created_at=${payload.created_at}` : "";
            navigate(`/bills/${payload.id}${q}`, { replace: true });
        }

        // чистим ?tgWebAppStartParam, чтобы при F5 не повторялся старт
        const url = new URL(window.location.href);
        url.searchParams.delete("tgWebAppStartParam");
        window.history.replaceState({}, "", url);
    }, [navigate]);

    return (
        <UIStateProvider>
            <StyledApp>
                <AppContainer>
                    <HeaderRow>
                        <TonConnectButton />
                    </HeaderRow>

                    {/* сюда рендерятся экраны */}
                    <Outlet />
                </AppContainer>

                <BottomTabBar
                    active={activeTab}
                    onChange={(tab) => {
                        // навигация вкладок
                        if (tab === "bills") navigate("/bills");
                        if (tab === "join") navigate("/join");
                        if (tab === "history") navigate("/history");
                    }}
                />
            </StyledApp>
        </UIStateProvider>
    );
}

export default function App() {
    return (
        <Routes>
            <Route element={<RootLayout />}>
                <Route index element={<Navigate to="/bills" replace />} />
                <Route path="/bills" element={<CreateBill />} />
                <Route path="/bills/:id" element={<ProcessBill />} />
                <Route path="/join" element={<JoinScreen />} />
                <Route path="/join/timeout" element={<JoinTimeOutScreen />} />
                <Route path="/history" element={<HistoryScreen />} />
                <Route path="*" element={<Navigate to="/bills" replace />} />
            </Route>
        </Routes>
    );
}