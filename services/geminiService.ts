
import { GoogleGenAI } from "@google/genai";

// Initialize the GoogleGenAI client using the environment variable API_KEY directly.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * High-reasoning analysis for complex CNC tasks
 */
export const complexQuery = async (prompt: string, context?: any): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Context: ${JSON.stringify(context)}\n\nQuery: ${prompt}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: "Вы — старший технический эксперт IBM Calc Pro. Используйте глубокие рассуждения для решения сложных задач в области производства, инженерии и логики. Будьте предельно точны. Отвечайте на языке пользователя (преимущественно на русском)."
      }
    });
    return response.text || "Ответ не сгенерирован.";
  } catch (error) {
    console.error("Gemini Pro Thinking Error:", error);
    return `Анализ не удался: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`;
  }
};

export const analyzeGCode = async (code: string, machineModel: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Проанализируйте этот G-код для ${machineModel}, уделяя особое внимание безопасности и оптимизации на высоком уровне:\n\n${code}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return response.text || "Анализ пуст.";
  } catch (error) {
    return "Ошибка при анализе G-кода.";
  }
};

export const optimizeGCode = async (code: string, machineModel: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Выполните глубокую оптимизацию этого G-кода для ${machineModel}. Ищите способы сокращения времени цикла и улучшения срока службы инструмента:\n\n${code}`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });
    return response.text || "Оптимизация пуста.";
  } catch (error) {
    return "Ошибка при оптимизации G-кода.";
  }
};

export const askAssistant = async (question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: question,
      config: {
        systemInstruction: "Вы — ИИ-ассистент IBM Calc Pro. Будьте кратки и полезны. Отвечайте на русском языке.",
      }
    });
    return response.text || "Нет ответа.";
  } catch (error) {
    return "Ассистент недоступен.";
  }
};
