import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const stagingEnvironmentsTable = pgTable("staging_environments", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  environment: text("environment").notNull().default("staging"),
  url: text("url"),
  branch: text("branch").notNull().default("main"),
  status: text("status").notNull().default("Draft"),
  notes: text("notes"),
  lastDeploy: timestamp("last_deploy", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertStagingEnvironmentSchema = createInsertSchema(stagingEnvironmentsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertStagingEnvironment = z.infer<typeof insertStagingEnvironmentSchema>;
export type StagingEnvironment = typeof stagingEnvironmentsTable.$inferSelect;
