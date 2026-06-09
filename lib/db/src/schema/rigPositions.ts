import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const rigPositionsTable = pgTable("rig_positions", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  positionType: text("position_type").notNull().default("Truss"),
  xPos: integer("x_pos").notNull().default(0),
  yPos: integer("y_pos").notNull().default(0),
  widthPx: integer("width_px").notNull().default(200),
  heightPx: integer("height_px").notNull().default(8),
  color: text("color").notNull().default("#333333"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertRigPositionSchema = createInsertSchema(rigPositionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertRigPosition = z.infer<typeof insertRigPositionSchema>;
export type RigPosition = typeof rigPositionsTable.$inferSelect;
