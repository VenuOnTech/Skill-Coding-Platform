import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable, problemsTable, userBadgesTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { authenticateToken, type AuthRequest } from "../middlewares/auth.js";
import {
  ALL_BADGES,
  getUserBadges,
  getDailyQuestProblemId,
  getTodayDate,
  computeXP,
} from "../lib/gamification.js";

const router: IRouter = Router();

router.get("/badges", async (req, res) => {
  const authHeader = req.headers["authorization"];
  let userId: number | null = null;

  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const jwt = await import("jsonwebtoken");
      const secret = process.env.JWT_SECRET || "codequest-secret-key-change-in-production";
      const decoded = jwt.default.verify(token, secret) as { userId: number };
      userId = decoded.userId;
    } catch { /* ignore */ }
  }

  let earnedSlugs = new Set<string>();
  let earnedAtMap = new Map<string, Date>();
  if (userId) {
    const rows = await db
      .select()
      .from(userBadgesTable)
      .where(eq(userBadgesTable.userId, userId));
    rows.forEach((r) => {
      earnedSlugs.add(r.badgeSlug);
      earnedAtMap.set(r.badgeSlug, r.earnedAt);
    });
  }

  res.json({
    badges: ALL_BADGES.map((badge) => ({
      ...badge,
      earned: earnedSlugs.has(badge.slug),
      earnedAt: earnedAtMap.get(badge.slug) || null,
    })),
  });
});

router.get("/badges/me", authenticateToken, async (req: AuthRequest, res) => {
  const badges = await getUserBadges(req.userId!);
  const earned = badges.filter((b) => b.earned);

  res.json({
    badges: earned,
    totalEarned: earned.length,
  });
});

router.get("/daily-quest", async (req, res) => {
  const problems = await db
    .select({ id: problemsTable.id, title: problemsTable.title, difficulty: problemsTable.difficulty, topic: problemsTable.topic })
    .from(problemsTable);

  if (problems.length === 0) {
    res.status(404).json({ error: "Not Found", message: "No problems available" });
    return;
  }

  const dailyId = getDailyQuestProblemId(problems.map((p) => p.id));
  const daily = problems.find((p) => p.id === dailyId) || problems[0];
  const bonusXp = Math.floor(computeXP(daily.difficulty) * 0.5);

  let completed = false;
  const authHeader = req.headers["authorization"];
  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const jwt = await import("jsonwebtoken");
      const secret = process.env.JWT_SECRET || "codequest-secret-key-change-in-production";
      const decoded = jwt.default.verify(token, secret) as { userId: number };
      const [user] = await db.select({ lastSolvedDate: usersTable.lastSolvedDate }).from(usersTable).where(eq(usersTable.id, decoded.userId)).limit(1);
      // simplified: check if user solved this problem today
      const { submissionsTable } = await import("@workspace/db/schema");
      const { and, gte, eq: eqDrizzle } = await import("drizzle-orm");
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todaySubmissions = await db
        .select()
        .from(submissionsTable)
        .where(
          and(
            eqDrizzle(submissionsTable.userId, decoded.userId),
            eqDrizzle(submissionsTable.problemId, daily.id),
            eqDrizzle(submissionsTable.status, "Accepted"),
            gte(submissionsTable.submittedAt, todayStart)
          )
        )
        .limit(1);
      completed = todaySubmissions.length > 0;
    } catch { /* ignore */ }
  }

  res.json({
    problemId: daily.id,
    problemTitle: daily.title,
    difficulty: daily.difficulty,
    topic: daily.topic,
    bonusXp,
    date: getTodayDate(),
    completed,
  });
});

export default router;
