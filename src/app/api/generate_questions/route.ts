// import { NextRequest, NextResponse } from "next/server";
// import "dotenv/config";
// import { GoogleGenerativeAI } from "@google/generative-ai";
 
 
// export async function POST(req: NextRequest) {
//     const key = process.env.GEMINI;
//     console.log(key);
//   try {
//     const body = await req.json();
//     const ai = new GoogleGenerativeAI(key!);
//     const model = ai.getGenerativeModel({ model: "gemini-2.0-flash" });

//     const text = body.text; // Read incoming JSON
//     async function GenerateQuestions(text: string) {
   
        

//         const result = await model.generateContent({
//         contents: [{ role: "user", parts: [{ text: `Generate in a dictionary form 10 study questions with their expected answers according to this study material:\n\n${text}` }] }]
//         });

//         const generatedText = result.response.candidates?.[0]?.content?.parts?.[0]?.text || "";
//         return generatedText;
//     }
    
//     console.log("Received text:", text);

//     const questions = GenerateQuestions(text);

//     return NextResponse.json({ message: "Text received successfully!" }, { status: 200 });
//   } catch (error) {
//     console.error("Error:", error);
//     return NextResponse.json({ error: "Failed to handle request" }, { status: 500 });
//   }
// }
import { NextRequest, NextResponse } from "next/server";
import "dotenv/config";
import { GoogleGenAI } from "@google/genai"; // ✅ using genai now

export async function POST(req: NextRequest) {
  const key = "AIzaSyCoqzMkImnrURn76zyo9fY92o4SlUHtCAs";
  console.log("API KEY:", key);

  try {
    const body = await req.json();
    const text = body.text; // get study material from the client

     // ✅ GoogleGenAI from @google/genai
    
    const ai = new GoogleGenAI({ apiKey: key });

    console.log("Received text:", text);

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: `Generate in a nested list form 10 study questions with their expected answers according to this study material: ${text} DO NOT WRITE ANY OTHER TEXT. SIMPLY RETURN A NESTED LIST, INDEX 0 IS A QUESTION AND INDEX 1 IS THE ANSWER`,
      });
      console.log(response.text); // ✅ Specific to @google/genai
    

    return NextResponse.json({ message: "Questions generated!", questions: response.text }, { status: 200 });
  } catch (error: any) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Failed to handle request" }, { status: 500 });
  }
}

 
 
 
 
 
 
 