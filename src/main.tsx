import {QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {queryClient} from "./config/queryClient";
import {HashRouter} from "react-router-dom";

const manifestUrl = `https://tagwaiter.ru/tonconnect-manifest-new.json`;
const appUrl = "https://t.me/CryptoSplitBot?startapp"

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
