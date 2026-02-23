
import React, { useState } from 'react';
import { 
  Zap, 
  Search, 
  FileText, 
  ShieldCheck, 
  TrendingUp, 
  Clock,
  Home,
  BarChart3,
  Scale,
  SearchCode,
  LayoutDashboard,
  History,
  ChevronRight,
  Loader2,
  Download,
  BrainCircuit,
  Database,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  ResponsiveContainer 
} from 'recharts';
import { AgentRole, LoanApplication, RiskAnalysis, DebateTurn } from './types';
import { I18N, AGENT_CONFIGS, SAMPLE_CASES, HISTORICAL_CASES } from './constants';
import { startRiskDebate } from './services/riskService';

const App: React.FC = () => {
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [selectedCase, setSelectedCase] = useState<LoanApplication | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [debateLog, setDebateLog] = useState<DebateTurn[]>([]);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const t = I18N[lang];

  const handleAnalyze = async (caseInfo: LoanApplication) => {
    setSelectedCase(caseInfo);
    setIsAnalyzing(true);
    setDebateLog([]);
    setAnalysis(null);

    try {
      const info = `ID: ${caseInfo.id}, 借款人: ${caseInfo.applicant}, 额度: ${caseInfo.amount}, 用途: ${caseInfo.purpose}`;
      const result = await startRiskDebate(info, lang);
      setDebateLog(result.debate);
      setAnalysis(result.analysis);
    } catch (error) {
      console.error("Analysis Error:", error);
      alert(lang === 'zh' ? "分析失败，请检查配置。" : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tight leading-none italic text-indigo-900 uppercase">Guardian</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Risk Engine v2.5</p>
          </div>
        </div>

        <div className="p-4 space-y-1">
          <button onClick={() => setActiveTab('pending')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'pending' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Clock size={18} /> {t.pending}
          </button>
          <button onClick={() => setActiveTab('history')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'history' ? 'bg-indigo-50 text-indigo-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
            <History size={18} /> {t.history}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {(activeTab === 'pending' ? SAMPLE_CASES : HISTORICAL_CASES).map((item) => (
            <button key={item.id} onClick={() => handleAnalyze(item)} disabled={isAnalyzing} className={`w-full text-left p-4 rounded-2xl mb-2 border transition-all hover:scale-[1.02] ${selectedCase?.id === item.id ? 'bg-white border-indigo-200 shadow-md ring-4 ring-indigo-50' : 'bg-slate-50/50 border-transparent hover:border-slate-200'}`}>
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-mono text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{item.id}</span>
                <ChevronRight size={14} className="text-slate-300" />
              </div>
              <p className="text-sm font-bold text-slate-800 line-clamp-1">{item.applicant}</p>
              <p className="text-xs text-slate-500 line-clamp-2 mt-1">{item.purpose}</p>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Dashboard */}
      <main className="flex-1 overflow-y-auto flex flex-col bg-white">
        {!selectedCase ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 p-20 text-center">
            <LayoutDashboard size={64} className="mb-6 opacity-20" />
            <h2 className="text-2xl font-black text-slate-400">{lang === 'zh' ? '准备就绪' : 'Ready to Audit'}</h2>
            <p className="mt-2">{lang === 'zh' ? '请从左侧选择一个案卷进行 AI 深度风险穿透' : 'Select a dossier to begin deep AI risk audit'}</p>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <header className="p-8 border-b border-slate-100 flex justify-between items-end sticky top-0 bg-white/80 backdrop-blur-md z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h2 className="text-3xl font-black tracking-tight text-slate-900">{selectedCase.applicant}</h2>
                  <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="text-[10px] font-black bg-slate-900 text-white px-2 py-1 rounded">
                    {lang === 'zh' ? 'EN' : 'ZH'}
                  </button>
                </div>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1.5 font-bold text-indigo-600 italic">¥{selectedCase.amount.toLocaleString()}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300" />
                  <span>{selectedCase.id}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-200 text-slate-600 text-sm font-bold hover:bg-slate-50 transition-all shadow-sm">
                  <Download size={18} />
                  {lang === 'zh' ? '导出报告' : 'Export'}
                </button>
                <button disabled={isAnalyzing} onClick={() => handleAnalyze(selectedCase)} className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50">
                  {isAnalyzing ? <Loader2 className="animate-spin" size={18} /> : <Zap size={18} />}
                  {isAnalyzing ? (lang === 'zh' ? '穿透分析中...' : 'Analyzing...') : (lang === 'zh' ? '开始审计' : 'Start Audit')}
                </button>
              </div>
            </header>

            <div className="flex-1 p-8 bg-slate-50/30 overflow-y-auto">
              <div className="max-w-6xl mx-auto space-y-10 pb-24">
                
                {/* 记忆检索模块 (Memory & Knowledge Fusion) */}
                {analysis?.memoryRetrieval && (
                  <div className="bg-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-700">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-indigo-500/30 rounded-lg">
                        <Database size={20} className="text-indigo-200" />
                      </div>
                      <h3 className="text-lg font-black tracking-tight uppercase italic opacity-90">{lang === 'zh' ? '长效记忆与知识对齐' : 'Memory & Knowledge Fusion'}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysis.memoryRetrieval.map((item: string, idx: number) => (
                        <div key={idx} className="bg-white/10 border border-white/10 rounded-2xl p-4 flex gap-3 items-start hover:bg-white/20 transition-colors">
                          <BrainCircuit size={16} className="shrink-0 mt-1 text-indigo-300" />
                          <p className="text-sm font-medium leading-relaxed text-indigo-50">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Analysis Dashboard */}
                {analysis && (
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-8 space-y-6">
                      <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl">
                        <div className="flex items-center justify-between mb-8">
                          <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                            <TrendingUp className="text-indigo-600" /> {t.verdict}
                          </h3>
                          <div className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest ${
                            analysis.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' :
                            analysis.riskLevel === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>
                            {analysis.riskLevel}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-10 mb-8">
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.safety}</p>
                            <div className="text-5xl font-black text-slate-900">{(analysis.passProbability * 100).toFixed(0)}%</div>
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{t.limit}</p>
                            <div className="text-5xl font-black text-slate-900 italic">¥{(analysis.creditLimit/10000).toLocaleString()}w</div>
                          </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                          <p className="text-sm leading-relaxed text-slate-600 font-medium">{analysis.summary}</p>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-4 space-y-6">
                       <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200/60 shadow-xl h-full flex flex-col">
                         <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Risk Profile</h3>
                         
                         <div className="flex-1 min-h-[250px] mb-6">
                           <ResponsiveContainer width="100%" height="100%">
                             <RadarChart cx="50%" cy="50%" outerRadius="80%" data={[
                               { subject: 'Asset', A: analysis.riskScores.asset, fullMark: 10 },
                               { subject: 'Business', A: analysis.riskScores.business, fullMark: 10 },
                               { subject: 'DTI', A: analysis.riskScores.dti, fullMark: 10 },
                               { subject: 'Fraud', A: analysis.riskScores.fraud, fullMark: 10 },
                             ]}>
                               <PolarGrid stroke="#e2e8f0" />
                               <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                               <Radar
                                 name="Risk"
                                 dataKey="A"
                                 stroke="#4f46e5"
                                 fill="#4f46e5"
                                 fillOpacity={0.5}
                               />
                             </RadarChart>
                           </ResponsiveContainer>
                         </div>

                         <div className="space-y-4">
                           {Object.entries(analysis.riskScores || {}).map(([key, val]: [string, any]) => (
                             <div key={key}>
                               <div className="flex justify-between text-[10px] font-black uppercase mb-1.5">
                                 <span className="text-slate-500 tracking-tighter">{key}</span>
                                 <span className="text-slate-900">{val}/10</span>
                               </div>
                               <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                 <div className="h-full bg-indigo-600" style={{ width: `${(val as number)*10}%` }} />
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* Evidence Chain */}
                {analysis?.evidenceChain && (
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200/60 shadow-xl">
                    <div className="flex items-center gap-3 mb-8">
                      <div className="p-2 bg-slate-100 rounded-lg">
                        <Scale size={20} className="text-slate-600" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900">{t.evidence}</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {analysis.evidenceChain.map((item: string, idx: number) => (
                        <div key={idx} className="flex gap-4 items-start p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                          <div className="mt-1">
                            {analysis.riskLevel === 'Low' ? (
                              <CheckCircle2 size={18} className="text-emerald-500" />
                            ) : (
                              <AlertTriangle size={18} className="text-amber-500" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-slate-600 leading-relaxed">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Debate Feed */}
                <div className="space-y-10">
                  <div className="flex items-center gap-4 px-4">
                    <h3 className="text-2xl font-black text-slate-900 italic tracking-tight">{t.thinking}</h3>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>

                  <div className="space-y-8 relative px-4">
                    <div className="absolute left-[2.9rem] top-0 bottom-0 w-px bg-slate-100" />
                    
                    {debateLog.map((turn, i) => {
                      const config = AGENT_CONFIGS[turn.role as AgentRole];
                      if (!config) return null;
                      return (
                        <div key={i} className="flex gap-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-2xl shadow-lg border-2 border-white z-10 ${config.color}`}>
                            {config.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="font-bold text-slate-900">{config.name[lang]}</span>
                              <span className="text-[10px] font-mono text-slate-400">{turn.timestamp}</span>
                            </div>
                            <div className="bg-white border border-slate-200/80 p-6 rounded-3xl rounded-tl-none shadow-sm text-sm leading-relaxed text-slate-600">
                              {turn.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isAnalyzing && (
                      <div className="flex gap-6 animate-pulse">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 shrink-0" />
                        <div className="flex-1 space-y-3 pt-2">
                          <div className="h-3 bg-slate-100 rounded w-1/4" />
                          <div className="h-20 bg-slate-50 rounded-2xl" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
