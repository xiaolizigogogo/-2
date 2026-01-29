
from typing import Annotated, TypedDict, List, Union, Literal
from langgraph.graph import StateGraph, END, START
from .llm import FastGPTClient
import json
import datetime
import os

# 定义 Agent 状态
class AgentState(TypedDict):
    case_info: str
    language: str
    history: List[dict]
    analysis_result: dict
    planning_instruction: str # 规划者下达的重点审计方向
    refinement_count: int      # 循环修正次数
    is_logical: bool           # 逻辑自洽检查位

llm = FastGPTClient(
    api_key=os.getenv("FASTGPT_API_KEY", "your-api-key"),
    base_url=os.getenv("FASTGPT_BASE_URL", "https://api.fastgpt.in/api/v1")
)

def get_now():
    return datetime.datetime.now().strftime("%H:%M:%S")

# --- 1. 规划节点 ---
async def planning_node(state: AgentState):
    prompt = f"分析此房产抵押案卷，指出该案件最核心的风险维度，并下达审计指令：{state['case_info']}"
    plan = await llm.chat_completion(
        system_prompt="你是一名资深首席风险官。请给出简短的审计规划指令。",
        user_prompt=prompt
    )
    state['planning_instruction'] = plan
    state['history'].append({"role": "System Planner", "content": f"🎯 规划指令：{plan}", "timestamp": get_now()})
    return state

# --- 2. 专家节点工厂 ---
async def expert_node_factory(role_key: str, state: AgentState):
    from .graph import ROLE_BRAINS, METHODOLOGIES
    brain = ROLE_BRAINS[role_key]
    method = METHODOLOGIES[role_key]
    
    system_instruction = f"""
    # 专家身份：{brain['name']}
    # 审计框架：{method['framework']}
    # 规划指令：{state['planning_instruction']}
    """
    
    user_prompt = f"案卷：{state['case_info']}\n历史记录：{json.dumps(state['history'][-2:], ensure_ascii=False)}"
    content = await llm.chat_completion(system_prompt=system_instruction, user_prompt=user_prompt)
    
    state['history'].append({"role": brain['name'], "content": content, "timestamp": get_now()})
    return state

# --- 3. 裁决节点 ---
async def arbiter_node(state: AgentState):
    prompt = f"基于以下辩论生成 JSON 报告。辩论：{json.dumps(state['history'], ensure_ascii=False)}"
    
    json_str = await llm.chat_completion(
        system_prompt="输出必须是纯 JSON 格式，包含 passProbability, creditLimit, riskLevel, riskScores, summary, evidenceChain 字段。",
        user_prompt=prompt
    )
    
    state['is_logical'] = "LOGIC_ERROR" not in json_str
    
    try:
        start_idx = json_str.find('{')
        end_idx = json_str.rfind('}') + 1
        state['analysis_result'] = json.loads(json_str[start_idx:end_idx])
    except:
        state['analysis_result'] = {"summary": "数据解析异常", "riskLevel": "High"}
        
    state['history'].append({"role": "Final Arbiter", "content": state['analysis_result'].get('summary', '审计完成'), "timestamp": get_now()})
    return state

# --- 4. 路由逻辑 ---
def should_continue(state: AgentState) -> Literal["refine", "end"]:
    if not state['is_logical'] and state['refinement_count'] < 1:
        state.update({"refinement_count": state['refinement_count'] + 1})
        return "refine"
    return "end"

def create_risk_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("planner", planning_node)
    workflow.add_node("expert_debate", lambda s: expert_node_factory("FRAUD", s))
    workflow.add_node("arbiter", arbiter_node)
    
    # 新版语法：使用 START 节点
    workflow.add_edge(START, "planner")
    workflow.add_edge("planner", "expert_debate")
    workflow.add_edge("expert_debate", "arbiter")
    
    workflow.add_conditional_edges(
        "arbiter",
        should_continue,
        {
            "refine": "expert_debate",
            "end": END
        }
    )
    
    return workflow.compile()

METHODOLOGIES = {
    "ASSET": {"framework": "LTV Stress Test"},
    "BUSINESS": {"framework": "Cashflow Audit"},
    "DTI": {"framework": "Debt Analysis"},
    "FRAUD": {"framework": "Anti-Fraud 2.0"}
}
ROLE_BRAINS = {
    "ASSET": {"name": "Asset Specialist"},
    "BUSINESS": {"name": "Business Auditor"},
    "DTI": {"name": "Financial Analyst"},
    "FRAUD": {"name": "Fraud Investigator"}
}

async def run_risk_workflow(case_info: str, lang: str):
    graph = create_risk_graph()
    initial_state = {
        "case_info": case_info, "language": lang, "history": [], 
        "analysis_result": {}, "planning_instruction": "", 
        "refinement_count": 0, "is_logical": True
    }
    final_state = await graph.ainvoke(initial_state)
    return {"debate": final_state["history"], "analysis": final_state["analysis_result"]}
