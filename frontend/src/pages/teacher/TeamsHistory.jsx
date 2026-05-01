import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  History, ChevronRight, Calendar, Users, 
  FileText, ArrowUpRight, Clock, ShieldCheck,
  Layout, Database
} from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';

export default function TeamsHistory() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/teams')
      .then(r => setTeams(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Accessing Generation Logs..." /></PageLayout>;

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Archive</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Generation <span className="text-blue-600">Timeline</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Review and audit historical team formations and ML performance benchmarks.</p>
          </div>
          <button className="h-12 px-6 bg-white border border-slate-100 rounded-2xl text-slate-900 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm">
             <Layout size={18} /> Manage Docs
          </button>
        </div>
      </header>

      {teams.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] border border-slate-100 border-dashed p-20 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
            <History size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Timeline Empty</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">No team generation events have been recorded in the current academic session.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {teams.map((doc, i) => {
            const score = doc.avg_ml_score;
            const scoreColor = score >= 0.75 ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : score >= 0.5 ? 'text-blue-600 bg-blue-50 border-blue-100' : 'text-amber-600 bg-amber-50 border-amber-100';
            
            return (
              <motion.div
                key={doc.team_document_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link 
                  to={`/teacher/teams/${doc.team_document_id}`} 
                  className="bg-white border border-slate-100 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between group hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all outline-none ring-offset-4 focus:ring-4 focus:ring-blue-500/10"
                >
                  <div className="flex items-center gap-6 w-full md:w-auto">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-900 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                       <FileText size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">RECORD ID: #{doc.team_document_id?.slice(-4).toUpperCase()}</span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">Neural Calibration Batch</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                          <Clock size={12} className="text-slate-300" />
                          {doc.generated_at ? new Date(doc.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Pending...'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                        <span className="text-slate-400 text-xs font-bold flex items-center gap-1.5">
                          <Users size={12} className="text-slate-300" />
                          {doc.total_teams} Units / {doc.team_size} Size
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 mt-6 md:mt-0 w-full md:w-auto justify-between md:justify-end border-t border-slate-50 pt-6 md:pt-0 md:border-none">
                    <div className="flex flex-col items-end">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Mean Accuracy</p>
                      <div className={`px-4 py-1 rounded-full border text-sm font-black ${scoreColor}`}>
                         {Math.round(score * 100)}%
                      </div>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-blue-600 group-hover:border-blue-200 group-hover:bg-blue-50 transition-all">
                       <ChevronRight size={20} />
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
      
      <div className="mt-10 p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-blue-600 shadow-sm shadow-blue-200">
               <ShieldCheck size={24} />
            </div>
            <div>
               <h4 className="font-black text-slate-900 tracking-tight">Verified Records Only</h4>
               <p className="text-xs font-bold text-slate-500">All historical generations are cryptographically hashed for audit integrity.</p>
            </div>
         </div>
         <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all active:scale-95">
            Synchronize Database
         </button>
      </div>
    </PageLayout>
  );
}
