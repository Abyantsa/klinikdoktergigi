const prisma = require("../config/database");

function startOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toDateOnly(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function nextQueueNumber(dateOnly) {
  return prisma.$transaction(async (tx) => {
    const counter = await tx.dailyCounter.upsert({
      where: { date: dateOnly },
      create: { date: dateOnly, lastNumber: 0 },
      update: {},
    });

    const next = counter.lastNumber + 1;
    await tx.dailyCounter.update({
      where: { date: dateOnly },
      data: { lastNumber: next },
    });

    return next;
  });
}

function validateBookingInput(body) {
  const errors = [];
  const { patientName, phone, complaint, date, session } = body;

  if (!patientName || String(patientName).trim().length < 2) {
    errors.push("Nama pasien wajib diisi (minimal 2 karakter)");
  }
  if (!phone || String(phone).trim().length < 5) {
    errors.push("Nomor HP wajib diisi");
  }
  if (!date || isNaN(new Date(date).getTime())) {
    errors.push("Tanggal periksa tidak valid");
  }
  if (!["MORNING", "AFTERNOON"].includes(session)) {
    errors.push("Sesi harus MORNING atau AFTERNOON");
  }
  return errors;
}

async function createBooking(req, res) {
  try {
    const errors = validateBookingInput(req.body);
    if (errors.length) {
      return res.status(400).json({ error: errors.join("; ") });
    }

    const dateOnly = toDateOnly(req.body.date);
    const session = req.body.session;

    const slot = await prisma.scheduleSlot.findUnique({
      where: { date_session: { date: dateOnly, session } },
    });

    if (!slot || !slot.isOpen) {
      return res.status(409).json({ error: "Slot jadwal tidak tersedia/tutup" });
    }

    const used = await prisma.booking.count({
      where: { date: dateOnly, session, status: { not: "SKIPPED" } },
    });

    if (used >= slot.quota) {
      return res.status(409).json({ error: "Kuota sesi sudah penuh" });
    }

    const queueNumber = await nextQueueNumber(dateOnly);

    const booking = await prisma.booking.create({
      data: {
        queueNumber,
        patientName: String(req.body.patientName).trim(),
        phone: String(req.body.phone).trim(),
        complaint: String(req.body.complaint || "").trim(),
        date: dateOnly,
        session,
        slotId: slot.id,
        status: "WAITING",
      },
    });

    return res.status(201).json({
      message: "Booking berhasil",
      booking: {
        id: booking.id,
        reservationCode: booking.id.slice(-8).toUpperCase(),
        queueNumber: booking.queueNumber,
        patientName: booking.patientName,
        date: booking.date,
        session: booking.session,
        status: booking.status,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getQueueTicket(req, res) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });

    if (!booking) {
      return res.status(404).json({ error: "Tiket tidak ditemukan" });
    }

    return res.json({
      id: booking.id,
      reservationCode: booking.id.slice(-8).toUpperCase(),
      queueNumber: booking.queueNumber,
      patientName: booking.patientName,
      date: booking.date,
      session: booking.session,
      status: booking.status,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getClinicInfo(req, res) {
  try {
    const clinic = await prisma.clinic.findUnique({ where: { id: "main" } });
    const today = startOfDay();
    const active = await prisma.booking.findFirst({
      where: { date: today, status: "EXAMINING" },
      orderBy: { queueNumber: "asc" },
    });

    return res.json({
      clinic: clinic || null,
      currentlyServing: active ? active.queueNumber : null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  createBooking,
  getQueueTicket,
  getClinicInfo,
  nextQueueNumber,
  startOfDay,
  toDateOnly,
};
