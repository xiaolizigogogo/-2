
import { AgentRole, LoanApplication, HistoricalCase } from './types';

export const I18N = {
  zh: {
    pending: "待审抵押件",
    history: "抵押历史",
    calibration: "判例校准",
    import: "导入抵押卷宗",
    sync: "估值模型同步",
    verdict: "风控决议",
    tools: "抵押审计工具",
    authorize: "核准授信",
    deny: "拒绝准入",
    riskLevel: "风险等级",
    safety: "授信信心指数",
    limit: "建议授信额度",
    summary: "风控综合评价",
    evidence: "风险证据链",
    report: "生成抵押审计报告 (PDF)",
    precedent: "相似抵押案例",
    search: "搜索借款人/房产地址...",
    thinking: "专家思维直播间",
    status: "模型状态",
    income: "还款来源(月)",
    debt: "存量债务(月)",
    dti: "负债收入比 (DSR)",
    valuation: "AI 房产实时估值",
    Low: "低风险",
    Medium: "中风险",
    High: "高风险",
    Critical: "极高风险/禁止准入",
    stages: {
      DATA_PROCESSING: "产证/流水解析",
      ASSET_SCAN: "抵押物初评",
      BUSINESS_AUDIT: "还款能力审计",
      DEBATE: "专家交叉辩论",
      FINAL_VERDICT: "定性判决"
    }
  },
  en: {
    pending: "Pending Mortgages",
    history: "Mortgage History",
    calibration: "Case Calibration",
    import: "Import Dossier",
    sync: "Valuation Sync",
    verdict: "Verdict",
    tools: "Audit Tools",
    authorize: "Authorize",
    deny: "Deny",
    riskLevel: "Risk Level",
    safety: "Approval Confidence",
    limit: "Credit Limit",
    summary: "Risk Summary",
    evidence: "Evidence Chain",
    report: "Generate Audit Report (PDF)",
    precedent: "Historical Precedent",
    search: "Search by address/name...",
    thinking: "Expert Deliberation",
    status: "Engine Status",
    income: "Repayment Flow",
    debt: "Existing Debt",
    dti: "DSR Ratio",
    valuation: "AI Property Valuation",
    Low: "Low",
    Medium: "Medium",
    High: "High",
    Critical: "Critical",
    stages: {
      DATA_PROCESSING: "Doc Parsing",
      ASSET_SCAN: "Collateral Scan",
      BUSINESS_AUDIT: "Ability Audit",
      DEBATE: "Cross Debate",
      FINAL_VERDICT: "Verdict"
    }
  }
};

export const AGENT_CONFIGS = {
  [AgentRole.ASSET]: {
    name: { zh: '张巡查', en: 'Inspector Zhang' },
    color: 'bg-blue-100 text-blue-800',
    icon: '🏠'
  },
  [AgentRole.BUSINESS]: {
    name: { zh: '李审计', en: 'Auditor Li' },
    color: 'bg-emerald-100 text-emerald-800',
    icon: '📊'
  },
  [AgentRole.DTI]: {
    name: { zh: '王分析师', en: 'Analyst Wang' },
    color: 'bg-purple-100 text-purple-800',
    icon: '⚖️'
  },
  [AgentRole.FRAUD]: {
    name: { zh: '陈调查官', en: 'Investigator Chen' },
    color: 'bg-rose-100 text-rose-800',
    icon: '🔍'
  },
  [AgentRole.ARBITER]: {
    name: { zh: '风控总监', en: 'Chief Risk Officer' },
    color: 'bg-amber-100 text-amber-800',
    icon: '🏛️'
  }
};

export const SAMPLE_CASES: LoanApplication[] = [
  {
    id: 'MTG-2025-001',
    applicant: '林海苑 1502 室抵押贷款',
    amount: 4500000,
    purpose: '小微企业流动性经营贷 (抵押人: 张先生 - 经营异常风险件)',
    status: 'PENDING'
  },
  {
    id: 'MTG-2025-002',
    applicant: '盛世外滩中心 C 座办公抵押',
    amount: 15000000,
    purpose: '商业房产二次抵押 (抵押率 LTV > 80% 高危件)',
    status: 'PENDING'
  },
  {
    id: 'MTG-2025-003',
    applicant: '锦绣申江 A 栋 704 室经营贷',
    amount: 2800000,
    purpose: '个人经营性抵押 (LTV 40% - 优质低扣件)',
    status: 'PENDING'
  },
  {
    id: 'MTG-2025-004',
    applicant: '华润置地广场 3 号铺抵押贷',
    amount: 5500000,
    purpose: '小微企业经营贷 (租金收入覆盖比 1.5x - 现金流强劲件)',
    status: 'PENDING'
  }
];

export const HISTORICAL_CASES: HistoricalCase[] = [
  {
    id: 'HIST-MTG-099',
    applicant: '御景新城个人住房抵押',
    amount: 3200000,
    purpose: '装修消费贷款',
    status: 'COMPLETED',
    riskLevel: 'Low',
    outcome: 'APPROVED',
    date: '2024-12-05'
  }
];
