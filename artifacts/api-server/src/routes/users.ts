import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { GetUserProfileParams } from "@workspace/api-zod";
import { getUserBadges } from "../lib/gamification.js";

const router: IRouter = Router();

router.get("/:id", async (req, res) => {
  const parse = GetUserProfileParams.safeParse({ id: req.params.id });
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, parse.data.id)).limit(1);
  if (!user) {
    res.status(404).json({ error: "Not Found", message: "User not found" });
    return;
  }

  const allUsers = await db.select({ id: usersTable.id, xp: usersTable.xp }).from(usersTable).orderBy(desc(usersTable.xp));
  const rank = allUsers.findIndex((u) => u.id === user.id) + 1 || null;
  const badges = await getUserBadges(user.id);

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    xp: user.xp,
    level: user.level,
    starRank: user.starRank,
    solvedCount: user.solvedCount,
    streak: user.streak,
    dailyQuestsCompleted: user.dailyQuestsCompleted,
    rank,
    badges,
    createdAt: user.createdAt,
  });
});

export default router;
