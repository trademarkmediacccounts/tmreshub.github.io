import { pgTable, text, uuid, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectResourcesTable = pgTable("project_resources", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default("Equipment"),
  quantity: integer("quantity").notNull().default(1),
  status: text("status").notNull().default("Needed"),
  assignedTo: text("assigned_to"),
  supplier: text("supplier"),
  cost: numeric("cost").notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProjectResourceSchema = createInsertSchema(projectResourcesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProjectResource = z.infer<typeof insertProjectResourceSchema>;
export type ProjectResource = typeof projectResourcesTable.$inferSelect;
