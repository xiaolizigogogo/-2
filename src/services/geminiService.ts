
import { GoogleGenAI, Type } from "@google/genai";
import { AgentRole, DebateTurn, RiskAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function startRiskDebate(caseInfo: string, lang: 'zh' | 'en' = 'zh') {
  const model = "gemini-3-flash-preview";

  const systemInstruction = `
    You are a high-end financial risk control engine named "Guardian".
    Your task is to analyze a loan application through a multi-agent debate simulation.
    
    Agents involved:
    1. Asset Specialist: Focuses on collateral value, liquidity, and market trends.
    2. Business Auditor: Focuses on the applicant's business health, cash flow, and industry risks.
    3. Financial Analyst (DTI): Focuses on Debt-to-Income ratio, repayment capacity, and leverage.
    4. Fraud Investigator: Focuses on identity verification, document authenticity, and suspicious patterns.
    5. Final Arbiter (Chief Risk Officer): Summarizes the debate and provides the final verdict.

    Output must be a JSON object containing:
    1. "debate": An array of 4-6 debate turns between these agents.
    2. "analysis": A structured risk analysis object.

    Language: ${lang === 'zh' ? 'Chinese' : 'English'}.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      debate: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            role: { type: Type.STRING, description: "The role of the agent (Asset Specialist, Business Auditor, Financial Analyst, Fraud Investigator, Final Arbiter)" },
            content: { type: Type.STRING, description: "The agent's argument or observation" },
            timestamp: { type: Type.STRING, description: "Current time in HH:mm:ss format" }
          },
          required: ["role", "content", "timestamp"]
        }
      },
      analysis: {
        type: Type.OBJECT,
        properties: {
          passProbability: { type: Type.NUMBER, description: "Probability of approval (0-1)" },
          creditLimit: { type: Type.NUMBER, description: "Suggested credit limit in local currency" },
          riskLevel: { type: Type.STRING, description: "Low, Medium, High, or Critical" },
          riskScores: {
            type: Type.OBJECT,
            properties: {
              asset: { type: Type.NUMBER },
              business: { type: Type.NUMBER },
              dti: { type: Type.NUMBER },
              fraud: { type: Type.NUMBER }
            }
          },
          summary: { type: Type.STRING },
          evidenceChain: { type: Type.ARRAY, items: { type: Type.STRING } },
          historicalMatch: {
            type: Type.OBJECT,
            properties: {
              caseId: { type: Type.STRING },
              similarity: { type: Type.NUMBER },
              outcome: { type: Type.STRING }
            }
          },
          memoryRetrieval: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Key knowledge or historical precedents retrieved from memory" }
        },
        required: ["passProbability", "creditLimit", "riskLevel", "riskScores", "summary", "evidenceChain", "memoryRetrieval"]
      }
    },
    required: ["debate", "analysis"]
  };

  try {
    const result = await ai.models.generateContent({
      model,
      contents: `Analyze this case: ${caseInfo}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema
      }
    });

    const data = JSON.parse(result.text || "{}");
    return data;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
