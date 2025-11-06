import WebApp from "@twa-dev/sdk";

export function scanQR(onResult: (text: string) => void, placeholder = "Scan QR") {
    try {
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
    catch (e) {
        console.error(e);
    }
}