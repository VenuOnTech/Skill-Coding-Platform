import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { RegisterBody, LoginBody } from "@workspace/api-zod";
import { authenticateToken, generateToken, type AuthRequest } from "../middlewares/auth.js";

const router: IRouter = Router();

router.post("/register", async (req, res) => {
  const parse = RegisterBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { username, email, password } = parse.data;

  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (existing.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Email already in use" });
    return;
  }

  const existingUsername = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.username, username))
    .limit(1);

  if (existingUsername.length > 0) {
    res.status(409).json({ error: "Conflict", message: "Username already taken" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ username, email, passwordHash })
    .returning();

  const token = generateToken(user.id);

  res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      solvedCount: user.solvedCount,
      createdAt: user.createdAt,
    },
  });
});

router.post("/login", async (req, res) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Bad Request", message: parse.error.message });
    return;
  }

  const { email, password } = parse.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "Unauthorized", message: "Invalid credentials" });
    return;
  }

  const token = generateToken(user.id);

  res.json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      xp: user.xp,
      level: user.level,
      solvedCount: user.solvedCount,
      createdAt: user.createdAt,
    },
  });
});

router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!))
    .limit(1);

  if (!user) {
    res.status(401).json({ error: "Unauthorized", message: "User not found" });
    return;
  }

  const allUsers = await db
    .select({ id: usersTable.id, xp: usersTable.xp })
    .from(usersTable)
    .orderBy(usersTable.xp);

  const sortedByXp = allUsers.sort((a, b) => b.xp - a.xp);
  const rank = sortedByXp.findIndex((u) => u.id === user.id) + 1;

  res.json({
    id: user.id,
    username: user.username,
    email: user.email,
    xp: user.xp,
    level: user.level,
    solvedCount: user.solvedCount,
    rank: rank || null,
    createdAt: user.createdAt,
  });
});

export default router;
