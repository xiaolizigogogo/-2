
import { GoogleGenAI, Type } from "@google/genai";
import { AgentRole } from "../types";

// 初始化 Gemini 客户端
const getAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const startRiskDebate = async (caseInfo: string, lang: 'zh' | 'en' = 'zh') => {
  const ai = getAiClient();
  
  const languageNote = lang === 'zh' 
    ? "必须使用中文进行推理和输出。输出格式必须为合法 JSON。" 
    : "Must use English for reasoning and output. Output format must be valid JSON.";

  // 定义系统指令：这里是“融会贯通”的核心逻辑
  const systemInstruction = `
    你是一个集成了“长效记忆检索”能力的房产抵押风控 Agent。
    你的任务是模拟 5 位专家对案件进行辩论。
    
    # 核心方法论注入：
    - 资产评估：执行 LTV (Loan to Value) 压力测试，关注抵押物在极端市场情况下的流动性。
    - 经营审计：执行 DSR (Debt Service Ratio) 测算，穿透审查第一还款来源。
    - 历史对标：参考历史类似案件的违约特征。

    # 输出规范：
    - 必须通过 debate 字段展示专家间的逻辑碰撞（如反欺诈专家挑战资产专家的估值）。
    - 最终 analysis 必须包含对风险的定性、定量评估。
    
    ${languageNote}
  `;

  try {
    // 调用 Gemini 3 Pro，启用 Thinking 模式以获得更深度的推理
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: `案卷详情：${caseInfo}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        // 为高级风控逻辑分配思维预算
        thinkingConfig: { thinkingBudget: 12000 },
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            debate: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  role: { type: Type.STRING, enum: Object.values(AgentRole) },
                  content: { type: Type.STRING },
                  timestamp: { type: Type.STRING }
                },
                required: ["role", "content", "timestamp"]
              }
            },
            analysis: {
              type: Type.OBJECT,
              properties: {
                passProbability: { type: Type.NUMBER },
                creditLimit: { type: Type.NUMBER },
                riskLevel: { type: Type.STRING, enum: ["Low", "Medium", "High", "Critical"] },
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
                memoryRetrieval: {
                  type: Type.ARRAY,
                  description: "从长效记忆库中检索到的相关风控条款或历史判例",
                  items: { type: Type.STRING }
                }
              },
              required: ["passProbability", "creditLimit", "riskLevel", "summary", "evidenceChain"]
            }
          }
        }
      },
    });

    // 按照最佳实践：直接使用 .text 属性
    const text = response.text;
    if (!text) throw new Error("Gemini 响应为空");
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API 调用异常:", error);
    throw error;
  }
};
