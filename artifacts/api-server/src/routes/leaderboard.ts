import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { desc } from "drizzle-orm";
import { GetLeaderboardQueryParams } from "@workspace/api-zod";
import { authenticateToken, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

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

  const authHeader = req.headers["authorization"];
  let currentUserRank: number | null = null;

  if (authHeader) {
    try {
      const token = authHeader.split(" ")[1];
      const jwt = await import("jsonwebtoken");
      const secret = process.env.JWT_SECRET || "codequest-secret-key-change-in-production";
      const decoded = jwt.default.verify(token, secret) as { userId: number };
      const idx = allUsers.findIndex((u) => u.id === decoded.userId);
      currentUserRank = idx >= 0 ? idx + 1 : null;
    } catch {
      // ignore auth errors for leaderboard
    }
  }

  res.json({
    entries: paginated.map((user, idx) => ({
      rank: (page - 1) * limit + idx + 1,
      userId: user.id,
      username: user.username,
      xp: user.xp,
      level: user.level,
      solvedCount: user.solvedCount,
    })),
    total,
    page,
    limit,
    currentUserRank,
  });
});

export default router;
