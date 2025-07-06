
"use client"

import { useState } from 'react';
import {
  Trophy,
  Users,
  Search,
  Play,
  ArrowRight,
  FileText,
} from "lucide-react";
import pdfToText from 'react-pdftotext'
import { Button, Input } from "@/ui";

function PdfExtractor({onExtract}) {
  
  const [fileContent, setFileContent] = useState()
  
  function extractText (event) {
    const selectedFile =  event.target.files[0]
    
    pdfToText(selectedFile)
            .then((text)=> onExtract(text))
            .catch(error => console.error("Failed to extract text from pdf",error))
    }


  
  return (
    
    <div>
      <Button variant="normal" className="gap-2">
        <input type = "file" id = "material pdf" accept = ".pdf,.txt" onChange = {extractText}/>
        <ArrowRight className="h-4 w-4" />
      </Button>
      
    </div>
  )
}


export default PdfExtractor;