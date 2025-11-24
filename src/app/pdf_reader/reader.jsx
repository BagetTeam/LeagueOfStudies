"use client";
import { FileText } from "lucide-react";
import { useRef } from "react";
import PdfExtractor from "@/components/PDF_reader";

export default function PDF_reader({ file, onExtract }) {
  const clickRef = useRef(null);
  function myClick() {
    clickRef.current.click();
  }
  return (
    <div onClick={myClick}>
      <div className="hover:border-theme-purple/50 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors hover:cursor-pointer">
        <FileText className="text-muted-foreground mb-2 h-8 w-8" />
        <p className="text-muted-foreground mb-2 font-medium">
          Use your own notes
        </p>
        <PdfExtractor ref={clickRef} file={file} onExtract={onExtract} />
      </div>
    </div>
  );
}
