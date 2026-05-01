import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Users, Brain, Calendar, 
  TrendingUp, Download, Share2, MoreVertical
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import MLScoreGauge from '../../components/MLScoreGauge';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';

export default function TeamDetail() {
  const { id } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/teacher/teams/${id}`)
      .then(r => setDoc(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageLayout><LoadingSpinner text="Decrypting Neural Batch..." /></PageLayout>;
  
  if (!doc) return (
    <PageLayout>
      <div className="bg-white rounded-[2.5rem] border border-slate-100 p-20 text-center shadow-sm">
        <p className="text-slate-400 font-bold italic">Entity identifier not found in database.</p>
        <Link to="/teacher/teams" className="text-blue-600 font-black flex items-center gap-2 justify-center mt-4">
           <ArrowLeft size={16} /> Return to archive
        </Link>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <header className="mb-10">
        <Link to="/teacher/teams" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-6">
          <ArrowLeft size={14} /> Back to Timeline
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Batch <span className="text-blue-600">Calibration Detail</span></h1>
            <div className="flex items-center gap-4 mt-2">
               <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                  <Calendar size={14} className="text-slate-300" />
                  {doc.generated_at ? new Date(doc.generated_at).toLocaleString() : '—'}
               </span>
               <span className="w-1 h-1 rounded-full bg-slate-200" />
               <span className="text-slate-400 text-sm font-bold flex items-center gap-1.5">
                  <Users size={14} className="text-slate-300" />
                  {doc.total_teams} Formations
               </span>
            </div>
          </div>
          <div className="flex gap-3">
             <button className="h-12 px-5 bg-white border border-slate-100 rounded-2xl text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                <Share2 size={18} />
             </button>
             <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-black flex items-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95">
                <Download size={18} /> Export Sheet
             </button>
          </div>
        </div>
      </header>

      <div className="space-y-6">
        {doc.teams?.map((team, i) => (
          <motion.div
            key={team.team_number}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
          >
            <div className="px-10 py-8 border-b border-slate-50 flex items-center justify-between">
               <div className="flex items-center gap-5">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-900 flex items-center justify-center font-black text-lg">
                    {team.team_number}
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-slate-900 tracking-tight">{team.team_name || `Synergy Group ${team.team_number}`}</h2>
                    <p className="text-xs font-bold text-slate-400 italic mt-0.5">Automated distribution successful</p>
                  </div>
               </div>
               <button className="text-slate-300 hover:text-slate-900 transition-colors">
                  <MoreVertical size={20} />
               </button>
            </div>

            <div className="p-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* ML Gauge Section */}
              <div className="lg:col-span-4 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                <MLScoreGauge score={team.ml_compatibility_score} size={160} />
                <div className="mt-6 flex flex-col items-center">
                   <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-widest mb-2">CALIBRATION INDEX</span>
                   <p className="text-xs font-bold text-slate-400">Predicted performance confidence</p>
                </div>
              </div>

              {/* Members Section */}
              <div className="lg:col-span-4">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <Users size={14} /> Assigned Members
                </h3>
                <div className="space-y-4">
                  {team.members?.map((m) => (
                    <div key={m.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-slate-50 shadow-sm hover:border-blue-100 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-xs group-hover:bg-blue-600 group-hover:text-white transition-all">
                        {m.name?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-slate-900 truncate">{m.name}</p>
                        <p className="text-[10px] font-bold text-slate-400 truncate">{m.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analytics & Insight */}
              <div className="lg:col-span-4 space-y-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp size={14} /> Efficiency Balance
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { label: 'Technical', val: team.coding_avg },
                      { label: 'Design', val: team.design_avg },
                      { label: 'Dialog', val: team.communication_avg },
                      { label: 'Strategic', val: team.leadership_avg },
                    ].map(({ label, val }) => (
                      <div key={label} className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <p className="text-lg font-black text-slate-900">{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-blue-600 rounded-3xl p-6 shadow-xl shadow-blue-600/10 text-white group">
                  <div className="flex items-center gap-2 mb-3">
                     <Brain size={16} className="text-blue-200" />
                     <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-100">AI Neural Insight</h3>
                  </div>
                  <p className="text-xs font-bold leading-relaxed opacity-90 italic">
                    "{team.ai_analysis}"
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </PageLayout>
  );
}
