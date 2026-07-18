const prisma = require("../config/database");

function toDateOnly(value) {
  const d = new Date(value);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function listSlots(req, res) {
  try {
    const { date } = req.query;
    const where = date ? { date: toDateOnly(date) } : {};
    const slots = await prisma.scheduleSlot.findMany({
      where,
      orderBy: [{ date: "asc" }, { session: "asc" }],
      include: {
        _count: {
          select: { bookings: { where: { status: { not: "SKIPPED" } } } },
        },
      },
    });

    const result = slots.map((s) => ({
      id: s.id,
      date: s.date,
      session: s.session,
      quota: s.quota,
      isOpen: s.isOpen,
      used: s._count.bookings,
      remaining: s.quota - s._count.bookings,
    }));

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function upsertSlot(req, res) {
  try {
    const { date, session, quota, isOpen } = req.body;
    if (!date || isNaN(new Date(date).getTime())) {
      return res.status(400).json({ error: "Tanggal tidak valid" });
    }
    if (!["MORNING", "AFTERNOON"].includes(session)) {
      return res.status(400).json({ error: "Sesi harus MORNING atau AFTERNOON" });
    }
    const q = quota === undefined ? 10 : Number(quota);

    const slot = await prisma.scheduleSlot.upsert({
      where: { date_session: { date: toDateOnly(date), session } },
      create: {
        date: toDateOnly(date),
        session,
        quota: q,
        isOpen: isOpen === undefined ? true : Boolean(isOpen),
      },
      update: {
        quota: q,
        isOpen: isOpen === undefined ? true : Boolean(isOpen),
      },
    });

    return res.json({ message: "Slot tersimpan", slot });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function setSlotOpen(req, res) {
  try {
    const { id } = req.params;
    const { isOpen } = req.body;
    const slot = await prisma.scheduleSlot.update({
      where: { id },
      data: { isOpen: Boolean(isOpen) },
    });
    return res.json({ message: "Status slot diubah", slot });
  } catch (err) {
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = { listSlots, upsertSlot, setSlotOpen };
