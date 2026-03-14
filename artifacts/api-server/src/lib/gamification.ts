import { db } from "@workspace/db";
import { usersTable, userBadgesTable, submissionsTable } from "@workspace/db/schema";
import { eq, and, gte, count, countDistinct, sum } from "drizzle-orm";

export interface BadgeDefinition {
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: "solving" | "xp" | "streak" | "quest" | "level";
  rarity: "common" | "rare" | "epic" | "legendary";
}

export const ALL_BADGES: BadgeDefinition[] = [
  // Solving badges
  { slug: "first-blood", name: "First Blood", description: "Solved your first problem", icon: "🩸", category: "solving", rarity: "common" },
  { slug: "hat-trick", name: "Hat Trick", description: "Solved 3 problems", icon: "🎩", category: "solving", rarity: "common" },
  { slug: "problem-solver", name: "Problem Solver", description: "Solved 10 problems", icon: "🧠", category: "solving", rarity: "rare" },
  { slug: "veteran", name: "Veteran", description: "Solved 25 problems", icon: "⚔️", category: "solving", rarity: "epic" },
  { slug: "centurion", name: "Centurion", description: "Solved 100 problems", icon: "💯", category: "solving", rarity: "legendary" },
  // XP badges
  { slug: "xp-seeker", name: "XP Seeker", description: "Earned 500 XP", icon: "⭐", category: "xp", rarity: "common" },
  { slug: "xp-hunter", name: "XP Hunter", description: "Earned 1000 XP", icon: "🌟", category: "xp", rarity: "rare" },
  { slug: "xp-legend", name: "XP Legend", description: "Earned 5000 XP", icon: "🏆", category: "xp", rarity: "legendary" },
  // Streak badges
  { slug: "streak-3", name: "On Fire", description: "3-day coding streak", icon: "🔥", category: "streak", rarity: "common" },
  { slug: "streak-7", name: "Week Warrior", description: "7-day coding streak", icon: "💪", category: "streak", rarity: "rare" },
  { slug: "streak-30", name: "Marathon", description: "30-day coding streak", icon: "🏃", category: "streak", rarity: "epic" },
  // Quest badges
  { slug: "daily-quester", name: "Daily Quester", description: "Completed a Daily Quest", icon: "📅", category: "quest", rarity: "common" },
  { slug: "quest-hunter", name: "Quest Hunter", description: "Completed 7 Daily Quests", icon: "🗺️", category: "quest", rarity: "rare" },
  // Level badges
  { slug: "level-5", name: "Rising Star", description: "Reached Level 5", icon: "🌠", category: "level", rarity: "common" },
  { slug: "level-10", name: "Expert", description: "Reached Level 10", icon: "🎓", category: "level", rarity: "rare" },
  { slug: "level-20", name: "Master", description: "Reached Level 20", icon: "👑", category: "level", rarity: "legendary" },
];

export function computeStarRank(level: number): number {
  if (level >= 9) return 5;
  if (level >= 7) return 4;
  if (level >= 5) return 3;
  if (level >= 3) return 2;
  return 1;
}

