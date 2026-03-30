import React, { useState } from "react";
import { generateAnswer } from "../aiHelper";
import { extractTextFromPDF } from "../pdfHelper";
import { BookOpenCheck, Sparkles, AlertCircle, UploadCloud } from "lucide-react";

export default function AnswerGenerator() {
  const [inputType, setInputType] = useState("text"); // 'text' or 'pdf'
  const [questionText, setQuestionText] = useState("");
  const [lines, setLines] = useState(5);
  const [loadingAi, setLoadingAi] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState(false);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        setLoadingPdf(true);
        setError("");
        setQuestionText("");
        const text = await extractTextFromPDF(file);
        setQuestionText(text.slice(0, 8000));
      } catch (err) {
        setError("Failed to parse Question Paper PDF.");
      } finally {
        setLoadingPdf(false);
      }
    }
  };

  const handleGenerate = async () => {
    if (!questionText.trim()) return setError("Please provide a question.");
    try {
      setLoadingAi(true);
      setError("");
      setAnswer("");
      const result = await generateAnswer(questionText, lines);
      setAnswer(result);
    } catch (err) {
      setError(err.message || "Failed to generate.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="tool-container fade-in">
      <div className="tool-header">
        <h2><BookOpenCheck className="text-pink" /> Answer Generation</h2>
        <p>Get precise, structured answers to any exam question based on required length.</p>
      </div>

      {error && <div className="alert-error"><AlertCircle size={18}/> {error}</div>}

      <div className="glass-panel main-panel">
        <div className="input-toggle">
          <label className={`toggle-btn ${inputType === 'text' ? 'active' : ''}`}>
            <input type="radio" value="text" checked={inputType==="text"} onChange={()=>setInputType("text")}/> Type Question
          </label>
          <label className={`toggle-btn ${inputType === 'pdf' ? 'active' : ''}`}>
             <input type="radio" value="pdf" checked={inputType==="pdf"} onChange={()=>setInputType("pdf")}/> Upload Question Paper
          </label>
        </div>

        {inputType === "text" ? (
          <div>
            <label className="input-label">Enter Exam Question:</label>
            <textarea 
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g., Explain the process of photosynthesis..."
              rows={4}
              className="premium-textarea mb-4"
            />
          </div>
        ) : (
          <div className="mb-4">
            <label className="input-label">Upload Question Paper PDF:</label>
            <div className="upload-zone mb-4">
              <input type="file" id="q-pdf-input" accept=".pdf" onChange={handleFileUpload} className="hidden-input"/>
              <label htmlFor="q-pdf-input" className="upload-label">
                <UploadCloud size={30} className="text-pink" />
                <span>{loadingPdf ? "Extracting Questions..." : "Click to Upload Question PDF"}</span>
              </label>
            </div>
            {questionText && (
               <textarea 
               value={questionText}
               onChange={(e) => setQuestionText(e.target.value)}
               rows={3}
               className="premium-textarea mb-4"
               placeholder="Extracted questions will appear here (You can edit them)"
             />
            )}
          </div>
        )}

        <label className="input-label">Required length (number of lines / sentences):</label>
        <input 
          type="number" 
          value={lines}
          onChange={(e) => setLines(e.target.value)}
          min="1"
          max="50"
          className="premium-input mb-4"
        />

        <button className="btn-primary btn-pink" onClick={handleGenerate} disabled={loadingAi || loadingPdf || !questionText}>
          {loadingAi ? "Writing Answer..." : <><Sparkles size={18}/> Generate Answer</>}
        </button>
      </div>

      {answer && (
        <div className="result-panel slide-up">
          <h3>Generated Answer:</h3>
          <pre className="premium-pre">{answer}</pre>
        </div>
      )}
    </div>
  );
}
