const app = require("./app");
const prisma = require("./config/database");

const PORT = process.env.PORT || 4000;

async function resetDailyCounter() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await prisma.dailyCounter.upsert({
    where: { date: today },
    create: { date: today, lastNumber: 0 },
    update: { lastNumber: 0 },
  });
  console.log("[cron] Daily counter reset for", today.toISOString().slice(0, 10));
}

function scheduleDailyReset() {
  const now = new Date();
  const nextMidnight = new Date(now);
  nextMidnight.setHours(24, 0, 0, 0);
  const delay = nextMidnight - now;

  setTimeout(async () => {
    await resetDailyCounter();
    setInterval(resetDailyCounter, 24 * 60 * 60 * 1000);
  }, delay);
}

const server = app.listen(PORT, async () => {
  console.log(`DocReserve backend running on http://localhost:${PORT}`);
  try {
    await resetDailyCounter();
    scheduleDailyReset();
  } catch (err) {
    console.error("Daily reset init failed:", err.message);
  }
});

module.exports = server;
