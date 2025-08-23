import { NextRequest, NextResponse } from "next/server";
import "dotenv/config";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { QuestionSchema } from "@/types/types";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }); // TODO get api key to work

// !!! Not used as of now -> Refer to /backend/services/game-questions.ts
export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate 10 questions about this study material: ${topic}. For each question, find the correct answer, then come up with 3 other potential answer that the player might think of. There should be 4 options to choose from where 1 of them is the correct answer. Return the index of the answer among the array of options.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            required: ["question", "options", "correctAnswer", "id"],
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "Question contentt",
                nullable: false,
              },
              options: {
                type: Type.ARRAY,
                description: "List of answer options",
                nullable: false,
                items: {
                  type: Type.STRING,
                  description: "option",
                  nullable: false,
                },
              },
              correctAnswer: {
                type: Type.NUMBER,
                description:
                  "The index of the correct answer in the answer options array",
                nullable: false,
              },
              id: {
                type: Type.NUMBER,
                description: "Id of the question",
                nullable: false,
              },
            },
          },
        },
      },
    });
    const ret = z
      .array(QuestionSchema)
      .parse(JSON.parse(response.text ?? "[]"));

    const questions = ret.map((r, i) => ({ ...r, id: i }));
    return NextResponse.json(
      { message: "Questions generated!", questions: questions },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: "Failed to handle request" },
      { status: 500 },
    );
  }
}
