import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import { Brain, MessageSquare, Target, Activity, ShieldCheck, ChevronRight, Info } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import MLScoreGauge from '../../components/MLScoreGauge';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';

export default function MLScore() {
  const [mlData, setMlData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/team-ml-score'),
      api.get('/student/team-feedback'),
    ]).then(([mlRes, fbRes]) => {
      setMlData(mlRes.data);
      setFeedback(fbRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Consulting the AI model..." /></PageLayout>;

  const notAssigned = !mlData || mlData?.detail;

  const chartData = mlData && !notAssigned ? [
    { name: 'Coding', avg: mlData.coding_avg },
    { name: 'Design', avg: mlData.design_avg },
    { name: 'Comm.', avg: mlData.communication_avg },
    { name: 'Lead.', avg: mlData.leadership_avg },
    { name: 'Rel.', avg: mlData.reliability_avg * 10 },
  ] : [];

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">{mlData?.team_name || (mlData?.team_number ? `Team Unit #${mlData.team_number}` : 'Team Analysis')}</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">ML <span className="text-blue-600">Compatibility</span> Score</h1>
        <p className="text-slate-500 mt-2 font-medium">Deep dive into your team's predicted performance and compatibility metrics.</p>
      </header>

      {notAssigned ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 shadow-sm text-center max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Brain size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Analysis Pending</h2>
          <p className="text-slate-500 mb-0">{mlData.message}</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Score Gauge Card */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-16 -mt-16 blur-3xl" />
              
              <div className="w-full flex justify-between items-center mb-10">
                 <h2 className="text-lg font-bold text-slate-900">Compatibility</h2>
                 <Info size={16} className="text-slate-300" />
              </div>

              <MLScoreGauge score={mlData.ml_predicted_score} size={220} />
              
              <div className="mt-10 grid grid-cols-2 gap-4 w-full">
                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Normalized Strength</p>
                   <p className="text-xl font-black text-slate-900">{mlData.avg_team_strength?.toFixed(1)}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-3xl text-center">
                   <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Team ID</p>
                   <p className="text-xl font-black text-slate-900">#{mlData.team_number}</p>
                </div>
              </div>
            </motion.div>

            {/* AI Analysis Explanation */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ delay: 0.2 }} 
              className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-6">
                 <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <Brain size={20} className="text-white" />
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 text-left">AI Synthesis Report</h2>
              </div>
              
              <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 line-height-[1.6]">
                <p className="text-slate-700 font-medium italic text-lg leading-relaxed">
                  "{mlData.ai_analysis || 'The model is currently weighting team factors to provide a detailed qualitative summary.'}"
                </p>
              </div>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="flex items-start gap-4 p-5 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                       <Target size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-0.5 tracking-tight">Prediction Score</p>
                        <p className="text-sm font-black text-slate-900">{Math.round((mlData.ml_predicted_score > 1 ? mlData.ml_predicted_score : mlData.ml_predicted_score * 100))}% match</p>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-5 rounded-3xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
                       <ShieldCheck size={20} />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-0.5 tracking-tight">Team Reliability</p>
                        <p className="text-sm font-black text-slate-900">{mlData.reliability_avg >= 0.8 ? 'High' : mlData.reliability_avg >= 0.5 ? 'Moderate' : 'Needs Work'}</p>
                    </div>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* Bar Chart Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.3 }} 
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
                <div>
                   <h2 className="text-xl font-bold text-slate-900">Skill Distribution</h2>
                   <p className="text-slate-500 text-sm font-medium">Averaged across all team members</p>
                </div>
            </div>
            
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#64748b', fontSize: 11, fontWeight: 'bold' }} 
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} 
                  />
                  <Tooltip
                    contentStyle={{ background: '#ffffff', border: 'none', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="avg" radius={[12, 12, 4, 4]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][index % 5]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Feedback Section */}
          {feedback && feedback.total_feedback_entries > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ delay: 0.4 }} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                 <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <MessageSquare size={20} />
                 </div>
                 <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-900">External Evaluations</h2>
                    <p className="text-slate-500 text-sm font-medium">Feedback submitted by teaching staff</p>
                 </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {feedback.feedback?.map((fb, i) => (
                  <div key={i} className="p-6 rounded-[2rem] border border-slate-50 bg-slate-50/30 group hover:bg-white hover:border-blue-100 transition-all duration-300">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-6">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-1">
                        {[
                          { label: 'Performance', val: fb.performance_score, color: 'blue' },
                          { label: 'Technical', val: fb.technical_score, color: 'indigo' },
                          { label: 'Communication', val: fb.communication_score, color: 'emerald' },
                          { label: 'Collaboration', val: fb.collaboration_score, color: 'violet' },
                        ].map((metric) => (
                          <div key={metric.label}>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">{metric.label}</p>
                            <div className="flex items-baseline gap-1">
                               <p className="text-lg font-black text-slate-900">{metric.val}</p>
                               <span className="text-[10px] text-slate-400">/ 10</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mb-1">Evaluator</p>
                         <p className="text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-full shadow-sm border border-slate-100">{fb.submitted_by}</p>
                      </div>
                    </div>
                    {fb.comments && (
                        <div className="bg-white p-4 rounded-2xl border border-blue-50 relative">
                            <div className="absolute top-0 left-4 w-4 h-4 bg-white border-l border-t border-blue-50 rotate-45 -mt-2"></div>
                            <p className="text-slate-700 text-sm font-medium leading-relaxed italic">"{fb.comments}"</p>
                        </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </PageLayout>
  );
}
