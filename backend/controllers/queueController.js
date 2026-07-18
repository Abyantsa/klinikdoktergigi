const prisma = require("../config/database");
const { nextQueueNumber } = require("./bookingController");

async function listQueue(req, res) {
  try {
    const { date } = req.query;
    const dateOnly = date ? new Date(date) : new Date();
    dateOnly.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: { date: dateOnly },
      orderBy: [{ status: "asc" }, { queueNumber: "asc" }],
    });

    const grouped = {
      WAITING: [],
      EXAMINING: [],
      SKIPPED: [],
      COMPLETED: [],
    };

    for (const b of bookings) {
      if (!grouped[b.status]) grouped[b.status] = [];
      grouped[b.status].push({
        id: b.id,
        queueNumber: b.queueNumber,
        patientName: b.patientName,
        session: b.session,
        status: b.status,
        complaint: b.complaint,
      });
    }

    return res.json(grouped);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function callNext(req, res) {
  try {
    const { date } = req.body;
    const dateOnly = date ? new Date(date) : new Date();
    dateOnly.setHours(0, 0, 0, 0);

    const examining = await prisma.booking.findFirst({
      where: { date: dateOnly, status: "EXAMINING" },
    });
    if (examining) {
      return res.status(409).json({
        error: "Masih ada pasien yang diperiksa (No. " + examining.queueNumber + ")",
      });
    }

    const next = await prisma.booking.findFirst({
      where: { date: dateOnly, status: "WAITING" },
      orderBy: { queueNumber: "asc" },
    });

    if (!next) {
      return res.status(404).json({ error: "Tidak ada pasien menunggu" });
    }

    const updated = await prisma.booking.update({
      where: { id: next.id },
      data: { status: "EXAMINING" },
    });

    return res.json({
      message: "Memanggil pasien berikutnya",
      patient: {
        id: updated.id,
        queueNumber: updated.queueNumber,
        patientName: updated.patientName,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function skipPatient(req, res) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Pasien tidak ditemukan" });
    if (booking.status !== "EXAMINING") {
      return res.status(409).json({ error: "Hanya pasien EXAMINING yang bisa dilewati" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "SKIPPED" },
    });

    return res.json({
      message: "Pasien dilewati",
      patient: { id: updated.id, queueNumber: updated.queueNumber },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function recallPatient(req, res) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Pasien tidak ditemukan" });
    if (booking.status !== "SKIPPED") {
      return res.status(409).json({ error: "Hanya pasien SKIPPED yang bisa dipanggil ulang" });
    }

    const examining = await prisma.booking.findFirst({
      where: { date: booking.date, status: "EXAMINING" },
    });
    if (examining) {
      return res.status(409).json({
        error: "Selesaikan pasien yang sedang diperiksa terlebih dahulu",
      });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "EXAMINING" },
    });

    return res.json({
      message: "Pasien dipanggil kembali",
      patient: { id: updated.id, queueNumber: updated.queueNumber },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function completePatient(req, res) {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ error: "Pasien tidak ditemukan" });
    if (booking.status !== "EXAMINING") {
      return res.status(409).json({ error: "Hanya pasien EXAMINING yang bisa diselesaikan" });
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    return res.json({
      message: "Pemeriksaan selesai",
      patient: { id: updated.id, queueNumber: updated.queueNumber },
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function getReport(req, res) {
  try {
    const { range } = req.query;
    const now = new Date();
    let from = new Date();

    if (range === "month") {
      from.setMonth(now.getMonth() - 1);
    } else {
      from.setDate(now.getDate() - 7);
    }
    from.setHours(0, 0, 0, 0);

    const bookings = await prisma.booking.findMany({
      where: { createdAt: { gte: from } },
      orderBy: { createdAt: "asc" },
    });

    const byDay = {};
    for (const b of bookings) {
      const key = b.createdAt.toISOString().slice(0, 10);
      byDay[key] = (byDay[key] || 0) + 1;
    }

    return res.json({
      range,
      total: bookings.length,
      series: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  listQueue,
  callNext,
  skipPatient,
  recallPatient,
  completePatient,
  getReport,
};
