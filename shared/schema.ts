import { pgTable, serial, varchar, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Events table - track multiple Secret Santa events over time
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  year: integer("year").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Participants table
export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  alternativeNames: varchar("alternative_names", { length: 255 }).array().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Draw results table - who drew whom for each event
export const drawResults = pgTable("draw_results", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull().references(() => events.id),
  participantId: integer("participant_id").notNull().references(() => participants.id),
  drawsForId: integer("draws_for_id").notNull().references(() => participants.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Exclusion rules - pairs who shouldn't draw each other (e.g., couples)
export const exclusionRules = pgTable("exclusion_rules", {
  id: serial("id").primaryKey(),
  participant1Id: integer("participant1_id").notNull().references(() => participants.id),
  participant2Id: integer("participant2_id").notNull().references(() => participants.id),
  reason: varchar("reason", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const eventsRelations = relations(events, ({ many }) => ({
  drawResults: many(drawResults),
}));

export const participantsRelations = relations(participants, ({ many }) => ({
  drawResults: many(drawResults),
  drawsFor: many(drawResults),
  exclusionRules1: many(exclusionRules),
  exclusionRules2: many(exclusionRules),
}));

export const drawResultsRelations = relations(drawResults, ({ one }) => ({
  event: one(events, {
    fields: [drawResults.eventId],
    references: [events.id],
  }),
  participant: one(participants, {
    fields: [drawResults.participantId],
    references: [participants.id],
  }),
  drawsFor: one(participants, {
    fields: [drawResults.drawsForId],
    references: [participants.id],
  }),
}));

export const exclusionRulesRelations = relations(exclusionRules, ({ one }) => ({
  participant1: one(participants, {
    fields: [exclusionRules.participant1Id],
    references: [participants.id],
  }),
  participant2: one(participants, {
    fields: [exclusionRules.participant2Id],
    references: [participants.id],
  }),
}));

// Insert schemas
export const insertEventSchema = createInsertSchema(events).omit({ 
  id: true, 
  createdAt: true 
});

export const insertParticipantSchema = createInsertSchema(participants).omit({ 
  id: true, 
  createdAt: true 
});

export const insertDrawResultSchema = createInsertSchema(drawResults).omit({ 
  id: true, 
  createdAt: true 
});

export const insertExclusionRuleSchema = createInsertSchema(exclusionRules).omit({ 
  id: true, 
  createdAt: true 
});

// Types
export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Participant = typeof participants.$inferSelect;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;

export type DrawResult = typeof drawResults.$inferSelect;
export type InsertDrawResult = z.infer<typeof insertDrawResultSchema>;

export type ExclusionRule = typeof exclusionRules.$inferSelect;
export type InsertExclusionRule = z.infer<typeof insertExclusionRuleSchema>;

// Legacy schemas for backward compatibility
export const checkResultSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type CheckResult = z.infer<typeof checkResultSchema>;

export interface CheckResultResponse {
  drawsFor: string;
}
