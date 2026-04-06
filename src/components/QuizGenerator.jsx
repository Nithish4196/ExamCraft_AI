import React, { useState } from "react";
import { generateQuiz } from "../aiHelper";
import { BrainCircuit, Sparkles, AlertCircle } from "lucide-react";

export default function QuizGenerator() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quiz, setQuiz] = useState("");
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!topic.trim()) return setError("Please provide a topic.");
    try {
      setLoadingAi(true);
      setError("");
      setQuiz("");
      const result = await generateQuiz(topic, numQuestions);
      setQuiz(result);
    } catch (err) {
      setError(err.message || "Failed to generate quiz.");
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="tool-container fade-in">
      <div className="tool-header">
        <h2><BrainCircuit className="text-purple" /> Topic Quiz Generation</h2>
        <p>Instantly generate a multiple-choice quiz on any specific topic.</p>
      </div>

      {error && <div className="alert-error"><AlertCircle size={18}/> {error}</div>}

      <div className="glass-panel main-panel">
        <div className="mb-4">
          <label className="input-label">Enter Topic:</label>
          <input 
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Photosynthesis, React Hooks, World War II"
            className="premium-input mb-4"
          />
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

        <button className="btn-primary" onClick={handleGenerate} disabled={loadingAi || !topic}>
          {loadingAi ? "Generating Quiz..." : <><Sparkles size={18}/> Generate {numQuestions} Questions</>}
        </button>
      </div>

      {quiz && (
        <div className="result-panel slide-up">
          <h3>Generated Quiz:</h3>
          <pre className="premium-pre">{quiz}</pre>
        </div>
      )}
    </div>
  );
}
