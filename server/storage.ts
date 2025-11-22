import type { DrawResult, DrawData } from "@shared/schema";

export interface IStorage {
  getParticipants(): Promise<string[]>;
  getDrawResults(): Promise<DrawResult[]>;
  setDrawResults(results: DrawResult[]): Promise<void>;
  performDraw(): Promise<DrawResult[]>;
}

export class MemStorage implements IStorage {
  private data: DrawData;

  constructor() {
    this.data = {
      participants: ["Anna", "Marek", "Kasia", "Piotr", "Zofia"],
      results: [],
    };
  }

  async getParticipants(): Promise<string[]> {
    return [...this.data.participants];
  }

  async getDrawResults(): Promise<DrawResult[]> {
    return [...this.data.results];
  }

  async setDrawResults(results: DrawResult[]): Promise<void> {
    this.data.results = results;
  }

  async performDraw(): Promise<DrawResult[]> {
    const participants = await this.getParticipants();
    
    if (participants.length < 2) {
      throw new Error("Need at least 2 participants to perform draw");
    }

    let shuffled: string[];
    let attempts = 0;
    const maxAttempts = 1000;

    do {
      shuffled = this.shuffleArray([...participants]);
      attempts++;
      
      if (attempts > maxAttempts) {
        throw new Error("Could not find valid draw after maximum attempts");
      }
    } while (this.hasPersonDrawnThemselves(participants, shuffled));

    const results: DrawResult[] = participants.map((person, index) => ({
      drew: person,
      drawsFor: shuffled[index],
    }));

    await this.setDrawResults(results);
    return results;
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private hasPersonDrawnThemselves(original: string[], shuffled: string[]): boolean {
    for (let i = 0; i < original.length; i++) {
      if (original[i] === shuffled[i]) {
        return true;
      }
    }
    return false;
  }
}

export const storage = new MemStorage();
