import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkResultSchema, type CheckResultResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Seed initial data on startup
  await storage.seedInitialData();

  // Get all participants
  app.get("/api/participants", async (req, res) => {
    try {
      const participants = await storage.getParticipants();
      const names = participants.map(p => p.name).sort();
      res.json(names);
    } catch (error) {
      console.error("Error in /api/participants:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  app.post("/api/check-result", async (req, res) => {
    try {
      const validation = checkResultSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          message: "Invalid request data",
          errors: validation.error.errors 
        });
      }

      const { name } = validation.data;

      // Get active event
      const activeEvent = await storage.getActiveEvent();
      if (!activeEvent) {
        return res.status(500).json({ 
          message: "No active event found" 
        });
      }

      // Check if participant exists
      const participant = await storage.getParticipantByName(name);
      if (!participant) {
        return res.status(404).json({ 
          message: "Nie ma Cię na liście uczestników." 
        });
      }

      // Check if draw has been performed for this event
      let results = await storage.getDrawResultsForEvent(activeEvent.id);
      
      if (results.length === 0) {
        // Perform the draw
        await storage.performDraw(activeEvent.id);
        results = await storage.getDrawResultsForEvent(activeEvent.id);
      }

      // Find user's result
      const userResult = results.find(r => r.participantId === participant.id);
      
      if (!userResult) {
        return res.status(500).json({ 
          message: "Draw result not found for user" 
        });
      }

      const response: CheckResultResponse = {
        drawsFor: userResult.drawsFor.name,
      };

      res.json(response);
    } catch (error) {
      console.error("Error in /api/check-result:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Internal server error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
