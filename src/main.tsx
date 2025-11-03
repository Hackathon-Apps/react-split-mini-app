import {QueryClientProvider } from "@tanstack/react-query";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import {queryClient} from "./config/queryClient";
import {BillProvider} from "./state/billStore";

const manifestUrl = `https://tagwaiter.ru/tonconnect-manifest.json`;
const appUrl = "https://t.me/CryptoSplitBot?startapp"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <TonConnectUIProvider 
    manifestUrl={manifestUrl}
    actionsConfiguration={{ twaReturnUrl: appUrl, returnStrategy: 'back' }}>
    <QueryClientProvider client={queryClient}>
        <BillProvider>
            <App />
        </BillProvider>
    </QueryClientProvider>
  </TonConnectUIProvider>
);
