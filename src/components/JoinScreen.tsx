import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { scanQR } from "../utils/scanQR";

export default function JoinScreen() {
    useEffect(() => {
        scanQR((link) => {
            WebApp.openTelegramLink(link);
        }, "Scan QR to join");
    }, []);
    return <div>Scan a QR to join a bill…</div>;
}
