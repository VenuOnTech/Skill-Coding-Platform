import { pgTable, serial, text, integer, real, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const problemsTable = pgTable("problems", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  difficulty: text("difficulty").notNull(), // Easy, Medium, Hard
  topic: text("topic").notNull(),
  tags: jsonb("tags").$type<string[]>().notNull().default([]),
  description: text("description").notNull(),
  constraints: text("constraints"),
  examples: jsonb("examples").$type<Array<{ input: string; output: string; explanation?: string }>>().notNull().default([]),
  starterCodePython: text("starter_code_python").notNull(),
  starterCodeJavascript: text("starter_code_javascript").notNull(),
  acceptanceRate: real("acceptance_rate"),
  solvedCount: integer("solved_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertProblemSchema = createInsertSchema(problemsTable).omit({
  id: true,
  solvedCount: true,
  createdAt: true,
});

export type InsertProblem = z.infer<typeof insertProblemSchema>;
export type Problem = typeof problemsTable.$inferSelect;
