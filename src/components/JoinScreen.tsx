import styled from "styled-components";

const Wrap = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

export default function JoinScreen() {
  return (
    <Wrap>
      <h2 style={{ textAlign: "center" }}>Join</h2>
      <p style={{ opacity: 0.8 }}>
        Scan a bill QR or paste a link to join. (UI placeholder)
      </p>
    </Wrap>
  );
}

