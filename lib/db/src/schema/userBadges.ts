import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const userBadgesTable = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  badgeSlug: text("badge_slug").notNull(),
  earnedAt: timestamp("earned_at").notNull().defaultNow(),
});

export type UserBadge = typeof userBadgesTable.$inferSelect;
