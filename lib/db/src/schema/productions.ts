import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const productionsTable = pgTable("productions", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  date: text("date").notNull(),
  location: text("location").notNull(),
  crew: integer("crew").notNull().default(0),
  status: text("status").notNull().default("Prep"),
  userId: text("user_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertProductionSchema = createInsertSchema(productionsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertProduction = z.infer<typeof insertProductionSchema>;
export type Production = typeof productionsTable.$inferSelect;
