import { Link } from "react-router-dom";
import { usePolling } from "../services/usePolling";
import { clinicService } from "../services/api";

export default function HomeView() {
  const { data } = usePolling(() => clinicService.getInfo(), 10000);

  const clinic = data?.clinic;
  const serving = data?.currentlyServing;

  return (
    <div className="home">
      <section className="hero">
        <h1>Selamat Datang di DocReserve</h1>
        <p>Reservasi online klinik dokter tunggal. Antre tanpa mengantre.</p>
        <div className="hero-actions">
          <Link to="/booking" className="btn primary">
            Daftar Antrean
          </Link>
        </div>
      </section>

      {clinic && (
        <section className="clinic-card">
          <h2>{clinic.doctorName}</h2>
          <p className="muted">{clinic.doctorShortBio}</p>
          <p>
            <strong>Alamat:</strong> {clinic.address}
          </p>
          <p>
            <strong>Jam Operasional:</strong> {clinic.regularHours}
          </p>
        </section>
      )}

      <section className="serving-card">
        <h3>Nomor Antrean Sedang Diperiksa</h3>
        <div className="serving-number">
          {serving ? `#${serving}` : "—"}
        </div>
        <p className="muted">
          Diperbarui otomatis setiap 10 detik.
        </p>
      </section>
    </div>
  );
}
