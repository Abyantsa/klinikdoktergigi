import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingService, queueService } from "../services/api";
import { sessionLabel, statusLabel } from "../components/QueueCard";
import { usePolling } from "../services/usePolling";

function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function QueueTicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  const { data: status } = usePolling(
    () => queueService.status(id, todayStr()),
    10000,
    [id]
  );

  useState(() => {
    bookingService
      .getTicket(id)
      .then(setTicket)
      .catch(() => setError("Tiket tidak ditemukan"));
  });

  if (error) return <p className="error">{error}</p>;
  if (!ticket) return <p>Memuat tiket...</p>;

  return (
    <div className="ticket">
      <div className="ticket-card">
        <h2>Tiket Antrean</h2>
        <div className="ticket-code">{ticket.reservationCode}</div>
        <div className="ticket-number">No. Urut #{ticket.queueNumber}</div>
        <p>
          <strong>{ticket.patientName}</strong>
        </p>
        <p className="muted">{sessionLabel(ticket.session)}</p>
        <p className="muted">Status: {statusLabel(ticket.status)}</p>

        {status && (
          <div className="ticket-live">
            <p>
              Sedang diperiksa: <strong>#{status.currentlyServing ?? "—"}</strong>
            </p>
            {ticket.status === "WAITING" && status.yourPosition && (
              <p className="highlight">
                Kamu antrean ke-{status.yourPosition} dari {status.waitingCount}
              </p>
            )}
            {ticket.status === "EXAMINING" && (
              <p className="highlight">Sekarang giliranmu!</p>
            )}
          </div>
        )}

        <div className="ticket-actions">
          <Link to={`/status?ref=${ticket.id}`} className="btn">
            Cek Posisi Live
          </Link>
          <Link to="/" className="btn">
            Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
