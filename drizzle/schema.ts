import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// TODO: Add your tables here

export const leads = mysqlTable("leads", {
  id: int("id").autoincrement().primaryKey(),
  projectType: varchar("projectType", { length: 128 }).notNull(),
  projectNature: varchar("projectNature", { length: 64 }).notNull(),
  surface: varchar("surface", { length: 64 }),
  budget: varchar("budget", { length: 64 }),
  supplyScope: varchar("supplyScope", { length: 128 }),
  timeline: varchar("timeline", { length: 64 }),
  location: varchar("location", { length: 128 }),
  details: text("details"),
  mediaSummary: text("mediaSummary"),
  contactName: varchar("contactName", { length: 128 }),
  contactPhone: varchar("contactPhone", { length: 64 }).notNull(),
  contactEmail: varchar("contactEmail", { length: 320 }).notNull(),
  selectedSlot: varchar("selectedSlot", { length: 128 }),
  status: varchar("status", { length: 32 }).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
