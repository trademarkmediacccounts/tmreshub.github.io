import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const showFixturesTable = pgTable("show_fixtures", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  manufacturer: text("manufacturer").notNull(),
  model: text("model").notNull(),
  mode: text("mode"),
  dmxFootprint: integer("dmx_footprint"),
  beamAngle: text("beam_angle"),
  colorTemp: text("color_temp"),
  power: text("power"),
  weight: text("weight"),
  gdtfManufacturer: text("gdtf_manufacturer"),
  gdtfName: text("gdtf_name"),
  gdtfRuid: text("gdtf_ruid"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertShowFixtureSchema = createInsertSchema(showFixturesTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertShowFixture = z.infer<typeof insertShowFixtureSchema>;
export type ShowFixture = typeof showFixturesTable.$inferSelect;
