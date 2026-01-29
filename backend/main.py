
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os

# 导入完善后的智能体逻辑
from engine.graph import run_risk_workflow

app = FastAPI(title="SmartRisk LangGraph Backend")

# 允许前端跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalysisRequest(BaseModel):
    case_info: str
    language: str = "zh"

@app.post("/api/analyze")
async def analyze_case(request: AnalysisRequest):
    try:
        # 调用真实的 LangGraph 工作流
        result = await run_risk_workflow(request.case_info, request.language)
        return result
    except Exception as e:
        print(f"Error in analyze_case: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    # 建议使用环境变量存储 API KEY
    # export FASTGPT_API_KEY=your_key
    # export FASTGPT_BASE_URL=your_url
    uvicorn.run(app, host="0.0.0.0", port=8000)
