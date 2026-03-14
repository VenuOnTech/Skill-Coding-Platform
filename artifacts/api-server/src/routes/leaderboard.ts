import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, submissionsTable } from "@workspace/db/schema";
import { desc, eq, and, gte } from "drizzle-orm";
import { GetLeaderboardQueryParams, GetWeeklyLeaderboardQueryParams } from "@workspace/api-zod";
import { getWeekBounds } from "../lib/gamification.js";

const router: IRouter = Router();

async function getRequestUserId(req: { headers: { authorization?: string } }): Promise<number | null> {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return null;
  try {
    const token = authHeader.split(" ")[1];
    const jwt = await import("jsonwebtoken");
    const secret = process.env.JWT_SECRET || "codequest-secret-key-change-in-production";
    const decoded = jwt.default.verify(token, secret) as { userId: number };
    return decoded.userId;
  } catch {
    return null;
  }
}

router.get("/weekly", async (req, res) => {
  const parse = GetWeeklyLeaderboardQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { page = 1, limit = 50 } = parse.data;
  const { start, end } = getWeekBounds();

  const weekSubmissions = await db
    .select({
      userId: submissionsTable.userId,
      problemId: submissionsTable.problemId,
      xpEarned: submissionsTable.xpEarned,
    })
    .from(submissionsTable)
    .where(
      and(
        eq(submissionsTable.status, "Accepted"),
        gte(submissionsTable.submittedAt, start)
      )
    );

  // Aggregate: unique problems solved per user + xp this week
  const userStats = new Map<number, { solvedThisWeek: number; xpThisWeek: number; problemsSeen: Set<number> }>();

  for (const row of weekSubmissions) {
    if (!userStats.has(row.userId)) {
      userStats.set(row.userId, { solvedThisWeek: 0, xpThisWeek: 0, problemsSeen: new Set() });
    }
    const stats = userStats.get(row.userId)!;
    if (!stats.problemsSeen.has(row.problemId)) {
      stats.problemsSeen.add(row.problemId);
      stats.solvedThisWeek += 1;
      stats.xpThisWeek += row.xpEarned || 0;
    }
  }

  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const entries = Array.from(userStats.entries())
    .map(([userId, stats]) => {
      const user = userMap.get(userId);
      return {
        userId,
        username: user?.username || "Unknown",
        level: user?.level || 1,
        starRank: user?.starRank || 1,
        solvedThisWeek: stats.solvedThisWeek,
        xpThisWeek: stats.xpThisWeek,
      };
    })
    .sort((a, b) => b.solvedThisWeek - a.solvedThisWeek || b.xpThisWeek - a.xpThisWeek);

  const total = entries.length;
  const paginated = entries.slice((page - 1) * limit, page * limit).map((e, idx) => ({
    rank: (page - 1) * limit + idx + 1,
    ...e,
  }));

  const requestUserId = await getRequestUserId(req as any);
  const currentUserRank = requestUserId
    ? (entries.findIndex((e) => e.userId === requestUserId) + 1) || null
    : null;

  res.json({
    entries: paginated,
    total,
    page,
    limit,
    weekStart: start.toISOString().split("T")[0],
    weekEnd: end.toISOString().split("T")[0],
    currentUserRank,
  });
});

router.get("/", async (req, res) => {
  const parse = GetLeaderboardQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { page = 1, limit = 50 } = parse.data;

  const allUsers = await db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.xp));

  const total = allUsers.length;
  const paginated = allUsers.slice((page - 1) * limit, page * limit);

  const requestUserId = await getRequestUserId(req as any);
  const currentUserRank = requestUserId
    ? (allUsers.findIndex((u) => u.id === requestUserId) + 1) || null
    : null;

  res.json({
    entries: paginated.map((user, idx) => ({
      rank: (page - 1) * limit + idx + 1,
      userId: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      starRank: user.starRank,
      solvedCount: user.solvedCount,
      streak: user.streak,
    })),
    total,
    page,
    limit,
    currentUserRank,
  });
});

export default router;
