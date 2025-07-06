"use client"
import PdfExtractor from "@/components/PDF_reader";
import { useState } from "react";
import { Button, Input } from "@/ui";
import {
  Trophy,
  Users,
  Search,
  Play,
  ArrowRight,
  FileText,
} from "lucide-react";
import Link from "next/link";
export default function PDF_reader( { onExtract }){
    return <div>
        <div className="hover:border-theme-purple/50 hover:bg-muted/50 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors">
                      <FileText className="text-muted-foreground mb-2 h-8 w-8" />
                      <p className="text-muted-foreground mb-2 font-medium">
                        Use your own notes
                      </p>
                      <PdfExtractor onExtract={onExtract}/>
                    </div>
    </div>

}