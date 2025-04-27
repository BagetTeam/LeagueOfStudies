import { Zap } from "lucide-react";
import { Question } from "@/types/types";

interface GameQuestionProps {
  question: Question;
  isAnswered: boolean;
  selectedOption: number | null;
  canAnswer: boolean;
  onAnswer: (index: number) => void;
}

export function GameQuestion({
  question,
  isAnswered,
  selectedOption,
  canAnswer,
  onAnswer,
}: GameQuestionProps) {
  return (
    <div className="game-card mb-8">
      <div className="mb-4 flex items-center gap-2">
        <Zap className="text-theme-blue h-5 w-5" />
        <h2 className="text-lg font-semibold">Boss Question:</h2>
      </div>

      <p className="mb-6 text-xl font-medium md:text-2xl">
        {question.question}
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {question.options.map((option, index) => (
          <button
            key={index}
            className={`rounded-xl border p-4 text-left transition ${
              isAnswered && selectedOption === index
                ? index === question.correctAnswer
                  ? "border-green-400 bg-green-100 text-green-800"
                  : "border-red-400 bg-red-100 text-red-800"
                : isAnswered && index === question.correctAnswer
                  ? "border-green-400 bg-green-100 text-green-800"
                  : "hover:bg-muted"
            }`}
            onClick={() => canAnswer && onAnswer(index)}
            disabled={!canAnswer}
          >
            <span className="mr-2 font-semibold">
              {String.fromCharCode(65 + index)}.
            </span>
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}
