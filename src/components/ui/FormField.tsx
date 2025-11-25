import {ReactNode} from "react";
import styled from "styled-components";

const Field = styled.fieldset<{ invalid?: boolean }>`
  padding: 6px 12px 10px;
  border-radius: 20px;
  border: 3px solid ${(p) => (p.invalid ? "#ff4d4f" : "var(--input)")};
  background: transparent;
  box-sizing: border-box;
  height: 66px;
`;

const Legend = styled.legend<{ invalid?: boolean}>`
    color: ${(p) => (p.invalid ? "#ff4d4f" : "var(--input)")};
    padding: 0 6px;
    opacity: 0.9;
    font-weight: 600;
    font-size: 16px;
    font-family: var(--fontRoboto), serif;
    line-height: 1;
    margin-left: 4px;
    margin-bottom: -4px; /* tighten gap to input */
`;

const Row = styled.div`
    display: flex;
    align-items: center;
`;

type FormFieldProps = {
    label: string;
    invalid?: boolean;
    error?: string;
    children: ReactNode;
};

const ErrorText = styled.small`
    color: #ff4d4f;
    padding-left: 24px;
`;

export function FormField({ label, invalid, error, children }: FormFieldProps) {
    return (
        <>
            <Field invalid={invalid}>
                <Legend invalid={invalid}>{label}</Legend>
                <Row>{children}</Row>
            </Field>
            {invalid && !!error && <ErrorText>{error}</ErrorText>}
        </>
    );
}