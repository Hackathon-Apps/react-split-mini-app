import styled from "styled-components";

const Wrap = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

export default function HistoryScreen() {
  return (
    <Wrap>
      <h2 style={{ textAlign: "center" }}>History</h2>
      <p style={{ opacity: 0.8 }}>
        Your recent bills will appear here. (UI placeholder)
      </p>
    </Wrap>
  );
}

