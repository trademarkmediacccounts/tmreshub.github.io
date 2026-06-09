import { pgTable, text, uuid, timestamp, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const callSheetsTable = pgTable("call_sheets", {
  id: uuid("id").defaultRandom().primaryKey(),
  projectId: uuid("project_id").notNull().references(() => projectsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  shootDate: date("shoot_date", { mode: "string" }).notNull(),
  callTime: text("call_time").notNull().default("06:00"),
  location: text("location"),
  weatherNotes: text("weather_notes"),
  generalNotes: text("general_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const callSheetEntriesTable = pgTable("call_sheet_entries", {
  id: uuid("id").defaultRandom().primaryKey(),
  callSheetId: uuid("call_sheet_id").notNull().references(() => callSheetsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull(),
  personName: text("person_name").notNull(),
  role: text("role").notNull(),
  callTime: text("call_time").notNull().default("06:00"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCallSheetSchema = createInsertSchema(callSheetsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCallSheet = z.infer<typeof insertCallSheetSchema>;
export type CallSheet = typeof callSheetsTable.$inferSelect;

export const insertCallSheetEntrySchema = createInsertSchema(callSheetEntriesTable).omit({ id: true, createdAt: true });
export type InsertCallSheetEntry = z.infer<typeof insertCallSheetEntrySchema>;
export type CallSheetEntry = typeof callSheetEntriesTable.$inferSelect;
