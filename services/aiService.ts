import { Severity } from "../types";

export interface AIResult {
  severity_final: Severity;
  severity_model: Severity;
  severity_rule: Severity;
  confidence: number;
  reasoning: string;
}

export const analyzeDisasterImage = async (
  image: string,
  affectedPopulation: number,
  floodDays: number
): Promise<AIResult> => {
  const response = await fetch("http://127.0.0.1:5000/api/ai/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image,
      affectedPopulation,
      floodDays,
    }),
  });

  if (!response.ok) {
    throw new Error("AI analysis failed");
  }

  return response.json();
};
