const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

function toDateOnly(d) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function main() {
  await prisma.clinic.upsert({
    where: { id: "main" },
    create: {
      id: "main",
      doctorName: "dr. Budi Santoso, Sp.PD",
      doctorShortBio:
        "Dokter spesialis penyakit dalam dengan pengalaman 15 tahun di layanan klinik mandiri.",
      address: "Jl. Sehat No. 10, Jakarta Selatan",
      regularHours: "Senin-Sabtu: 08.00-12.00 (Pagi), 16.00-20.00 (Sore)",
    },
    update: {},
  });

  const today = toDateOnly(new Date());
  for (let i = 0; i < 7; i++) {
    const date = toDateOnly(new Date(today.getTime() + i * 86400000));
    for (const session of ["MORNING", "AFTERNOON"]) {
      await prisma.scheduleSlot.upsert({
        where: { date_session: { date, session } },
        create: { date, session, quota: 10, isOpen: true },
        update: {},
      });
    }
  }

  console.log("Seed selesai: clinic + 7 hari slot jadwal (Pagi & Sore).");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
