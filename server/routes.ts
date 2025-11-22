import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { checkResultSchema, type CheckResultResponse } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
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

      const participants = await storage.getParticipants();
      if (!participants.includes(name)) {
        return res.status(404).json({ 
          message: "Nie ma Cię na liście uczestników." 
        });
      }

      let results = await storage.getDrawResults();
      
      if (results.length === 0) {
        results = await storage.performDraw();
      }

      const userResult = results.find(r => r.drew === name);
      
      if (!userResult) {
        return res.status(500).json({ 
          message: "Draw result not found for user" 
        });
      }

      const response: CheckResultResponse = {
        drawsFor: userResult.drawsFor,
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
