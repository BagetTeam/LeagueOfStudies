import { NextRequest, NextResponse } from "next/server";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

export const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// !!! Not used as of now -> Refer to /backend/services/game-questions.ts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text = body.text; // get study material from the client

    console.log("Received text:", text);

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Generate in a nested list form 10 study questions with 4 multiple answer choices expected answers according to this study material: ${text} DO NOT WRITE ANY OTHER TEXT. SIMPLY RETURN A NESTED LIST, INDEX 0 IS A QUESTION AND INDEX 1 ARE THE NUMBERED ANSWERS CHOICES`,
    });

    return NextResponse.json(
      { message: "Questions generated!", questions: response.text },
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
