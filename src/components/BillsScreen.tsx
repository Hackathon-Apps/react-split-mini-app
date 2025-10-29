import React, {useState} from "react";
import CreateBill from "./CreateBill";
import ProcessBill from "./ProcessBill";
import {useBillStore, OpenBill} from "../state/billStore";

export default function BillsScreen() {
    const {bill, setBill, clearBill} = useBillStore();
    const [collectedTon, setCollectedTon] = useState<number>(0);

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
            // у вас уже есть эти пропсы — просто прокидываем из bill
            receiver={bill.receiver}
            goalTon={bill.goalTon}
            endTimeSec={bill.endTimeSec}
            collected={collectedTon}
            // опционально: дайте способ выйти из открытого счёта
            onClose={handleClose}
        />
    );
}
