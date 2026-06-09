import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const buildProjectsTable = pgTable("build_projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  url: text("url"),
  status: text("status").notNull().default("Draft"),
  lastDeploy: text("last_deploy"),
  feedback: integer("feedback").notNull().default(0),
  branch: text("branch").notNull().default("main"),
  progress: integer("progress").notNull().default(0),
  userId: text("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertBuildProjectSchema = createInsertSchema(buildProjectsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertBuildProject = z.infer<typeof insertBuildProjectSchema>;
export type BuildProject = typeof buildProjectsTable.$inferSelect;
