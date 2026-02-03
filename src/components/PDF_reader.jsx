"use client";

import { useState, useRef, forwardRef, useImperativeHandle } from "react";
import { ArrowRight } from "lucide-react";
import pdfToText from "react-pdftotext";
import { Button } from "@/ui";

const PdfExtractor = forwardRef(function PdfExtractor(
  { onExtract, file },
  ref
) {
  const [fileName, setFileName] = useState(null);
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    click: () => inputRef.current?.click(),
  }));

  function extractText(event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;
    setFileName(selectedFile.name);
    if (file) {
      onExtract(selectedFile);
    } else {
      pdfToText(selectedFile)
        .then((text) => onExtract(text))
        .catch((error) =>
          console.error("Failed to extract text from pdf", error),
        );
    }
  }

  function handleClick(e) {
    e.stopPropagation();
    inputRef.current?.click();
  }

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="file"
        id="material pdf"
        ref={inputRef}
        className="absolute inset-0 z-10 cursor-pointer opacity-0"
        accept=".pdf"
        onChange={extractText}
        onClick={(e) => e.stopPropagation()}
      />
      <Button
        variant="normal"
        onClick={handleClick}
        className="flex w-full cursor-pointer items-center justify-between gap-2 text-xs sm:text-sm md:text-base"
      >
        <span className="min-w-0 truncate no-underline">
          {fileName ?? "Choose file"}
        </span>
        <ArrowRight className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
});

export default PdfExtractor;
