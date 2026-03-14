import { pgTable, serial, text, integer, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(1),
  starRank: integer("star_rank").notNull().default(1),
  solvedCount: integer("solved_count").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastSolvedDate: date("last_solved_date"),
  dailyQuestsCompleted: integer("daily_quests_completed").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({
  id: true,
  xp: true,
  level: true,
  starRank: true,
  solvedCount: true,
  streak: true,
  lastSolvedDate: true,
  dailyQuestsCompleted: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
