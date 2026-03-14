import { pgTable, serial, integer, text, real, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { problemsTable } from "./problems";

export const submissionsTable = pgTable("submissions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  problemId: integer("problem_id").notNull().references(() => problemsTable.id, { onDelete: "cascade" }),
  language: text("language").notNull(), // python, javascript
  code: text("code").notNull(),
  status: text("status").notNull(), // Accepted, Wrong Answer, Time Limit Exceeded, Runtime Error, Compilation Error
  passedCount: integer("passed_count").notNull().default(0),
  totalCount: integer("total_count").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  runtime: real("runtime"),
  results: jsonb("results").$type<Array<{
    passed: boolean;
    input: string;
    expectedOutput: string;
    actualOutput?: string;
    error?: string;
    time?: number;
  }>>().notNull().default([]),
  submittedAt: timestamp("submitted_at").notNull().defaultNow(),
});

export const insertSubmissionSchema = createInsertSchema(submissionsTable).omit({
  id: true,
  submittedAt: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissionsTable.$inferSelect;
