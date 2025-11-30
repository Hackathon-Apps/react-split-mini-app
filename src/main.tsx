import {QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {queryClient} from "./config/queryClient";
import {HashRouter} from "react-router-dom";
import TelegramAnalytics from "@telegram-apps/analytics";

const manifestUrl = `https://tagwaiter.ru/tonconnect-manifest-new-one.json`;
const appUrl = "https://t.me/CryptoSplitBot?startapp"
const tgAnalyticsToken = import.meta.env.VITE_TELEGRAM_ANALYTICS_TOKEN;
const tgAnalyticsAppName = import.meta.env.VITE_TELEGRAM_ANALYTICS_APP_NAME;

if (tgAnalyticsToken && tgAnalyticsAppName) {
  TelegramAnalytics.init({
    token: tgAnalyticsToken,
    appName: tgAnalyticsAppName,
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TonConnectUIProvider 
    manifestUrl={manifestUrl}
    actionsConfiguration={{ twaReturnUrl: appUrl, returnStrategy: 'back' }}>
    <QueryClientProvider client={queryClient}>
            <HashRouter>
                <App />
            </HashRouter>
    </QueryClientProvider>
  </TonConnectUIProvider>
);
