import { useCallback, useEffect } from "react";
import styled from "styled-components";
import WebApp from "@twa-dev/sdk";
import { useNavigate } from "react-router-dom";
import { ONBOARDING_SEEN_KEY } from "../constants";

const Wrapper = styled.div`
  min-height: calc(var(--tg-viewport-stable-height, 100svh));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 28px 16px 40px;
  background: var(--bg);
`;

const Card = styled.div`
  width: min(520px, 100%);
  background: var(--bg);
  border-radius: 22px;
  padding: 18px 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  text-align: center;
`;

const PreviewShell = styled.div<{ $src: string }>`
  position: relative;
  width: min(360px, 92%);
  border-radius: 20px;
  overflow: hidden;
  background: #0f1012;
  box-shadow: 0 20px 46px rgba(0, 0, 0, 0.45);
  isolation: isolate;
  margin-bottom: 25px;
`;

const Preview = styled.img`
  display: block;
  width: 100%;
  border-radius: 20px;
`;

const Title = styled.h1`
  margin: 4px 0 30px;
  font-size: 20px;
  color: var(--text);
`;

const Steps = styled.ol`
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  width: 100%;
  display: grid;
  gap: 15px;
`;

const Step = styled.li`
  display: grid;
  grid-template-columns: 26px 1fr;
  gap: 15px;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
`;

const StepIcon = styled.img`
  width: 28px;
  height: 28px;
  display: block;
`;

const StartButton = styled.button`
  width: 60%;
  margin-top: 30px;
  border: 0;
  border-radius: 20px;
  padding: 14px 12px;
  font-size: 16px;
  font-weight: 700;
  font-family: var(--fontSF), serif;
  background: #2990ff;
  color: #ffffff;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(41, 144, 255, 0.35);
`;

export default function WelcomeScreen() {
  const navigate = useNavigate();

  const handleStart = useCallback(() => {
    localStorage.setItem(ONBOARDING_SEEN_KEY, "1");
    WebApp.HapticFeedback?.impactOccurred("light");
    navigate("/bills", { replace: true });
  }, [navigate]);

  useEffect(() => {
    WebApp.expand();
  }, []);

  return (
    <Wrapper>
      <Card>
        <PreviewShell $src="/preview-blur.png">
          <Preview src="/preview-blur.png" alt="Split bill preview" loading="lazy" />
        </PreviewShell>
        <div>
          <Title>Welcome to Bill Splitter!</Title>
        </div>
        <Steps>
          <Step>
            <StepIcon src="/bill.svg" alt="Bill icon" />
            Create a bill by setting up the goal and reciever TON address
          </Step>
          <Step>
            <StepIcon src="/qr.svg" alt="QR icon" />
            Join by QR or link from friends
          </Step>
          <Step>
            <StepIcon src="/clock.svg" alt="Clock icon" />
            Track bills history
          </Step>
        </Steps>
        <StartButton onClick={handleStart}>Start splitting!</StartButton>
      </Card>
    </Wrapper>
  );
}
