import React, { useState } from "react";
import { extractTextFromPDF } from "../pdfHelper";
import { generateQuestions } from "../aiHelper";
import { FileText, UploadCloud, Sparkles, AlertCircle } from "lucide-react";

export default function QuestionGenerator() {
  const [inputType, setInputType] = useState("text");
  const [inputText, setInputText] = useState("");
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [questions, setQuestions] = useState("");
  const [error, setError] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        setLoadingPdf(true);
        setError("");
        setInputText("");
        const text = await extractTextFromPDF(file);
        setInputText(text.slice(0, 8000)); 
      } catch (err) {
        setError("Failed to parse PDF. Ensure it contains text.");
      } finally {
        setLoadingPdf(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim()) return setError("Please provide text or PDF.");
    try {
      setLoadingAi(true);
      setError("");
      setQuestions("");
      const result = await generateQuestions(inputText, numQuestions);
      setQuestions(result);
    } catch (err) {
      setError(err.message || "Failed to generate.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="tool-container fade-in">
      <div className="tool-header">
        <h2><FileText className="text-purple" /> Question Generation</h2>
        <p>Convert your syllabus or notes into exam-ready questions instantly.</p>
      </div>

      {error && <div className="alert-error"><AlertCircle size={18}/> {error}</div>}

      <div className="glass-panel main-panel">
        <div className="input-toggle">
          <label className={`toggle-btn ${inputType === 'text' ? 'active' : ''}`}>
            <input type="radio" value="text" checked={inputType==="text"} onChange={()=>setInputType("text")}/> Paste Text
          </label>
          <label className={`toggle-btn ${inputType === 'pdf' ? 'active' : ''}`}>
             <input type="radio" value="pdf" checked={inputType==="pdf"} onChange={()=>setInputType("pdf")}/> Upload PDF
          </label>
        </div>

        <div className="input-area">
          {inputType === "text" ? (
            <textarea 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your notes here..."
              rows={6}
              className="premium-textarea"
            />
          ) : (
             <div className="upload-zone">
                <input type="file" id="q-pdf" accept=".pdf" onChange={handleFileUpload} className="hidden-input"/>
                <label htmlFor="q-pdf" className="upload-label">
                  <UploadCloud size={40} className="text-purple" />
                  <span>{loadingPdf ? "Extracting Text..." : "Click to Upload Syllabus PDF"}</span>
                </label>
             </div>
          )}
        </div>

        <div className="mb-4">
          <label className="input-label">Number of Questions to Generate:</label>
          <input 
            type="number" 
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            min="1"
            max="50"
            className="premium-input mb-4"
          />
        </div>

        <button className="btn-primary" onClick={handleGenerate} disabled={loadingAi || loadingPdf || !inputText}>
          {loadingAi ? "Generating..." : <><Sparkles size={18}/> Generate {numQuestions} Questions</>}
        </button>
      </div>

      {questions && (
        <div className="result-panel slide-up">
          <h3>Generated Questions:</h3>
          <pre className="premium-pre">{questions}</pre>
        </div>
      )}
    </div>
  );
}