import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { scanQR } from "../utils/scanQR";
import {InfoScreen} from "./styled/styled";

export default function JoinScreen() {
    useEffect(() => {
        scanQR((link) => {
            WebApp.openTelegramLink(link);
        }, "Scan QR to join");
    }, []);
    return <InfoScreen>Scan a QR to join a bill…</InfoScreen>;
}
