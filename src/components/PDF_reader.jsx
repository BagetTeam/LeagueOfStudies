"use client";

import { useState } from "react";
import {
  Trophy,
  Users,
  Search,
  Play,
  ArrowRight,
  FileText,
} from "lucide-react";
import pdfToText from "react-pdftotext";
import { Button, Input } from "@/ui";
import { useRef } from "react";

function PdfExtractor({ onExtract, ref, file }) {
  const [fileContent, setFileContent] = useState();

  const myref = useRef(null);
  function extractText(event) {
    const selectedFile = event.target.files[0];
    if (file) {
      onExtract(selectedFile);
      console.log(selectedFile);
    } else {
      pdfToText(selectedFile)
        .then((text) => onExtract(text))
        .catch((error) =>
          console.error("Failed to extract text from pdf", error),
        );
    }
  }

  function handleClick(e) {
    e.stopPropagation;
    myref.current.click();
  }

  return (
    <div onClick={handleClick} ref={ref} className="cursor-pointer">
      <Button
        variant="normal"
        className="cursor-pointer gap-1.5 text-xs sm:gap-2 sm:text-sm md:text-base"
      >
        <input
          className="cursor-pointer"
          type="file"
          id="material pdf"
          ref={myref}
          onClick={(e) => {
            e.stopPropagation();
          }}
          accept=".pdf"
          onChange={extractText}
        />
        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
      </Button>
    </div>
  );
}

export default PdfExtractor;
