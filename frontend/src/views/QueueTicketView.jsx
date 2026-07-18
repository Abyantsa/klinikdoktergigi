import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { bookingService } from "../services/api";
import { sessionLabel, statusLabel } from "../components/QueueCard";

export default function QueueTicketView() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    bookingService
      .getTicket(id)
      .then(setTicket)
      .catch(() => setError("Tiket tidak ditemukan"));
  }, [id]);

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
        <p className="muted">
          Status: {statusLabel(ticket.status)}
        </p>
        <Link to="/" className="btn">
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
