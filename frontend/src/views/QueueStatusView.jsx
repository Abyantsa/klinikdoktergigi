import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePolling } from "../services/usePolling";
import { queueService } from "../services/api";

function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function QueueStatusView() {
  const navigate = useNavigate();
  const [bookingId, setBookingId] = useState("");
  const [submitted, setSubmitted] = useState("");

  const fetchStatus = () =>
    queueService.status(submitted || null, todayStr());

  const { data, loading } = usePolling(fetchStatus, 10000, [submitted]);

  const lookup = (e) => {
    e.preventDefault();
    setSubmitted(bookingId.trim());
  };

  return (
    <div className="status">
      <h1>Cek Antrean</h1>
      <p className="muted">
        Tanpa login. Masukkan kode reservasi untuk melihat posisi antreanmu.
      </p>

      <form className="booking-form" onSubmit={lookup}>
        <label>
          Kode Reservasi
          <input
            type="text"
            placeholder="cth: A1B2C3D4"
            value={bookingId}
            onChange={(e) => setBookingId(e.target.value.toUpperCase())}
          />
        </label>
        <button type="submit" className="btn primary">
          Cek Posisi
        </button>
      </form>

      {loading && <p>Memuat...</p>}
      {data && (
        <div className="status-card">
          <div className="status-row">
            <span>Sedang Diperiksa</span>
            <strong>#{data.currentlyServing ?? "—"}</strong>
          </div>
          <div className="status-row">
            <span>Terakhir Selesai</span>
            <strong>#{data.lastCompleted ?? "—"}</strong>
          </div>
          <div className="status-row">
            <span>Total Menunggu</span>
            <strong>{data.waitingCount}</strong>
          </div>

          {submitted && (
            <>
              <hr />
              {data.yourNumber ? (
                <>
                  <div className="status-row">
                    <span>Nomor Antreanmu</span>
                    <strong>#{data.yourNumber}</strong>
                  </div>
                  <div className="status-row">
                    <span>Status</span>
                    <strong>{labelStatus(data.yourStatus)}</strong>
                  </div>
                  {data.yourStatus === "WAITING" && (
                    <div className="your-position">
                      Kamu antrean ke-{data.yourPosition} dari {data.waitingCount} yang menunggu
                    </div>
                  )}
                  {data.yourStatus === "EXAMINING" && (
                    <div className="your-position">Sekarang giliranmu! Silakan masuk.</div>
                  )}
                  {(data.yourStatus === "COMPLETED" || data.yourStatus === "SKIPPED") && (
                    <div className="your-position muted">
                      Antrean ini sudah {labelStatus(data.yourStatus).toLowerCase()}.
                    </div>
                  )}
                </>
              ) : (
                <p className="error">Kode reservasi tidak ditemukan untuk hari ini.</p>
              )}
            </>
          )}
        </div>
      )}

      <p className="muted" style={{ marginTop: "1rem" }}>
        Diperbarui otomatis setiap 10 detik.
      </p>
      <button className="btn" onClick={() => navigate("/")}>
        Kembali ke Beranda
      </button>
    </div>
  );
}

function labelStatus(s) {
  return (
    { WAITING: "Menunggu", EXAMINING: "Diperiksa", SKIPPED: "Terlewat", COMPLETED: "Selesai" }[
      s
    ] || s
  );
}
