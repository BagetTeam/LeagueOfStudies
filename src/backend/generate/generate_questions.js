import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const key = process.env.GEMINI;
console.log(key);
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import fs from "fs";

async function readFile(filepath) {
  const dataBuffer = fs.readFileSync(filepath);
  const extractedText = await pdf(dataBuffer);
  return extractedText.text;
}

const ai = new GoogleGenAI({ apiKey: key });

async function GenerateQuestions(filepath) {
  const file = filepath;
  const summary = await readFile(file);
  console.log(summary);
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: `Generate in a dictionary form 10 study questions with their expected answers according to this study material cellular biology`,
  });
  console.log(response.text);
}
GenerateQuestions(
  "/public/Chapter_1_-_Scientific_Method_Units_and_Density.pdf",
);
