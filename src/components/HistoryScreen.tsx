import {
    Card,
    CardRow,
    CardRowDivider,
    CardRowName,
    CardRowValue,
    HistoryItemInfo,
    InfoScreen,
    Screen
} from "./styled/styled";
import {useHistoryQuery} from "../api/queries";
import {useTonAddress} from "@tonconnect/ui-react";
import LoadingOverlay from "./ui/Loading";
import {formatAddress, formatTon} from "../utils/ton";
import {NavLink} from "react-router-dom";
import {Pagination} from "./ui/Pagination";
import {useState} from "react";

const PAGE_SIZE = 5;

export default function HistoryScreen() {
    const sender = useTonAddress();
    const [page, setPage] = useState(1);
    const {data: history, isLoading, isError} = useHistoryQuery(sender, PAGE_SIZE, page)


    if (isLoading) return <LoadingOverlay/>
    if (!sender) return <InfoScreen>Connect wallet to get bills history</InfoScreen>
    if (isError) return <InfoScreen>No transactions</InfoScreen>
    return (
        <Screen>
            <div style={{padding: 6, marginLeft: 24, color: "var(--text-secondary)", fontSize: 18}}>History</div>
            <Card>
                {history?.data?.map((item) => (<NavLink style={{textDecoration: "none"}} to={`/history/${item.id}`} key={item.id}>
                        <CardRow>
                            <HistoryItemInfo>
                                <CardRowName>
                                    {new Date(item.created_at).toLocaleString()}
                                </CardRowName>
                                <CardRowValue style={{
                                    fontWeight: 400,
                                    fontSize: 18
                                }}>{formatAddress(item.destination_address)}</CardRowValue>
                            </HistoryItemInfo>
                            <CardRowValue style={{fontWeight: 400, fontSize: 18}}>{formatTon(item.amount)} TON</CardRowValue>
                        </CardRow>
                        {item.id != history.data[history.data.length - 1].id && (<CardRowDivider/>)}
                    </NavLink>
                ))}
            </Card>
            <Pagination page={page} onPageChange={setPage} pageSize={PAGE_SIZE} total={history?.total} siblingCount={0} size={"sm"}/>
        </Screen>
    )
        ;
}

