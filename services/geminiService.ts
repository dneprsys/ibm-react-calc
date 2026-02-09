import { GoogleGenAI } from "@google/genai";

// Initialize Gemini API
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Analyzes G-Code using the high-reasoning Gemini 3 Pro model.
 * Uses thinkingBudget to ensure deep analysis of potential crashes or inefficiencies.
 */
export const analyzeGCode = async (code: string, machineModel: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert CNC programmer for ${machineModel} machines (Fanuc control). 
      Analyze the following G-code block deeply.
      
      Focus on:
      1. **Safety & Collisions**: Identify any dangerous rapid moves (G00) near the workpiece, missing safety lines (G28/G50), or incorrect tool change positions.
      2. **Tooling & Feeds/Speeds**: Check if the S (speed) and F (feed) values are appropriate for standard steels (e.g., 1045 or 304 Stainless). Flag if they seem too aggressive or too conservative.
      3. **Fanuc Syntax**: specific syntax errors for ${machineModel} controllers.
      4. **Logic**: Check for missing M-codes (M03, M05, M08, M09) or potential infinite loops.

      Provide a structured report with:
      - **Critical Issues** (Must Fix)
      - **Warnings** (Check on machine)
      - **Summary** of operation.

      G-Code:
      \`\`\`gcode
      ${code}
      \`\`\`
      
      Format your response in Markdown.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });

    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return `Analysis failed: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * Optimizes G-Code focusing on cycle time, speed, and tool wear.
 */
export const optimizeGCode = async (code: string, machineModel: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing. Please check your configuration.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `You are an expert CNC programmer for ${machineModel} machines.
      Analyze the uploaded G-code specifically for optimization.

      Tasks:
      1. **Cycle Time Reduction**: Identify air cuts, redundant G00 moves, or inefficient tool paths.
      2. **Feed & Speed Optimization**: Suggest specific RPM (S) and Feed (F) adjustments to maximize material removal rate (MRR) without sacrificing tool life. Assume standard Carbide tooling on Steel.
      3. **Tool Wear**: Suggest entry/exit strategies (e.g., arc in/out) to reduce tool shock.

      Output:
      - A list of **Specific Improvements**.
      - A **Revised G-Code Block** for the optimized section (if applicable).

      G-Code:
      \`\`\`gcode
      ${code}
      \`\`\`
      
      Format response in Markdown.`,
      config: {
        thinkingConfig: { thinkingBudget: 32768 },
      }
    });

    return response.text || "No optimization suggestions generated.";
  } catch (error) {
    console.error("Gemini Optimization Error:", error);
    return `Optimization failed: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};

/**
 * General chat helper for CNC questions using a faster model.
 */
export const askAssistant = async (question: string): Promise<string> => {
  if (!apiKey) {
    return "API Key is missing.";
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Faster model for chat
      contents: question,
      config: {
        systemInstruction: "You are IBM Calc Pro AI, a specialized assistant for CNC manufacturing. Be concise and technical.",
      }
    });
    return response.text || "No response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I couldn't process that request right now.";
  }
};