"use server";

import { Database, Tables } from "@/database.types";
import { createClient } from "@supabase/supabase-js";
import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import { QuestionSchema, QuestionType } from "@/types/types";

const supabase = createClient<Database>(process.env.URL!, process.env.ANONKEY!);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getUser(
  email: string,
  name: string,
): Promise<Tables<"users"> | null> {
  let res = await supabase.from("users").select("*").eq("email", email);

  if (res.data === null) {
    return null;
  }
  console.log("data", res.data);

  if (!res.count || res.count === 0) {
    await supabase.from("users").insert({ name, email });

    res = await supabase.from("users").select("*").eq("email", email);

    if (res.data === null) {
      return null;
    }
  }

  return res.data[0] satisfies Tables<"users">;
}

export async function getUserStats(
  email: string,
): Promise<Tables<"stats"> | null> {
  let res = await supabase.from("stats").select("*").eq("email", email);

  if (res.data === null) {
    return null;
  }

  if (!res.count || res.count === 0) {
    await supabase.from("stats").insert({ email });

    res = await supabase.from("stats").select("*").eq("email", email);

    if (res.data === null) {
      return null;
    }
  }

  return res.data[0] satisfies Tables<"stats">;
}

export async function getRecentGames(email: string): Promise<Tables<"game">[]> {
  const res = await supabase.from("game").select("*").eq("email", email);

  return (res.data ?? []) satisfies Tables<"game">[];
}

export async function getQuestions(text: string): Promise<QuestionType[]> {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Generate 10 questions about this study material: ${text}. For each question, find the correct answer, then come up with 3 other potential answer that the player might think of. There should be 4 options to choose from where 1 of them is the correct answer. Return the index of the answer among the array of options.`,
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

  const ret = z.array(QuestionSchema).parse(JSON.parse(response.text ?? "[]"));

  return ret.map((r, i) => {
    return {
      ...r,
      id: i,
    };
  });
}

export async function updateLeaderboard(email: string, xp: number) {
  try {
    const { data: currentStats, error: fetchError } = await supabase
      .from("stats")
      .select("totalXp")
      .eq("email", email)
      .single();

    if (fetchError) {
      if (fetchError.code === "PGRST116") {
        // Supabase code for 'Not Found'
        console.warn(
          `No stats row found for ${email}. Cannot update XP directly.`,
        );
      } else {
        console.error(`Error fetching user stats for ${email}:`, fetchError);
        throw fetchError;
      }
      return;
    }

    // Make sure playing xp doesn't go negative
    const currentXp = currentStats?.totalXp ?? 0;
    const newXp = Math.max(0, currentXp + xp);

    console.log(`Updating XP for ${email}: ${currentXp} -> ${newXp}`);

    const { error: updateError } = await supabase
      .from("stats")
      .update({ totalXp: newXp })
      .eq("email", email);

    if (updateError) {
      console.error(`Error updating user XP for ${email}:`, updateError);
      throw updateError;
    }

    console.log(`Successfully updated XP for ${email} to ${newXp}`);
  } catch (error) {
    console.error("Failed to update user XP:", error);
  }
}
