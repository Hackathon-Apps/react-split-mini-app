import { useCallback, useEffect } from "react";
import styled from "styled-components";
import WebApp from "@twa-dev/sdk";
import { useNavigate } from "react-router-dom";
import {WELCOME_SESSION_KEY} from "../constants";

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

const Preview = styled.img`
  display: block;
  width: 100%;
  border-radius: 20px;
  box-shadow: 0 10px 15px rgba(0, 0, 0, 0.45);
`;

const Title = styled.h1`
  margin: 25px 0 5px;
  font-size: 20px;
  color: var(--text);
`;

const Steps = styled.ol`
  list-style: none;
  padding: 0;
  margin: 6px 0 0;
  width: 100%;
  display: grid;
  gap: 20px;
`;

const Step = styled.li`
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 15px;
  align-items: center;
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.4;
  text-align: left;
`;

const StepIcon = styled.img`
  width: 24px;
  height: 24px;
  display: block;
`;

const StartButton = styled.button`
  width: 60%;
  margin-top: 25px;
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
    WebApp.HapticFeedback?.impactOccurred("light");
    sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
    navigate("/bills", { replace: true });
  }, [navigate]);

  useEffect(() => {
    WebApp.expand();
  }, []);

  return (
    <Wrapper>
      <Card>
        <Preview src="/preview-blur.png" alt="Split bill preview" loading="lazy" />
        <div>
          <Title>Welcome to Bill Splitter!</Title>
        </div>
        <Steps>
          <Step>
            <StepIcon src="/bill.svg" alt="Bill icon" />
            Create a bill with Goal and Reciever's TON address
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
        <StartButton onClick={handleStart}>Start splitting</StartButton>
      </Card>
    </Wrapper>
  );
}
