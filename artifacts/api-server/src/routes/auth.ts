import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq, desc } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { authenticateToken, generateToken, type AuthRequest } from "../middlewares/auth.js";
import { getUserBadges } from "../lib/gamification.js";

const router: IRouter = Router();

function buildUserProfile(user: typeof usersTable.$inferSelect, rank: number | null, badges: ReturnType<typeof getUserBadges> extends Promise<infer T> ? T : never) {
  return {
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
  };
}

router.post("/register", async (req, res) => {
  const parse = RegisterBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { username, email, password } = parse.data;

  const [existingEmail] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existingEmail) {
    res.status(409).json({ error: "Conflict", message: "Email already in use" });
    return;
  }

  const [existingUsername] = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
  if (existingUsername) {
    res.status(409).json({ error: "Conflict", message: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const [user] = await db.insert(usersTable).values({ username, email, passwordHash }).returning();

  const token = generateToken(user.id);
  const badges = await getUserBadges(user.id);

  res.status(201).json({
    token,
    user: buildUserProfile(user, null, badges),
  });
});

router.post("/login", async (req, res) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { email, password } = parse.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const allUsers = await db.select({ id: usersTable.id, xp: usersTable.xp }).from(usersTable).orderBy(desc(usersTable.xp));
  const rank = allUsers.findIndex((u) => u.id === user.id) + 1 || null;
  const badges = await getUserBadges(user.id);
  const token = generateToken(user.id);

  res.json({
    token,
    user: buildUserProfile(user, rank, badges),
  });
});

router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }

  const allUsers = await db.select({ id: usersTable.id, xp: usersTable.xp }).from(usersTable).orderBy(desc(usersTable.xp));
  const rank = allUsers.findIndex((u) => u.id === user.id) + 1 || null;
  const badges = await getUserBadges(user.id);

  res.json(buildUserProfile(user, rank, badges));
});

export default router;
