export default function Calendar({ value, onChange }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const days = [];
  for (let i = 0; i < 14; i++) {
    const d = new Date(today.getTime() + i * 86400000);
    days.push(d);
  }

  const fmt = (d) => d.toISOString().slice(0, 10);

  return (
    <div className="calendar">
      {days.map((d) => {
        const selected = fmt(d) === value;
        const weekday = d.toLocaleDateString("id-ID", { weekday: "short" });
        const dayNum = d.getDate();
        const month = d.toLocaleDateString("id-ID", { month: "short" });
        return (
          <button
            key={fmt(d)}
            className={`calendar-day ${selected ? "selected" : ""}`}
            onClick={() => onChange(fmt(d))}
            type="button"
          >
            <span className="cal-weekday">{weekday}</span>
            <span className="cal-day">{dayNum}</span>
            <span className="cal-month">{month}</span>
          </button>
        );
      })}
    </div>
  );
}
