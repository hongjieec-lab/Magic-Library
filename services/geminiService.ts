import { GoogleGenAI, Type } from "@google/genai";
import { Resource, RecommendationResult } from "../types";

export async function getRecommendations(query: string, currentDataset: Resource[]): Promise<RecommendationResult> {
  // 从 Vercel 环境变量读取，或者从 localStorage 读取用户手动输入的 Key
console.log("当前使用的 API Key 前10位:", apiKey ? apiKey.substring(0, 10) : "空");
  
  if (!apiKey || apiKey === "undefined" || apiKey === "null" || apiKey === "") {
    throw new Error("MISSING_API_KEY");
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const optimizedIndex = currentDataset.map(item => ({ 
    id: item.id, 
    title: item.title, 
    tags: item.categories,
    snippet: `${item.whyItsGood} | ${(item.description || '').substring(0, 100)}`
  }));
  
  const systemInstruction = `
    你是一个儿童图书与桌游检索专家。
    任务：根据用户需求，从给定的数据列表中选出最相关的项（最多返回 40 个 ID）。
    
    检索策略：
    1. 优先匹配标签(tags)中包含用户关键词的项目。
    2. 如果标签匹配数量不足，通过阅读片段(snippet)进行语义匹配补充。
    3. 按照相关度由高到低排序。
    
    必须严格返回 JSON。
    matches: ID 数组。
    aiSummary: 100字以内的专业推荐语。
    
    数据库：
    ${JSON.stringify(optimizedIndex)}
  `;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `用户正在寻找：${query}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            matches: { type: Type.ARRAY, items: { type: Type.STRING } },
            aiSummary: { type: Type.STRING }
          },
          required: ["matches", "aiSummary"]
        }
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("EMPTY_RESPONSE");
    
    return JSON.parse(text.trim()) as RecommendationResult;
  } catch (error: any) {
    console.error("Gemini Search Error:", error);
    
    if (error.status === 401 || error.status === 403) {
      throw new Error("INVALID_API_KEY");
    }
    
    return {
      matches: [],
      aiSummary: "魔法感应暂时波动，请检查您的 API 密钥设置或网络连接。"
    };
  }
}
