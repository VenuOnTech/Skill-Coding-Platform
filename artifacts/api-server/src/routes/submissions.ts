import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import {
  submissionsTable,
  testCasesTable,
  problemsTable,
  usersTable,
} from "@workspace/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { SubmitCodeBody, RunCodeBody, GetSubmissionHistoryQueryParams } from "@workspace/api-zod";
import { authenticateToken, type AuthRequest } from "../middlewares/auth.js";
import { runTestCase } from "../lib/judge0.js";
import {
  computeXP,
  computeLevel,
  computeStarRank,
  updateStreak,
  checkAndAwardBadges,
  getDailyQuestProblemId,
  getUserBadges,
} from "../lib/gamification.js";

const router: IRouter = Router();

router.post("/run", authenticateToken, async (req: AuthRequest, res) => {
  const parse = RunCodeBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { problemId, code, language } = parse.data;

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, problemId))
    .limit(1);

  if (!problem) {
    res.status(404).json({ error: "Not Found", message: "Problem not found" });
    return;
  }

  const sampleTestCases = await db
    .select()
    .from(testCasesTable)
    .where(and(eq(testCasesTable.problemId, problemId), eq(testCasesTable.isHidden, false)));

  const rawResults = await Promise.all(
    sampleTestCases.map((tc) =>
      runTestCase(code, language, tc.input, tc.expectedOutput)
    )
  );
  
  const results = rawResults.map((r) => ({
    ...r,
    actualOutput: r.actualOutput ?? undefined,
    error: r.error ?? undefined,
    time: r.time ?? undefined,
  }));

  res.json({
    results,
    allPassed: results.every((r) => r.passed),
  });
});

