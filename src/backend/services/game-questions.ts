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

  console.log("✅ Received questions:", data.questions.length);
  return data.questions;
}
