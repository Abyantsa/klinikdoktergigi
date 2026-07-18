import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import { bookingService, scheduleService } from "../services/api";

function todayStr() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

export default function BookingView() {
  const navigate = useNavigate();
  const [date, setDate] = useState(todayStr());
  const [session, setSession] = useState("MORNING");
  const [form, setForm] = useState({ patientName: "", phone: "", complaint: "" });
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadSlots = async (d) => {
    const res = await scheduleService.list(d);
    setSlots(res);
  };

  const onSelectDate = async (d) => {
    setDate(d);
    setSession("MORNING");
    setError(null);
    await loadSlots(d);
  };

  useState(() => {
    loadSlots(date);
  });

  const currentSlot = slots.find((s) => s.session === session);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await bookingService.create({
        ...form,
        date,
        session,
      });
      navigate(`/ticket/${res.booking.id}`);
    } catch (err) {
      setError(err.response?.data?.error || "Gagal mendaftar");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="booking">
      <h1>Daftar Antrean</h1>

      <h3>Pilih Tanggal</h3>
      <Calendar value={date} onChange={onSelectDate} />

      <h3>Pilih Sesi</h3>
      <div className="session-toggle">
        {["MORNING", "AFTERNOON"].map((s) => {
          const slot = slots.find((x) => x.session === s);
          const disabled = !slot || !slot.isOpen || slot.remaining <= 0;
          return (
            <button
              key={s}
              type="button"
              className={`session-btn ${session === s ? "active" : ""}`}
              disabled={disabled}
              onClick={() => setSession(s)}
            >
              {s === "MORNING" ? "Sesi Pagi" : "Sesi Sore"}
              {slot && (
                <span className="quota">
                  {" "}
                  (Sisa {slot.remaining}/{slot.quota})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {currentSlot && currentSlot.remaining <= 0 && (
        <p className="error">Kuota sesi ini sudah penuh.</p>
      )}

      <form className="booking-form" onSubmit={submit}>
        <label>
          Nama Pasien
          <input
            type="text"
            value={form.patientName}
            onChange={(e) => setForm({ ...form, patientName: e.target.value })}
            required
          />
        </label>
        <label>
          Nomor HP
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
        </label>
        <label>
          Keluhan Singkat
          <textarea
            value={form.complaint}
            onChange={(e) => setForm({ ...form, complaint: e.target.value })}
          />
        </label>
        {error && <p className="error">{error}</p>}
        <button type="submit" className="btn primary" disabled={submitting}>
          {submitting ? "Mendaftar..." : "Ambil Nomor Antrean"}
        </button>
      </form>
    </div>
  );
}
