import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const scriptBreakdownsTable = pgTable("script_breakdowns", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  elementType: text("element_type").notNull().default("Props"),
  name: text("name").notNull(),
  description: text("description"),
  sceneReference: text("scene_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertScriptBreakdownSchema = createInsertSchema(scriptBreakdownsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertScriptBreakdown = z.infer<typeof insertScriptBreakdownSchema>;
export type ScriptBreakdown = typeof scriptBreakdownsTable.$inferSelect;
