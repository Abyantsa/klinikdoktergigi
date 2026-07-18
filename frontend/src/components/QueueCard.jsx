const STATUS_LABEL = {
  WAITING: "Menunggu",
  EXAMINING: "Diperiksa",
  SKIPPED: "Terlewat",
  COMPLETED: "Selesai",
};

const SESSION_LABEL = { MORNING: "Sesi Pagi", AFTERNOON: "Sesi Sore" };

export function statusLabel(status) {
  return STATUS_LABEL[status] || status;
}

export function sessionLabel(session) {
  return SESSION_LABEL[session] || session;
}

export default function QueueCard({ patient, actions }) {
  return (
    <div className={`queue-card status-${patient.status.toLowerCase()}`}>
      <div className="queue-number">#{patient.queueNumber}</div>
      <div className="queue-info">
        <div className="queue-name">{patient.patientName}</div>
        <div className="queue-meta">
          {sessionLabel(patient.session)} &middot; {statusLabel(patient.status)}
        </div>
        {patient.complaint && (
          <div className="queue-complaint">"{patient.complaint}"</div>
        )}
      </div>
      {actions && <div className="queue-actions">{actions}</div>}
    </div>
  );
}
