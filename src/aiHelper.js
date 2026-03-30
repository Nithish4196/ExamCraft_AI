import { HfInference } from "@huggingface/inference";

export const executeAI = async (systemPrompt, userPrompt) => {
  const apiKey = import.meta.env.VITE_HF_API_KEY;
  if (!apiKey) throw new Error("Missing VITE_HF_API_KEY in .env");

  const hf = new HfInference(apiKey);
  
  const modelsToTry = [
    "Qwen/Qwen2.5-72B-Instruct",
    "mistralai/Mixtral-8x7B-Instruct-v0.1",
    "microsoft/Phi-3-mini-4k-instruct",
    "HuggingFaceH4/zephyr-7b-beta",
    "mistralai/Mistral-7B-Instruct-v0.2"
  ];

  let lastError = null;

  for (const model of modelsToTry) {
    try {
      console.log(`Sending AI request to: ${model}...`);
      
      const response = await hf.chatCompletion({
        model: model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_tokens: 1500, // accommodate longer answers
        temperature: 0.3,
      });

      if (response && response.choices && response.choices[0].message) {
        return response.choices[0].message.content.trim();
      }
    } catch (error) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
    }
  }

  if (lastError && lastError.message.includes("fetch")) {
    throw new Error("Network Error: Could not connect to Hugging Face APIs. Check your internet or API token permissions.");
  }
  
  throw new Error(`Failed after fallback attempts. Last error: ${lastError.message}`);
};

export const generateQuestions = async (text, numQuestions = 5) => {
  const sys = "You are an expert AI teacher. Extract core concepts and generate exam questions. Format as a numbered list. Only return the questions.";
  const usr = `Generate exactly ${numQuestions} questions based on this text:\n\n${text}`;
  return await executeAI(sys, usr);
};

export const generateAnswer = async (question, lines) => {
  const sys = `You are an expert tutor. Provide a clear, accurate, and comprehensive answer to the student's question.`;
  const usr = `Please answer this question: "${question}". \n\nThe answer MUST be exactly ${lines} sentences/lines long. Do not include introductory filler. Keep it well-structured.`;
  return await executeAI(sys, usr);
};

export const evaluateScript = async (questionContext, studentScript) => {
  const sys = "You are a highly analytical AI Examiner grading a student's answer sheet. You MUST provide exactly two quantitative metrics at the very top of your response: 'Marks (out of 10)' and 'Answer Accuracy (%)'. Then, provide constructive feedback with headings for 'Strengths' and 'Areas for Improvement'.";
  const usr = `Below is the original question/topic:\n"${questionContext}"\n\nHere is the student's submitted answer script text:\n"${studentScript}"\n\nPlease evaluate providing the Marks, Accuracy %, and constructive feedback.`;
  return await executeAI(sys, usr);
};
