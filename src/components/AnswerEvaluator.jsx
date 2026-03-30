import React, { useState } from "react";
import { extractTextFromPDF } from "../pdfHelper";
import { evaluateScript } from "../aiHelper";
import { LineChart, UploadCloud, CheckCircle2, AlertCircle, FileText } from "lucide-react";

export default function AnswerEvaluator() {
  const [questionText, setQuestionText] = useState("");
  const [scriptText, setScriptText] = useState("");
  const [loadingPdfQuestion, setLoadingPdfQuestion] = useState(false);
  const [loadingPdfScript, setLoadingPdfScript] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [evaluation, setEvaluation] = useState("");
  const [error, setError] = useState("");

  const handleQuestionUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        setLoadingPdfQuestion(true);
        setError("");
        const text = await extractTextFromPDF(file);
        setQuestionText(text.slice(0, 8000)); 
      } catch (err) {
        setError("Failed to parse Question Paper PDF.");
      } finally {
        setLoadingPdfQuestion(false);
      }
    }
  };

  const handleScriptUpload = async (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      try {
        setLoadingPdfScript(true);
        setError("");
        const text = await extractTextFromPDF(file);
        if(!text.trim()) {
           setError("No text detected. If this is a handwritten image PDF, it requires OCR which is not natively supported by the browser.");
           return;
        }
        setScriptText(text.slice(0, 10000)); 
      } catch (err) {
        setError("Failed to parse Script PDF.");
      } finally {
        setLoadingPdfScript(false);
      }
    }
  };

  const handleEvaluate = async () => {
    if (!questionText.trim() || !scriptText.trim()) {
      return setError("Please provide the original question and upload the student's script.");
    }
    try {
      setLoadingAi(true);
      setError("");
      setEvaluation("");
      const result = await evaluateScript(questionText, scriptText);
      setEvaluation(result);
    } catch (err) {
      setError(err.message || "Failed to evaluate.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="tool-container fade-in">
      <div className="tool-header">
        <h2><LineChart className="text-blue" /> Evaluate Answer Script</h2>
        <p>AI-powered grading. Upload a script and let the AI evaluate correctness and assign a score.</p>
      </div>

      {error && <div className="alert-error"><AlertCircle size={18}/> {error}</div>}

      <div className="glass-panel main-panel">
        
        {/* Question Input Section */}
        <div style={{ marginBottom: "30px", padding: "20px", background: "rgba(59, 130, 246, 0.05)", borderRadius: "12px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <label className="input-label" style={{ margin: 0 }}>Step 1: Provided Question Context</label>
            <div>
              <input type="file" id="q-upload" accept=".pdf" onChange={handleQuestionUpload} className="hidden-input"/>
              <label htmlFor="q-upload" style={{ cursor: "pointer", display: "flex", gap: "5px", alignItems: "center", fontSize: "14px", color: "var(--blue)" }}>
                <FileText size={16} /> {loadingPdfQuestion ? "Extracting..." : "Upload Question Paper PDF instead"}
              </label>
            </div>
          </div>
          <textarea 
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="Type the question or upload the question paper above..."
            rows={3}
            className="premium-textarea"
          />
        </div>

        {/* Script Input Section (Hidden Text) */}
        <label className="input-label">Step 2: Upload Student Script (PDF):</label>
        <div className="upload-zone mb-4">
          <input type="file" id="eval-script" accept=".pdf" onChange={handleScriptUpload} className="hidden-input"/>
          <label htmlFor="eval-script" className="upload-label">
            <UploadCloud size={40} className="text-blue" />
            <span>{loadingPdfScript ? "Extracting Script Text..." : "Upload Handwritten/Typed Student Answer PDF"}</span>
          </label>
        </div>

        {scriptText && (
          <div className="mb-4">
            <div className="alert-error" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: 'rgba(16, 185, 129, 0.4)', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={18}/> Student Script successfully processed in background! Ready for evaluation.
            </div>
          </div>
        )}

        <button 
          className="btn-primary btn-blue" 
          onClick={handleEvaluate} 
          disabled={loadingAi || loadingPdfQuestion || loadingPdfScript || !questionText || !scriptText}
        >
          {loadingAi ? "Analyzing Script..." : "Evaluate Student Script"}
        </button>
      </div>

      {evaluation && (
        <div className="result-panel slide-up" style={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}>
          <h3 className="text-blue">AI Evaluation Report:</h3>
          <div className="evaluation-box" dangerouslySetInnerHTML={{__html: evaluation.replace(/\n/g, '<br/>')}} />
        </div>
      )}
    </div>
  );
}
