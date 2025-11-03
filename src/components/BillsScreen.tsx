import { useNavigate, useParams } from "react-router-dom";
import CreateBill from "./CreateBill";
import ProcessBill from "./ProcessBill";
import { useBillQuery } from "../api/queries";
import {useEffect} from "react";

const LAST_BILL_KEY = "lastBillId";

export default function BillsScreen() {
    const navigate = useNavigate();
    const { id } = useParams<{ id?: string }>();

    // если id нет — можно восстановить из localStorage
    useEffect(() => {
        if (!id) {
            const last = localStorage.getItem(LAST_BILL_KEY);
            if (last) navigate(`/bills/${last}`, {replace: true});
        }
    }, [id, history]);

    // при наличии id — запоминаем его
    useEffect(() => {
        if (id) localStorage.setItem(LAST_BILL_KEY, id);
    }, [id]);

    // нет id → экран создания
    if (!id) {
        const handleCreated = (bill: { id: string }) => {
            // после создания — переходим в /bills/:id
            navigate(`/bills/${bill.id}`, { replace: true });
        };
        return <CreateBill onCreated={handleCreated} />;
    }

    // есть id → тянем данные с бэка через react-query
    const { data: bill, isLoading } = useBillQuery(id);

    if (isLoading) return <div>Loading…</div>;
    if (!bill) return <div>Bill not found</div>;

    const handleClose = () => {
        // закрытие/завершение → возвращаемся на список/создание
        navigate("/bills", { replace: true });
    };

    return (
        <ProcessBill
            bill={bill}
            onClose={handleClose}
        />
    );
}
