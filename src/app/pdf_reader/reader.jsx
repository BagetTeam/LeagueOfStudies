"use client";
import { FileText } from "lucide-react";
import { useRef } from "react";
import PdfExtractor from "@/components/PDF_reader";

export default function PDF_reader({ onExtract }) {
  const clickRef = useRef(null);
  function myClick() {
    console.log("Before click:", clickRef.current);
    clickRef.current.click();
  }
  return (
    <div onClick={myClick}>
      <div className="hover:border-theme-purple/50 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors hover:cursor-pointer">
        <FileText className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground mb-2 font-medium">
          Use your own notes
        </p>
        <PdfExtractor ref={clickRef} onExtract={onExtract} />
      </div>
    </div>
  );
}
