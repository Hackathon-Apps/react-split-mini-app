import React, { useCallback, useState } from "react";
import styled from "styled-components";
import QRCode from "react-qr-code";
import WebApp from "@twa-dev/sdk";
import {Button, CopiedBadge} from "./styled/styled";
import BottomSheet from "./ui/BottomSheet";

const QrButton = styled.button`
  display: block;
  margin: 0 auto 12px;
  padding: 12px;
  border-radius: 16px;
  border: 1px solid var(--bg);
  background: var(--surface-1);
  cursor: copy;
  position: relative;
  outline: none;
  user-select: none;
  &:active { transform: scale(0.995); }
  & > svg { display: block; width: 240px; height: auto; }
`;

const SendBtn = styled(Button)`
  width: 100%;
  border-radius: 14px;
  padding: 14px 20px;
  font-size: 16px;
  background-color: var(--accent) !important;
  color: var(--accent-contrast) !important;
  font-family: var(--fontSF),serif !important;
  font-weight: 600 !important;
`;

export default function ShareSheet({
                                       open, url, onClose, shareText,
                                   }: { open: boolean; url: string; onClose: () => void; shareText?: string }) {
    const [copied, setCopied] = useState(false);

    const copyLink = useCallback(async () => {
        await navigator.clipboard.writeText(url);
        WebApp.HapticFeedback?.notificationOccurred?.("success");
        setCopied(true); setTimeout(() => setCopied(false), 1200);
    }, [url]);

    const onSend = () => {
        const text = shareText ?? "Join the split bill";
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
        try { WebApp.openTelegramLink(shareUrl); } catch { window.open(shareUrl, "_blank"); }
    };

    return (
        <BottomSheet open={open} onClose={onClose} ariaTitle="Share QR">
            <QrButton onClick={copyLink} aria-label="Copy link">
                <QRCode value={url} size={240} />
                <CopiedBadge show={copied}>Link copied</CopiedBadge>
            </QrButton>
            <SendBtn onClick={onSend}>Send link</SendBtn>
        </BottomSheet>
    );
}
