import QuestionGenerator from "../components/QuestionGenerator";
import AnswerKey from "../components/AnswerKey";
import Evaluation from "../components/Evaluation";

export default function Home() {
  return (
    <div>
      <h1>ExamCraft AI</h1>
      <QuestionGenerator />
      <AnswerKey />
      <Evaluation />
    </div>
  );
}