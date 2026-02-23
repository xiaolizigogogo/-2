
/**
 * 风险控制后端服务接口
 * 连接 Python LangGraph 引擎与 FastGPT 模型
 */
export const startRiskDebate = async (caseInfo: string, lang: 'zh' | 'en' = 'zh') => {
  try {
    // 这里的 URL 指向通过 Vite 代理转发的后端接口
    const BACKEND_URL = '/api/analyze';
    
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        case_info: caseInfo,
        language: lang
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend Error: ${response.statusText}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Risk Engine Connection Failed:", error);
    // 降级处理：如果后端未启动，返回错误提示
    throw error;
  }
};
