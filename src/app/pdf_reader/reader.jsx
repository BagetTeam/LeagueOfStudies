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
      <div className="hover:border-theme-purple/50 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 transition-colors hover:cursor-pointer sm:p-6 md:p-8">
        <FileText className="text-muted-foreground mb-1.5 h-6 w-6 sm:mb-2 sm:h-7 sm:w-7 md:h-8 md:w-8" />
        <p className="text-muted-foreground mb-1.5 text-sm font-medium sm:mb-2 sm:text-base">
          Use your own notes
        </p>
        <PdfExtractor ref={clickRef} file={file} onExtract={onExtract} />
      </div>
    </div>
  );
}
