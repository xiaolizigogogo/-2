
from typing import Annotated, TypedDict, List, Union, Literal
from langgraph.graph import StateGraph, END
from .llm import FastGPTClient
import json
import datetime
import os

# 定义 Agent 状态，增加“反思次数”和“规划指令”
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

# --- 1. 规划节点 (The Planner) ---
async def planning_node(state: AgentState):
    """最前沿做法：在执行前先进行任务分解和重点标记"""
    prompt = f"分析此房产抵押案卷，指出该案件最核心的风险维度（资产、经营、负债、欺诈中的哪一个），并给后续专家下达审计指令：{state['case_info']}"
    plan = await llm.chat_completion(
        system_prompt="你是一名资深首席风险官，擅长案件预判。请给出简短的审计规划指令。",
        user_prompt=prompt
    )
    state['planning_instruction'] = plan
    state['history'].append({"role": "System Planner", "content": f"🎯 规划指令：{plan}", "timestamp": get_now()})
    return state

# --- 2. 专家节点 (Enhanced Expert with Planning) ---
async def expert_node_factory(role_key: str, state: AgentState):
    from .graph import ROLE_BRAINS, METHODOLOGIES
    brain = ROLE_BRAINS[role_key]
    method = METHODOLOGIES[role_key]
    
    system_instruction = f"""
    # 专家身份：{brain['name']}
    # 审计框架：{method['framework']}
    # 规划指令：{state['planning_instruction']}
    
    你必须在审计中优先响应‘规划指令’中的要求。如果这是第二次审计（Refinement），你必须针对之前的质疑进行反驳或修正。
    """
    
    user_prompt = f"案卷：{state['case_info']}\n上下文：{json.dumps(state['history'][-3:], ensure_ascii=False)}"
    content = await llm.chat_completion(system_prompt=system_instruction, user_prompt=user_prompt)
    
    state['history'].append({"role": brain['name'], "content": content, "timestamp": get_now()})
    return state

# --- 3. 动态反思节点 (The Critic/Arbiter) ---
async def arbiter_node(state: AgentState):
    """裁决并检查逻辑自洽性"""
    prompt = f"基于以下辩论，给出 JSON 报告。特别注意：检查专家意见是否有冲突。辩论：{json.dumps(state['history'], ensure_ascii=False)}"
    
    json_str = await llm.chat_completion(
        system_prompt="你不仅是裁决者，还是逻辑检查官。如果专家意见存在严重数据矛盾，请在回复中包含 'LOGIC_ERROR' 关键词。",
        user_prompt=prompt
    )
    
    # 模拟逻辑自洽性检查
    state['is_logical'] = "LOGIC_ERROR" not in json_str
    
    try:
        start_idx = json_str.find('{')
        end_idx = json_str.rfind('}') + 1
        state['analysis_result'] = json.loads(json_str[start_idx:end_idx])
    except:
        state['is_logical'] = False
        
    state['history'].append({"role": "Final Arbiter", "content": state['analysis_result'].get('summary', '逻辑评估中...'), "timestamp": get_now()})
    return state

# --- 4. 路由逻辑 (Conditional Edges) ---
def should_continue(state: AgentState) -> Literal["refine", "end"]:
    """前沿架构核心：根据逻辑自洽性和重试次数决定是否进入修正循环"""
    if not state['is_logical'] and state['refinement_count'] < 1:
        state['refinement_count'] += 1
        return "refine"
    return "end"

def create_risk_graph():
    workflow = StateGraph(AgentState)
    
    workflow.add_node("planner", planning_node)
    workflow.add_node("expert_debate", lambda s: expert_node_factory("FRAUD", s)) # 示例：此处可并行或串联多个专家
    workflow.add_node("arbiter", arbiter_node)
    
    workflow.set_entry_point("planner")
    workflow.add_edge("planner", "expert_debate")
    workflow.add_edge("expert_debate", "arbiter")
    
    # 动态路由：如果逻辑不自洽，回到专家节点重新辩论
    workflow.add_conditional_edges(
        "arbiter",
        should_continue,
        {
            "refine": "expert_debate",
            "end": END
        }
    )
    
    return workflow.compile()

# 保持其他辅助数据结构一致
METHODOLOGIES = {
    "ASSET": {"framework": "5C + LTV Stress Test", "rules": "Standard 2024"},
    "BUSINESS": {"framework": "Cashflow Audit", "rules": "Standard 2024"},
    "DTI": {"framework": "Debt Analysis", "rules": "Standard 2024"},
    "FRAUD": {"framework": "Anti-Fraud 2.0", "rules": "Red-line check"}
}
ROLE_BRAINS = {
    "ASSET": {"name": "Asset Specialist"},
    "BUSINESS": {"name": "Business Auditor"},
    "DTI": {"name": "Financial Analyst"},
    "FRAUD": {"name": "Fraud Investigator"},
    "ARBITER": {"name": "Final Arbiter"}
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
