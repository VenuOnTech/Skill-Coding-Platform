import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { problemsTable } from "@workspace/db/schema";
import { eq, like, and, SQL } from "drizzle-orm";
import { GetProblemsQueryParams, GetProblemParams } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  const parse = GetProblemsQueryParams.safeParse(req.query);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { difficulty, topic, search, page = 1, limit = 20 } = parse.data;

  const conditions: SQL[] = [];
  if (difficulty) conditions.push(eq(problemsTable.difficulty, difficulty));
  if (topic) conditions.push(eq(problemsTable.topic, topic));
  if (search) conditions.push(like(problemsTable.title, `%${search}%`));

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const [problems, countResult] = await Promise.all([
    db
      .select()
      .from(problemsTable)
      .where(where)
      .limit(limit)
      .offset((page - 1) * limit),
    db.select({ id: problemsTable.id }).from(problemsTable).where(where),
  ]);

  res.json({
    problems: problems.map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      difficulty: p.difficulty,
      topic: p.topic,
      tags: p.tags || [],
      acceptanceRate: p.acceptanceRate,
      solvedCount: p.solvedCount,
    })),
    total: countResult.length,
    page,
    limit,
  });
});

router.get("/:id", async (req, res) => {
  const parse = GetProblemParams.safeParse({ id: req.params.id });
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const [problem] = await db
    .select()
    .from(problemsTable)
    .where(eq(problemsTable.id, parse.data.id))
    .limit(1);

  if (!problem) {
    res.status(404).json({ error: "Not Found", message: "Problem not found" });
    return;
  }

  res.json({
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty,
    topic: problem.topic,
    tags: problem.tags || [],
    acceptanceRate: problem.acceptanceRate,
    solvedCount: problem.solvedCount,
    description: problem.description,
    constraints: problem.constraints,
    examples: problem.examples || [],
    starterCode: {
      python: problem.starterCodePython,
      javascript: problem.starterCodeJavascript,
    },
  });
});

export default router;
