import pdfToText from "react-pdftotext";

function extractText(event) {
  const file = event.target.files[0];
  pdfToText(file)
    .then((text) => console.log(text))
    .catch(() => console.error("Failed to extract text from pdf"));
}

function PDFParserReact() {
  return (
    <div className="App">
      <header className="App-header">
        <input type="file" accept="application/pdf" onChange={extractText} />
      </header>
    </div>
  );
}
export default PDFParserReact;
