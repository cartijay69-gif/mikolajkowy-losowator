import { db } from "./db";
import { 
  participants, 
  events, 
  drawResults, 
  exclusionRules,
  type Participant,
  type Event,
  type DrawResult as DBDrawResult,
  type InsertParticipant,
  type InsertEvent,
  type InsertDrawResult,
  type ExclusionRule
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Participants
  getParticipants(): Promise<Participant[]>;
  getParticipantByName(name: string): Promise<Participant | undefined>;
  addParticipant(participant: InsertParticipant): Promise<Participant>;
  deleteParticipant(id: number): Promise<void>;
  
  // Events
  getActiveEvent(): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Draw Results
  getDrawResultsForEvent(eventId: number): Promise<Array<DBDrawResult & { participant: Participant; drawsFor: Participant }>>;
  getDrawResultForParticipant(eventId: number, participantId: number): Promise<DBDrawResult | undefined>;
  setDrawResults(eventId: number, results: InsertDrawResult[]): Promise<void>;
  clearDrawResults(eventId: number): Promise<void>;
  performDraw(eventId: number): Promise<void>;
  
  // Exclusion Rules
  getExclusionRules(): Promise<ExclusionRule[]>;
  addExclusionRule(rule: { participant1Id: number; participant2Id: number; reason?: string }): Promise<ExclusionRule>;
  deleteExclusionRule(id: number): Promise<void>;
  
  // Initialization
  seedInitialData(): Promise<void>;
}

export class DbStorage implements IStorage {
  // Participants
  async getParticipants(): Promise<Participant[]> {
    return await db.select().from(participants);
  }

  async getParticipantByName(name: string): Promise<Participant | undefined> {
    const nameLower = name.toLowerCase();
    
    // Get all participants and check names and alternative names
    const allParticipants = await this.getParticipants();
    
    for (const participant of allParticipants) {
      if (participant.name.toLowerCase() === nameLower) {
        return participant;
      }
      
      // Check alternative names
      if (participant.alternativeNames && Array.isArray(participant.alternativeNames)) {
        for (const altName of participant.alternativeNames) {
          if (altName.toLowerCase() === nameLower) {
            return participant;
          }
        }
      }
    }
    
    return undefined;
  }

  async addParticipant(participant: InsertParticipant): Promise<Participant> {
    const result = await db.insert(participants).values(participant).returning();
    return result[0];
  }

  async deleteParticipant(id: number): Promise<void> {
    await db.delete(participants).where(eq(participants.id, id));
  }

  // Events
  async getActiveEvent(): Promise<Event | undefined> {
    const result = await db.select().from(events).where(eq(events.isActive, true)).limit(1);
    return result[0];
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    // Deactivate all other events first
    await db.update(events).set({ isActive: false });
    const result = await db.insert(events).values({ ...event, isActive: true }).returning();
    return result[0];
  }

  // Draw Results
  async getDrawResultsForEvent(eventId: number): Promise<Array<DBDrawResult & { participant: Participant; drawsFor: Participant }>> {
    const results = await db.query.drawResults.findMany({
      where: eq(drawResults.eventId, eventId),
      with: {
        participant: true,
        drawsFor: true,
      },
    });
    return results as Array<DBDrawResult & { participant: Participant; drawsFor: Participant }>;
  }

  async getDrawResultForParticipant(eventId: number, participantId: number): Promise<DBDrawResult | undefined> {
    const result = await db.select().from(drawResults)
      .where(and(
        eq(drawResults.eventId, eventId),
        eq(drawResults.participantId, participantId)
      ))
      .limit(1);
    return result[0];
  }

  async setDrawResults(eventId: number, results: InsertDrawResult[]): Promise<void> {
    if (results.length > 0) {
      await db.insert(drawResults).values(results);
    }
  }

  async clearDrawResults(eventId: number): Promise<void> {
    await db.delete(drawResults).where(eq(drawResults.eventId, eventId));
  }

