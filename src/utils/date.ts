const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);
const monthShort = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."];

const formatDay = (date: Date) => {
    const d = date.getDate();
    const m = monthShort[date.getMonth()];
    const y = date.getFullYear();
    return `${d} ${m} ${y}`;
};

export const formatDateTime = (value: string | number | Date) => {
    const date = new Date(value);
    const h = pad2(date.getHours());
    const m = pad2(date.getMinutes());
    return `${formatDay(date)}, ${h}:${m}`;
};

export const formatTime = (value: string | number | Date) => {
    const date = new Date(value);
    const h = pad2(date.getHours());
    const m = pad2(date.getMinutes());
    return `${h}:${m}`;
};

const DAY = 24 * 60 * 60 * 1000;
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export const formatDayTitle = (value: string | number | Date) => {
    const date = new Date(value);
    const today = new Date();
    const ts = dayStart(date);
    const todayTs = dayStart(today);
    if (ts === todayTs) return "Today";
    if (ts === todayTs - DAY) return "Yesterday";
    return formatDay(date);
};