router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  const parse = SubmitCodeBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { problemId, code, language } = parse.data;

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, problemId))
    .limit(1);

  if (!problem) {
    res.status(404).json({ error: "Not Found", message: "Problem not found" });
    return;
  }

  const allTestCases = await db
    .select()
    .from(testCasesTable)
    .where(eq(testCasesTable.problemId, problemId));

  const rawResults = await Promise.all(
    allTestCases.map((tc) =>
      runTestCase(code, language, tc.input, tc.expectedOutput)
    )
  );

  const results = rawResults.map((r) => ({
    ...r,
    actualOutput: r.actualOutput ?? undefined,
    error: r.error ?? undefined,
    time: r.time ?? undefined,
  }));

  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = results.length;
  const allPassed = passedCount === totalCount;

  let status: string;
  if (allPassed) {
    status = "Accepted";
  } else if (results.some((r) => r.error?.includes("Time"))) {
    status = "Time Limit Exceeded";
  } else if (results.some((r) => r.error && !r.error.includes("Time"))) {
    status = "Runtime Error";
  } else {
    status = "Wrong Answer";
  }

  const avgRuntime = results.reduce((sum, r) => sum + (r.time || 0), 0) / (results.length || 1);
  const xpEarned = allPassed ? computeXP(problem.difficulty) : 0;

  const [submission] = await db
    .insert(submissionsTable)
    .values({
      userId: req.userId!,
      problemId,
      language,
      code,
      status,
      passedCount,
      totalCount,
      xpEarned,
      runtime: avgRuntime || null,
      results,
    })
    .returning();

  let bonusXpEarned = 0;
  let newBadges: Array<{ slug: string; name: string; description: string; icon: string; category: string; rarity: string; earned: boolean; earnedAt: Date | null }> = [];
  let streakUpdated = false;
  let newStreak = 0;
  let newStarRank: number | null = null;
  let levelUp = false;
  let newLevel: number | null = null;
  let isDailyQuest = false;

  if (allPassed) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

    if (user) {
      const existingAccepted = await db
        .select()
        .from(submissionsTable)
        .where(
          and(
            eq(submissionsTable.userId, req.userId!),
            eq(submissionsTable.problemId, problemId),
            eq(submissionsTable.status, "Accepted")
          )
        );

      const isFirstAccept = existingAccepted.length === 0;

      const allProblems = await db.select({ id: problemsTable.id }).from(problemsTable);
      const dailyProblemId = getDailyQuestProblemId(allProblems.map((p) => p.id));
      isDailyQuest = problemId === dailyProblemId;
      const dailyBonusXp = Math.floor(computeXP(problem.difficulty) * 0.5);

      if (isFirstAccept) {
        let addedXp = xpEarned;

        if (isDailyQuest) {
          bonusXpEarned = dailyBonusXp;
          addedXp += bonusXpEarned;
        }

        const oldLevel = user.level;
        const newXp = user.xp + addedXp;
        const computedLevel = computeLevel(newXp);
        const computedStarRank = computeStarRank(computedLevel);

        levelUp = computedLevel > oldLevel;
        newLevel = levelUp ? computedLevel : null;

        const oldStarRank = user.starRank;
        if (computedStarRank > oldStarRank) {
          newStarRank = computedStarRank;
        }

        const streakResult = await updateStreak(req.userId!, {
          streak: user.streak,
          lastSolvedDate: user.lastSolvedDate,
        });
        streakUpdated = streakResult.streakUpdated;
        newStreak = streakResult.newStreak;

        let newDailyQuestsCompleted = user.dailyQuestsCompleted;
        if (isDailyQuest) {
          newDailyQuestsCompleted += 1;
        }

        await db
          .update(usersTable)
          .set({
            xp: newXp,
            level: computedLevel,
            starRank: computedStarRank,
            solvedCount: user.solvedCount + 1,
            dailyQuestsCompleted: newDailyQuestsCompleted,
          })
          .where(eq(usersTable.id, req.userId!));

        await db
          .update(problemsTable)
          .set({ solvedCount: problem.solvedCount + 1 })
          .where(eq(problemsTable.id, problemId));

        newBadges = (await checkAndAwardBadges(req.userId!, {
          xp: newXp,
          level: computedLevel,
          solvedCount: user.solvedCount + 1,
          streak: newStreak,
          dailyQuestsCompleted: newDailyQuestsCompleted,
        })).map((b) => ({ ...b, earned: true, earnedAt: new Date() }));

      } else {
        const streakResult = await updateStreak(req.userId!, {
          streak: user.streak,
          lastSolvedDate: user.lastSolvedDate,
        });
        streakUpdated = streakResult.streakUpdated;
        newStreak = streakResult.newStreak;
      }
    }
  }

  res.json({
    id: submission.id,
    status,
    passedCount,
    totalCount,
    xpEarned,
    bonusXpEarned,
    results,
    runtime: avgRuntime || null,
    newBadges,
    streakUpdated,
    newStreak,
    newStarRank,
    isDailyQuest,
    levelUp,
    newLevel,
  });
});

router.get("/history", authenticateToken, async (req: AuthRequest, res) => {
  const parse = GetSubmissionHistoryQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const conditions = [eq(submissionsTable.userId, req.userId!)];
  if (parse.data.problemId) {
    conditions.push(eq(submissionsTable.problemId, parse.data.problemId));
  }

  const submissions = await db
    .select({
      id: submissionsTable.id,
      problemId: submissionsTable.problemId,
      problemTitle: problemsTable.title,
      language: submissionsTable.language,
      status: submissionsTable.status,
      passedCount: submissionsTable.passedCount,
      totalCount: submissionsTable.totalCount,
      runtime: submissionsTable.runtime,
      submittedAt: submissionsTable.submittedAt,
    })
    .from(submissionsTable)
    .leftJoin(problemsTable, eq(submissionsTable.problemId, problemsTable.id))
    .where(and(...conditions))
    .orderBy(desc(submissionsTable.submittedAt))
    .limit(50);

  res.json({
    submissions: submissions.map((s) => ({
      ...s,
      problemTitle: s.problemTitle || "Unknown",
    })),
  });
});

export default router;
