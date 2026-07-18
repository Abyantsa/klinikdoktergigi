export default function HistoryTable({ rows }) {
  if (!rows.length) {
    return <p className="muted">Belum ada riwayat.</p>;
  }
  return (
    <table className="history-table">
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Jumlah Pasien</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.date}>
            <td>{r.date}</td>
            <td>{r.count}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
