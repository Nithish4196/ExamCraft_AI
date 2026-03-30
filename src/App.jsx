import React, { useState } from "react";
import { Sparkles, FileQuestion, BookOpenCheck, LineChart, ArrowLeft } from "lucide-react";
import QuestionGenerator from "./components/QuestionGenerator";
import AnswerGenerator from "./components/AnswerGenerator";
import AnswerEvaluator from "./components/AnswerEvaluator";
import "./index.css";

export default function App() {
  const [currentView, setCurrentView] = useState("dashboard");

  const renderView = () => {
    switch (currentView) {
      case "question-gen":
        return <QuestionGenerator />;
      case "answer-gen":
        return <AnswerGenerator />;
      case "evaluator":
        return <AnswerEvaluator />;
      default:
        return (
          <div className="dashboard">
            <header className="dash-header">
              <h1><Sparkles className="icon-main" /> EXAMCRAFT AI</h1>
              <p>Your Ultimate Assessment & Evaluation Platform</p>
            </header>

            <div className="card-grid">
              <button className="dash-card" onClick={() => setCurrentView("question-gen")}>
                <div className="card-icon"><FileQuestion size={40} /></div>
                <h3>Generate Questions</h3>
                <p>Upload syllabus or notes to automatically generate exam questions.</p>
              </button>

              <button className="dash-card" onClick={() => setCurrentView("answer-gen")}>
                <div className="card-icon"><BookOpenCheck size={40} /></div>
                <h3>Answer Generation</h3>
                <p>Provide questions to get detailed answers formatted to your required length.</p>
              </button>

              <button className="dash-card" onClick={() => setCurrentView("evaluator")}>
                <div className="card-icon"><LineChart size={40} /></div>
                <h3>Evaluate Answer Script</h3>
                <p>Upload student scripts and auto-grade them using AI analysis.</p>
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="app-container">
      {/* Dynamic Background */}
      <div className="bg-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>

      <nav className="navbar">
        <div className="nav-brand" onClick={() => setCurrentView("dashboard")} style={{cursor: "pointer"}}>
          <Sparkles size={24} color="#8b5cf6" />
          <span>ExamCraft AI</span>
        </div>
        {currentView !== "dashboard" && (
          <button className="back-btn" onClick={() => setCurrentView("dashboard")}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>
        )}
      </nav>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
}