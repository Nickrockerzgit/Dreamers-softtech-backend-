const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getStats = async () => {
  let stats = await prisma.siteStats.findUnique({ where: { id: 1 } });
  if (!stats) {
    stats = await prisma.siteStats.create({ data: { id: 1 } });
  }
  return stats;
};

const updateStats = async (data) => {
  const {
    projectsCompleted,
    happyClients,
    yearsExperience,
    satisfactionRate,
    teamMembersCount,
    technologiesCount,
  } = data;

  return await prisma.siteStats.upsert({
    where: { id: 1 },
    update: {
      ...(projectsCompleted !== undefined && {
        projectsCompleted: Number(projectsCompleted),
      }),
      ...(happyClients !== undefined && { happyClients: Number(happyClients) }),
      ...(yearsExperience !== undefined && {
        yearsExperience: Number(yearsExperience),
      }),
      ...(satisfactionRate !== undefined && {
        satisfactionRate: Number(satisfactionRate),
      }),
      ...(teamMembersCount !== undefined && {
        teamMembersCount: Number(teamMembersCount),
      }),
      ...(technologiesCount !== undefined && {
        technologiesCount: Number(technologiesCount),
      }),
    },
    create: {
      id: 1,
      projectsCompleted: Number(projectsCompleted ?? 0),
      happyClients: Number(happyClients ?? 0),
      yearsExperience: Number(yearsExperience ?? 1),
      satisfactionRate: Number(satisfactionRate ?? 98),
      teamMembersCount: Number(teamMembersCount ?? 0),
      technologiesCount: Number(technologiesCount ?? 0),
    },
  });
};

// ── SYNC PROJECTS COUNT FROM PORTFOLIO TABLE ───────────────────
const syncProjectsCount = async () => {
  const count = await prisma.portfolio.count({
    where: { status: "published" },
  });

  return await prisma.siteStats.upsert({
    where: { id: 1 },
    update: { projectsCompleted: count },
    create: { id: 1, projectsCompleted: count },
  });
};

module.exports = { getStats, updateStats, syncProjectsCount };
