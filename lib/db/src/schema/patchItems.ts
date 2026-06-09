import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const patchItemsTable = pgTable("patch_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  fixtureName: text("fixture_name").notNull(),
  manufacturer: text("manufacturer"),
  dmxUniverse: integer("dmx_universe").notNull().default(1),
  dmxAddress: integer("dmx_address").notNull().default(1),
  circuit: text("circuit"),
  dimmerNumber: text("dimmer_number"),
  gelColor: text("gel_color"),
  purpose: text("purpose"),
  position: text("position"),
  notes: text("notes"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPatchItemSchema = createInsertSchema(patchItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertPatchItem = z.infer<typeof insertPatchItemSchema>;
export type PatchItem = typeof patchItemsTable.$inferSelect;
