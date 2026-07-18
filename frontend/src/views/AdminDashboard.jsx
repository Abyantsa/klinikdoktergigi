import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import QueueCard from "../components/QueueCard";
import HistoryTable from "../components/HistoryTable";
import { usePolling } from "../services/usePolling";
import {
  queueService,
  scheduleService,
} from "../services/api";

function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("docreserve_token"));
  const [date, setDate] = useState(todayStr());
  const [msg, setMsg] = useState(null);
  const [report, setReport] = useState(null);
  const [slots, setSlots] = useState([]);

  useEffect(() => {
    if (!token) navigate("/admin/login");
  }, [token, navigate]);

  const { data: queue, loading } = usePolling(
    () => queueService.list(date),
    10000,
    [date, token]
  );

  useEffect(() => {
    scheduleService.list(date).then(setSlots).catch(() => {});
  }, [date, token]);

  const refreshSlots = async () => {
    const res = await scheduleService.list(date);
    setSlots(res);
  };

  const action = async (fn, label) => {
    try {
      await fn();
      setMsg(label);
      setTimeout(() => setMsg(null), 2500);
    } catch (err) {
      setMsg(err.response?.data?.error || "Gagal");
    }
  };

  const loadReport = async (range) => {
    try {
      const res = await queueService.report(range);
      setReport(res);
    } catch (err) {
      setMsg(err.response?.data?.error || "Gagal memuat laporan");
    }
  };

  const toggleSlot = async (slot) => {
    try {
      await scheduleService.setOpen(slot.id, !slot.isOpen);
      await refreshSlots();
    } catch (err) {
      setMsg(err.response?.data?.error || "Gagal ubah slot");
    }
  };

  if (!token) return null;

  const examining = queue?.EXAMINING || [];
  const waiting = queue?.WAITING || [];
  const skipped = queue?.SKIPPED || [];
  const completed = queue?.COMPLETED || [];

  return (
    <div className="admin">
      <div className="admin-header">
        <h1>Dashboard Admin</h1>
        <button
          className="btn ghost"
          onClick={() => {
            localStorage.removeItem("docreserve_token");
            setToken(null);
            navigate("/admin/login");
          }}
        >
          Logout
        </button>
      </div>

      <label className="date-picker">
        Tanggal:{" "}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {msg && <p className="info">{msg}</p>}

      <section className="admin-section">
        <h2>Kontrol Antrean</h2>
        <button
          className="btn primary"
          disabled={examining.length > 0}
          onClick={() =>
            action(() => queueService.callNext(date), "Memanggil berikutnya")
          }
        >
          Panggil Berikutnya
        </button>

        <h3>Sedang Diperiksa</h3>
        {examining.length === 0 && <p className="muted">Tidak ada.</p>}
        {examining.map((p) => (
          <QueueCard
            key={p.id}
            patient={p}
            actions={
              <>
                <button
                  className="btn small"
                  onClick={() =>
                    action(() => queueService.complete(p.id), "Selesai")
                  }
                >
                  Selesai
                </button>
                <button
                  className="btn small danger"
                  onClick={() =>
                    action(() => queueService.skip(p.id), "Lewati")
                  }
                >
                  Lewati
                </button>
              </>
            }
          />
        ))}

        <h3>Menunggu ({waiting.length})</h3>
        {waiting.length === 0 && <p className="muted">Tidak ada.</p>}
        {waiting.map((p) => (
          <QueueCard key={p.id} patient={p} />
        ))}

        <h3>Terlewat ({skipped.length})</h3>
        {skipped.length === 0 && <p className="muted">Tidak ada.</p>}
        {skipped.map((p) => (
          <QueueCard
            key={p.id}
            patient={p}
            actions={
              <button
                className="btn small"
                onClick={() =>
                  action(() => queueService.recall(p.id), "Panggil ulang")
                }
              >
                Panggil Kembali
              </button>
            }
          />
        ))}

        <h3>Selesai ({completed.length})</h3>
        {completed.slice(0, 10).map((p) => (
          <QueueCard key={p.id} patient={p} />
        ))}
      </section>

      <section className="admin-section">
        <h2>Manajemen Slot Jadwal</h2>
        <table className="history-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Sesi</th>
              <th>Kuota</th>
              <th>Sisa</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {slots.map((s) => (
              <tr key={s.id}>
                <td>{s.date?.slice(0, 10)}</td>
                <td>{s.session === "MORNING" ? "Pagi" : "Sore"}</td>
                <td>{s.quota}</td>
                <td>{s.remaining}</td>
                <td>{s.isOpen ? "Buka" : "Tutup"}</td>
                <td>
                  <button className="btn small" onClick={() => toggleSlot(s)}>
                    {s.isOpen ? "Tutup" : "Buka"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="admin-section">
        <h2>Laporan</h2>
        <div className="report-actions">
          <button className="btn" onClick={() => loadReport("week")}>
            Mingguan
          </button>
          <button className="btn" onClick={() => loadReport("month")}>
            Bulanan
          </button>
        </div>
        {report && (
          <>
            <p>Total: {report.total} pasien</p>
            <HistoryTable rows={report.series} />
          </>
        )}
      </section>
    </div>
  );
}
