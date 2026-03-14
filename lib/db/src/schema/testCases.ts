import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { problemsTable } from "./problems";

export const testCasesTable = pgTable("test_cases", {
  id: serial("id").primaryKey(),
  problemId: integer("problem_id").notNull().references(() => problemsTable.id, { onDelete: "cascade" }),
  input: text("input").notNull(),
  expectedOutput: text("expected_output").notNull(),
  isHidden: boolean("is_hidden").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTestCaseSchema = createInsertSchema(testCasesTable).omit({
  id: true,
  createdAt: true,
});

export type InsertTestCase = z.infer<typeof insertTestCaseSchema>;
export type TestCase = typeof testCasesTable.$inferSelect;
