import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const shotsTable = pgTable("shots", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  shotNumber: text("shot_number").notNull(),
  description: text("description"),
  shotType: text("shot_type").notNull().default("Wide"),
  angle: text("angle"),
  lens: text("lens"),
  movement: text("movement"),
  locationNotes: text("location_notes"),
  storyboardUrl: text("storyboard_url"),
  sortOrder: integer("sort_order").notNull().default(0),
  status: text("status").notNull().default("Todo"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertShotSchema = createInsertSchema(shotsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShot = z.infer<typeof insertShotSchema>;
export type Shot = typeof shotsTable.$inferSelect;
