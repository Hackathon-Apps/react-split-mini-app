import "./App.css";
import { TonConnectButton } from "@tonconnect/ui-react";
import styled from "styled-components";
import "@twa-dev/sdk";
import SplitBill from "./components/SplitBill";
import BillDetails from "./components/ProcessScreen";
import BottomTabBar, { TabKey } from "./components/BottomTabBar";
import { useEffect, useMemo, useState } from "react";
import HistoryScreen from "./components/HistoryScreen";
import {scanQR} from "./utils/scanQR";
import WebApp from "@twa-dev/sdk";

const StyledApp = styled.div`
  background-color: #e8e8e8;
  color: black;

  @media (prefers-color-scheme: dark) {
    background-color: #222;
    color: white;
  }
  /* Pin app to a stable height so iOS keyboard overlays instead of
     shrinking the visual viewport (Telegram provides this var). */
  height: var(--tg-viewport-stable-height, 100svh);
  min-height: var(--tg-viewport-stable-height, 100svh);
  overflow: hidden;
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
    const candidate = (raw || "bills") as TabKey;
    const valid: TabKey[] = ["bills", "join", "history"];
    return valid.includes(candidate) ? candidate : "bills";
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  useEffect(() => {
    const hasOpenModal = () => {
      // 1) наши модалки
      const mine = document.querySelector('[data-modal="true"][data-open="true"]');
      if (mine) return true;

      // 2) сторонние/библиотечные: роль диалога и явно не скрыт
      const dialogs = document.querySelectorAll('[role="dialog"]');
      for (const d of dialogs as any as HTMLElement[]) {
        const hidden = d.getAttribute("aria-hidden");
        const pe = getComputedStyle(d).pointerEvents;
        if (hidden === "true") continue;
        if (pe === "none") continue;         // закрытые «за экраном»
        // на всякий — проверка, есть ли хоть какая-то площадь в вьюпорте
        const r = d.getBoundingClientRect();
        const visible = r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < window.innerHeight;
        if (visible) return true;
      }
      return false;
    };

    const update = () => setIsModalOpen(hasOpenModal());
    update();

    const mo = new MutationObserver(update);
    mo.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["style", "class", "open", "hidden", "aria-hidden", "data-open"]
    });

    window.addEventListener("resize", update);
    return () => {
      mo.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  const Screen = useMemo(() => {
    switch (tab) {
      case "history":
        return <HistoryScreen />;
      default:
        return <BillDetails
            collectedTon={5}
            endTimeSec={Math.floor(Date.now()/1000) + 5*60}
            goalTon={11}
            receiver={"EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"}
        />;
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
    <StyledApp>
      <AppContainer>
        <HeaderRow>
          <TonConnectButton />
        </HeaderRow>
        {Screen}
      </AppContainer>
      <BottomTabBar active={tab} onChange={setTab} hidden={isEditing || isModalOpen} />
    </StyledApp>
  );
}

export default App;
