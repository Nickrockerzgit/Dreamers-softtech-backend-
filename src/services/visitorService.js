const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// ── TRACK VISIT (increment current month) ─────────────────────
const trackVisit = async () => {
  const now = new Date();
  const month = MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return await prisma.visitorLog.upsert({
    where: { month_year: { month, year } },
    update: { count: { increment: 1 } },
    create: { month, year, count: 1 },
  });
};

// ── GET LAST 8 MONTHS DATA ─────────────────────────────────────
const getMonthlyVisitors = async () => {
  const now = new Date();
  const months = [];

  // build last 8 months in order
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: MONTHS[d.getMonth()],
      year: d.getFullYear(),
    });
  }

  // fetch all matching records
  const records = await prisma.visitorLog.findMany({
    where: {
      OR: months.map((m) => ({ month: m.month, year: m.year })),
    },
  });

  // merge with 0 fallback for months with no data
  return months.map((m) => {
    const found = records.find((r) => r.month === m.month && r.year === m.year);
    return {
      month: m.month,
      year: m.year,
      visitors: found?.count ?? 0,
    };
  });
};

module.exports = { trackVisit, getMonthlyVisitors };
