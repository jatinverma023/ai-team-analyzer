import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, Loader2, X, Search, 
  Users, Zap, ShieldCheck, Brain,
  Sparkles, ArrowRight, UserPlus
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function CompatibilityChecker() {
  const [students, setStudents] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/teacher/students').then(r => setStudents(r.data)).catch(() => {});
  }, []);

  const toggle = (student) => {
    setResult(null);
    if (selected.find(s => s._id === student._id)) {
      setSelected(selected.filter(s => s._id !== student._id));
    } else {
      setSelected([...selected, student]);
    }
  };

  const handleCheck = async () => {
    if (selected.length < 2) return toast.error('Select at least 2 students');
    setLoading(true);
    try {
      const res = await api.post('/teacher/compatibility', { student_ids: selected.map(s => s._id) });
      setResult(res.data);
      toast.success('Synergy calibration complete');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Calibration failure');
    } finally {
      setLoading(false);
    }
  };

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Synergy Protocol</span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Pairing <span className="text-blue-600">Simulate</span></h1>
          <p className="text-slate-500 mt-2 font-medium">Predict group performance dynamics before finalizing batch assignments.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Student Selector */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }} 
           className="lg:col-span-12 xl:col-span-7 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
             <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Roster Selection</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Select 2-5 students for comparative analysis.</p>
             </div>
             <div className="relative group min-w-[300px]">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  className="h-12 w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                  placeholder="Search via name or email..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
             </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {filtered.map((s, i) => {
              const isSelected = selected.find(x => x._id === s._id);
              return (
                <motion.button
                  key={s._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => toggle(s)}
                  className={`w-full flex items-center justify-between p-4 rounded-3xl border transition-all group ${
                    isSelected 
                      ? 'bg-blue-50 border-blue-200 shadow-lg shadow-blue-500/5' 
                      : 'bg-white border-slate-50 hover:border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xs transition-all ${
                      isSelected ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'
                    }`}>
                      {s.name?.[0]}
                    </div>
                    <div className="text-left">
                      <p className={`text-sm font-black transition-colors ${isSelected ? 'text-blue-700' : 'text-slate-900'}`}>{s.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{s.email}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                    isSelected ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-100 bg-white text-slate-200 group-hover:text-slate-400 group-hover:border-slate-200'
                  }`}>
                    {isSelected ? <CheckCircle2 size={16} /> : <UserPlus size={16} />}
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
             <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Current Pool: <span className="text-blue-600">{selected.length} Members</span>
             </div>
             <button 
                onClick={handleCheck} 
                disabled={loading || selected.length < 2} 
                className={`h-14 px-8 rounded-2xl font-black flex items-center gap-3 transition-all active:scale-95 shadow-xl ${
                  loading || selected.length < 2
                    ? 'bg-slate-100 text-slate-400' 
                    : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
                }`}
             >
                {loading ? <><Loader2 size={20} className="animate-spin" /> Calibrating...</> : <><ShieldCheck size={20} /> Deploy Simulation</>}
             </button>
          </div>
        </motion.div>

        {/* Result & Analysis */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
           <AnimatePresence mode="wait">
             {!result ? (
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="bg-slate-50 border border-slate-100 border-dashed rounded-[2.5rem] p-12 text-center"
               >
                  <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mx-auto mb-6 text-slate-200 shadow-sm">
                     <Brain size={32} />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">System Idle</h3>
                  <p className="text-xs font-bold text-slate-400 leading-relaxed max-w-[200px] mx-auto uppercase tracking-tighter">Please populate the roster and initialize calibration.</p>
               </motion.div>
             ) : (
               <motion.div 
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="space-y-6"
               >
                  {/* Gauge Result */}
                  <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white text-center shadow-2xl shadow-slate-900/20 overflow-hidden relative">
                     <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Sparkles size={100} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-8">Simulation Output</p>
                     
                     <div className="flex justify-center mb-8">
                        <div className="relative w-48 h-48">
                           <svg width="192" height="192" viewBox="0 0 120 120" className="drop-shadow-[0_0_15px_rgba(37,99,235,0.3)]">
                             <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                             <motion.circle
                               cx="60" cy="60" r="54"
                               fill="none"
                               stroke="#2563eb"
                               strokeWidth="10"
                               strokeLinecap="round"
                               strokeDasharray={2 * Math.PI * 54}
                               initial={{ strokeDashoffset: 2 * Math.PI * 54 }}
                               animate={{ strokeDashoffset: 2 * Math.PI * 54 * (1 - result.compatibility_score) }}
                               transition={{ duration: 2, ease: "easeOut" }}
                               transform="rotate(-90 60 60)"
                             />
                           </svg>
                           <div className="absolute inset-0 flex flex-col items-center justify-center">
                              <span className="text-4xl font-black">{Math.round(result.compatibility_score * 100)}%</span>
                              <span className="text-[9px] font-black text-blue-400 uppercase tracking-widest mt-1">Synergy Index</span>
                           </div>
                        </div>
                     </div>

                     <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-bold">
                        {result.compatibility_score >= 0.75 ? <><Sparkles size={14} className="text-blue-400" /> Strategic Synergy</> : 
                         result.compatibility_score >= 0.5 ? <><Zap size={14} className="text-amber-400" /> Operational Match</> : 
                         <><X size={14} className="text-rose-400" /> High Inefficiency</>}
                     </div>
                  </div>

                  {/* Verbal Analysis */}
                  <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
                     <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                           <Brain size={20} />
                        </div>
                        <h3 className="text-lg font-black text-slate-900 tracking-tight">Neural Appraisal</h3>
                     </div>
                     <p className="text-sm font-bold text-slate-500 leading-relaxed italic">
                        "{result.analysis}"
                     </p>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>

           <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100 flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
                 <Zap size={24} />
              </div>
              <div>
                 <h4 className="font-black text-slate-900">Engine Logic</h4>
                 <p className="text-xs font-bold text-slate-500 leading-relaxed">
                    Predictions are generated by the calibrated Random Forest engine. Individual student skill weights are cross-referenced to identify potential communication bottlenecks or leadership vacuums.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </PageLayout>
  );
}
