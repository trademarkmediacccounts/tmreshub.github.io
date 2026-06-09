import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gearItemsTable = pgTable("gear_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  status: text("status").notNull().default("Available"),
  location: text("location"),
  lastUsed: text("last_used"),
  condition: text("condition").notNull().default("Good"),
  reservedFor: text("reserved_for"),
  userId: text("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertGearItemSchema = createInsertSchema(gearItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertGearItem = z.infer<typeof insertGearItemSchema>;
export type GearItem = typeof gearItemsTable.$inferSelect;
