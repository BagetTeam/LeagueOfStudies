import { ai } from "@/app/api/generate_questions/route";
import { Type } from "@google/genai";
import { z } from "zod";
import { QuestionSchema, QuestionType } from "@/types/types";

export async function getQuestions(text: string): Promise<QuestionType[]> {
  const response = await fetch("/api/generate_questions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data.questions;
}