  async performDraw(eventId: number): Promise<void> {
    const allParticipants = await this.getParticipants();
    const exclusions = await this.getExclusionRules();
    
    if (allParticipants.length < 2) {
      throw new Error("Need at least 2 participants to perform draw");
    }

    // Build exclusion map for faster lookup
    const exclusionMap = new Map<number, Set<number>>();
    for (const rule of exclusions) {
      if (!exclusionMap.has(rule.participant1Id)) {
        exclusionMap.set(rule.participant1Id, new Set());
      }
      if (!exclusionMap.has(rule.participant2Id)) {
        exclusionMap.set(rule.participant2Id, new Set());
      }
      exclusionMap.get(rule.participant1Id)!.add(rule.participant2Id);
      exclusionMap.get(rule.participant2Id)!.add(rule.participant1Id);
    }

    let attempts = 0;
    const maxAttempts = 1000;
    let validAssignment: number[] | null = null;

    // Shuffle and retry until we find a valid assignment
    while (attempts < maxAttempts) {
      const indices: number[] = [];
      for (let i = 0; i < allParticipants.length; i++) {
        indices.push(i);
      }
      const shuffled = this.shuffleArray(indices);
      
      if (this.isValidAssignment(shuffled, exclusionMap)) {
        validAssignment = shuffled;
        break;
      }
      
      attempts++;
    }

    if (!validAssignment) {
      throw new Error("Could not find valid draw after maximum attempts. Check exclusion rules.");
    }

    // Create draw results
    const results: InsertDrawResult[] = allParticipants.map((participant, index) => ({
      eventId,
      participantId: participant.id,
      drawsForId: allParticipants[validAssignment![index]].id,
    }));

    await this.setDrawResults(eventId, results);
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private isValidAssignment(assignment: number[], exclusionMap: Map<number, Set<number>>): boolean {
    // Check if anyone drew themselves
    for (let i = 0; i < assignment.length; i++) {
      if (i === assignment[i]) {
        return false;
      }
    }

    // Check exclusion rules
    for (let i = 0; i < assignment.length; i++) {
      const excludedIds = exclusionMap.get(i);
      if (excludedIds && excludedIds.has(assignment[i])) {
        return false;
      }
    }

    return true;
  }

  // Exclusion Rules
  async getExclusionRules(): Promise<ExclusionRule[]> {
    return await db.select().from(exclusionRules);
  }

  async addExclusionRule(rule: { participant1Id: number; participant2Id: number; reason?: string }): Promise<ExclusionRule> {
    const result = await db.insert(exclusionRules).values(rule).returning();
    return result[0];
  }

  async deleteExclusionRule(id: number): Promise<void> {
    await db.delete(exclusionRules).where(eq(exclusionRules.id, id));
  }

  // Initialization
  async seedInitialData(): Promise<void> {
    // Always reseed with latest participants
    const existingParticipants = await this.getParticipants();
    
    // If we have different number of participants, clear and reseed
    const expectedCount = 9;
    if (existingParticipants.length === expectedCount) {
      return; // Already seeded with correct participants
    }

    // Clear existing data - must clear draw results first due to FK constraints
    if (existingParticipants.length > 0) {
      // Clear all draw results first
      const activeEvent = await this.getActiveEvent();
      if (activeEvent) {
        await this.clearDrawResults(activeEvent.id);
      }
      
      // Then clear participants (but not from DB directly due to FK)
      // Instead, recreate them by clearing the table at DB level
      await db.delete(drawResults);
      await db.delete(participants);
    }

    // Seed initial participants with alternative names
    const initialParticipants = [
      { name: "Janek", alternativeNames: ["Jan", "Janusz"], email: null },
      { name: "Zosia", alternativeNames: ["Zofia", "Zuzanna"], email: null },
      { name: "Filip", alternativeNames: ["Piotr", "Fili"], email: null },
      { name: "Kasia", alternativeNames: ["Katarzyna", "Katarzyna"], email: null },
      { name: "Marysia", alternativeNames: ["Maria", "Marta"], email: null },
      { name: "Szymek", alternativeNames: ["Szymon", "Szymonek"], email: null },
      { name: "Kuba", alternativeNames: ["Jakub", "Kuба"], email: null },
      { name: "Asia", alternativeNames: ["Małgorzata", "Joanna"], email: null },
      { name: "Beata", alternativeNames: ["Bea", "Beatrice"], email: null },
    ];

    for (const p of initialParticipants) {
      await this.addParticipant(p as InsertParticipant);
    }

    // Create or update initial event for current year
    const currentYear = new Date().getFullYear();
    const existingEvent = await this.getActiveEvent();
    
    if (!existingEvent) {
      await this.createEvent({
        name: `Mikołajki ${currentYear}`,
        year: currentYear,
        isActive: true,
      });
    }
  }
}

export const storage = new DbStorage();
