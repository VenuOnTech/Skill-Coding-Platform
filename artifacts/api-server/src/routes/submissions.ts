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

const router: IRouter = Router();

function computeXP(difficulty: string, passedCount: number, totalCount: number): number {
  if (passedCount < totalCount) return 0;
  const xpMap: Record<string, number> = {
    Easy: 50,
    Medium: 100,
    Hard: 200,
  };
  return xpMap[difficulty] || 50;
}

function computeLevel(xp: number): number {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  return Math.floor(10 + (xp - 4500) / 1000);
}

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

  const results = await Promise.all(
    sampleTestCases.map((tc) =>
      runTestCase(code, language, tc.input, tc.expectedOutput)
    )
  );

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

  const results = await Promise.all(
    allTestCases.map((tc) =>
      runTestCase(code, language, tc.input, tc.expectedOutput)
    )
  );

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

  const avgRuntime =
    results.reduce((sum, r) => sum + (r.time || 0), 0) / results.length;

  const xpEarned = computeXP(problem.difficulty, passedCount, totalCount);

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

  if (xpEarned > 0) {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!))
      .limit(1);

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

    const isFirstAccept = existingAccepted.length === 1;

    if (user && isFirstAccept) {
      const newXp = user.xp + xpEarned;
      const newLevel = computeLevel(newXp);
      const newSolvedCount = user.solvedCount + 1;

      await db
        .update(usersTable)
        .set({ xp: newXp, level: newLevel, solvedCount: newSolvedCount })
        .where(eq(usersTable.id, req.userId!));

      await db
        .update(problemsTable)
        .set({ solvedCount: problem.solvedCount + 1 })
        .where(eq(problemsTable.id, problemId));
    }
  }

  res.json({
    id: submission.id,
    status,
    passedCount,
    totalCount,
    xpEarned: allPassed ? xpEarned : 0,
    results,
    runtime: avgRuntime || null,
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
