"use client";

import { useState } from "react";

type QA = {
  question: string;
  answer: string;
};

export default function StudyPage() {
  const [studyText, setStudyText] = useState<string>("");
  const [questions, setQuestions] = useState<QA[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setStudyText(e.target.value);
  };

  const handleSubmit = async () => {
    if (!studyText.trim()) {
      alert("Please enter your study material first!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/generate_questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: studyText }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Raw API Response:", data);

      let cleaned = data.questions; // Adjust according to your API response field

      // Remove ```python ... ``` if present
      if (cleaned.startsWith("```python")) {
        cleaned = cleaned.replace("```python", "").trim();
      }
      if (cleaned.startsWith("```")) {
        cleaned = cleaned.substring(3).trim();
      }
      if (cleaned.endsWith("```")) {
        cleaned = cleaned.slice(0, -3).trim();
      }

      try {
        const parsed = JSON.parse(cleaned);
        console.log("Parsed cleaned data:", parsed);

        if (Array.isArray(parsed)) {
          const formatted: QA[] = parsed.map(([q, a]: [string, string]) => ({
            question: q,
            answer: a,
          }));

          setQuestions(formatted);
          console.log("-=-=-=-=-=-=-- Generated Questions -=-=-=-=-=-=-=-");
        } else {
          console.error("Parsed data is not an array:", parsed);
          alert("Could not parse questions properly.");
        }
      } catch (error) {
        console.error("Failed to parse cleaned text:", error);
        alert("Invalid JSON format received.");
      }
    } catch (error) {
      console.error("Error during submit:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-start bg-gray-100 p-8">
      <h1 className="mb-8 text-4xl font-bold">Study Question Generator</h1>

      <textarea
        value={studyText}
        onChange={handleChange}
        placeholder="Write your study material here..."
        className="h-56 w-full max-w-3xl resize-none rounded-lg border border-gray-300 p-4 text-gray-800 focus:ring-2 focus:ring-blue-400 focus:outline-none"
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
      >
        {loading ? "Generating..." : "Submit"}
      </button>

      {/* Display questions */}
      {questions.length > 0 && (
        <div className="mt-10 grid w-full max-w-5xl grid-cols-1 gap-6">
          {questions.map((qa, idx) => (
            <div
              key={idx}
              className="rounded-lg bg-white p-6 shadow-md transition hover:shadow-lg"
            >
              <h2 className="mb-2 text-xl font-bold">{qa.question}</h2>
              <p className="text-gray-700">{qa.answer}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