export function computeLevel(xp: number): number {
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

export function computeXP(difficulty: string): number {
  const xpMap: Record<string, number> = { Easy: 50, Medium: 100, Hard: 200 };
  return xpMap[difficulty] || 50;
}

export function getTodayDate(): string {
  return new Date().toISOString().split("T")[0];
}

export function getWeekBounds(): { start: Date; end: Date } {
  const now = new Date();
  const day = now.getUTCDay();
  const start = new Date(now);
  start.setUTCDate(now.getUTCDate() - day); // Sunday
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}

export function getDailyQuestProblemId(problemIds: number[]): number | null {
  if (problemIds.length === 0) return null;
  const today = getTodayDate();
  let hash = 0;
  for (const ch of today) hash = (hash * 31 + ch.charCodeAt(0)) % 1000000007;
  return problemIds[hash % problemIds.length];
}

export async function updateStreak(
  userId: number,
  user: { streak: number; lastSolvedDate: string | null }
): Promise<{ newStreak: number; streakUpdated: boolean }> {
  const today = getTodayDate();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  if (user.lastSolvedDate === today) {
    return { newStreak: user.streak, streakUpdated: false };
  }

  let newStreak: number;
  if (user.lastSolvedDate === yesterdayStr) {
    newStreak = user.streak + 1;
  } else {
    newStreak = 1;
  }

  await db
    .update(usersTable)
    .set({ streak: newStreak, lastSolvedDate: today })
    .where(eq(usersTable.id, userId));

  return { newStreak, streakUpdated: true };
}

export async function checkAndAwardBadges(
  userId: number,
  user: {
    xp: number;
    level: number;
    solvedCount: number;
    streak: number;
    dailyQuestsCompleted: number;
  }
): Promise<BadgeDefinition[]> {
  const existingRows = await db
    .select({ badgeSlug: userBadgesTable.badgeSlug })
    .from(userBadgesTable)
    .where(eq(userBadgesTable.userId, userId));

  const earned = new Set(existingRows.map((r) => r.badgeSlug));
  const newlyEarned: BadgeDefinition[] = [];

  const shouldAward = async (badge: BadgeDefinition): Promise<boolean> => {
    if (earned.has(badge.slug)) return false;

    switch (badge.slug) {
      case "first-blood": return user.solvedCount >= 1;
      case "hat-trick": return user.solvedCount >= 3;
      case "problem-solver": return user.solvedCount >= 10;
      case "veteran": return user.solvedCount >= 25;
      case "centurion": return user.solvedCount >= 100;
      case "xp-seeker": return user.xp >= 500;
      case "xp-hunter": return user.xp >= 1000;
      case "xp-legend": return user.xp >= 5000;
      case "streak-3": return user.streak >= 3;
      case "streak-7": return user.streak >= 7;
      case "streak-30": return user.streak >= 30;
      case "daily-quester": return user.dailyQuestsCompleted >= 1;
      case "quest-hunter": return user.dailyQuestsCompleted >= 7;
      case "level-5": return user.level >= 5;
      case "level-10": return user.level >= 10;
      case "level-20": return user.level >= 20;
      default: return false;
    }
  };

  for (const badge of ALL_BADGES) {
    if (await shouldAward(badge)) {
      await db.insert(userBadgesTable).values({ userId, badgeSlug: badge.slug });
      newlyEarned.push(badge);
    }
  }

  return newlyEarned;
}

export async function getUserBadges(userId: number): Promise<Array<BadgeDefinition & { earned: boolean; earnedAt: Date | null }>> {
  const rows = await db
    .select()
    .from(userBadgesTable)
    .where(eq(userBadgesTable.userId, userId));

  const earnedMap = new Map(rows.map((r) => [r.badgeSlug, r.earnedAt]));

  return ALL_BADGES.map((badge) => ({
    ...badge,
    earned: earnedMap.has(badge.slug),
    earnedAt: earnedMap.get(badge.slug) || null,
  }));
}

export async function getWeeklyStats(userId: number): Promise<{ solvedThisWeek: number; xpThisWeek: number }> {
  const { start, end } = getWeekBounds();

  const rows = await db
    .select({
      problemId: submissionsTable.problemId,
      xpEarned: submissionsTable.xpEarned,
    })
    .from(submissionsTable)
    .where(
      and(
        eq(submissionsTable.userId, userId),
        eq(submissionsTable.status, "Accepted"),
        gte(submissionsTable.submittedAt, start)
      )
    );

  const uniqueProblems = new Set(rows.map((r) => r.problemId));
  const xpThisWeek = rows.reduce((sum, r) => sum + (r.xpEarned || 0), 0);

  return { solvedThisWeek: uniqueProblems.size, xpThisWeek };
}
