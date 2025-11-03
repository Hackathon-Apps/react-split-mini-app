import React from "react";
import CreateBill from "./CreateBill";
import ProcessBill from "./ProcessBill";
import {useBillStore, OpenBill} from "../state/billStore";

export default function BillsScreen() {
    const {bill, setBill, clearBill} = useBillStore();

    // колбэк, который должен вызвать CreateBill после создания сбора
    const handleCreated = (payload: OpenBill) => {
        setBill(payload);
    };

    // когда сбор завершён/закрыт — очищаем стор
    const handleClose = () => {
        clearBill();
    };

    if (!bill) {
        return (
            <CreateBill
                // важно: CreateBill должен уметь отдать эти данные
                onCreated={handleCreated}
            />
        );
    }

    return (
        <ProcessBill
            bill={bill}
            onClose={handleClose}
        />
    );
}
