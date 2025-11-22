import { z } from "zod";

export const participantSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export const drawResultSchema = z.object({
  drew: z.string(),
  drawsFor: z.string(),
});

export const checkResultSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

export type Participant = z.infer<typeof participantSchema>;
export type DrawResult = z.infer<typeof drawResultSchema>;
export type CheckResult = z.infer<typeof checkResultSchema>;

export interface DrawData {
  participants: string[];
  results: DrawResult[];
}

export interface CheckResultResponse {
  drawsFor: string;
}
