import WebApp from "@twa-dev/sdk";

export function scanQR(onResult: (text: string) => void, placeholder = "Scan QR") {
    if (typeof WebApp.showScanQrPopup === "function") {
        WebApp.showScanQrPopup({ text: placeholder }, (data) => {
            if (data) {
                onResult(data);
                WebApp.closeScanQrPopup();
            }
        });
        return true;
    }
    return false;
}