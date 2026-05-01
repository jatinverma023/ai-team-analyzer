import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, ChevronDown, CheckCircle2, 
  Target, Zap, Activity, Users, Send, Info,
  RefreshCw, Brain
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const scoreFieldConfig = [
  { key: 'performance_score', label: 'Overall performance metric', icon: Target, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
  { key: 'technical_score', label: 'Technical skill execution', icon: Zap, iconBg: 'bg-violet-50', iconColor: 'text-violet-600' },
  { key: 'communication_score', label: 'Information flow clarity', icon: Activity, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
  { key: 'collaboration_score', label: 'Group synergy & support', icon: Users, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
];

export default function SubmitFeedback() {
  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState('');
  const [selectedTeamNum, setSelectedTeamNum] = useState('');
  const [teamDoc, setTeamDoc] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    performance_score: 5, technical_score: 5,
    communication_score: 5, collaboration_score: 5, comments: '',
  });

  useEffect(() => {
    api.get('/teacher/teams')
      .then(r => setTeams(r.data))
      .catch(() => {})
      .finally(() => setLoadingTeams(false));
  }, []);

  useEffect(() => {
    if (selectedDoc) {
      api.get(`/teacher/teams/${selectedDoc}`).then(r => setTeamDoc(r.data)).catch(() => {});
    }
  }, [selectedDoc]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDoc || !selectedTeamNum) return toast.error('Selection incomplete');
    setSubmitting(true);
    try {
      const res = await api.post('/teacher/team-feedback', {
        team_id: selectedDoc,
        team_number: parseInt(selectedTeamNum),
        ...form,
      });
      toast.success('Performance record submitted');
      if (res.data.retrain_status?.includes('queued') || res.data.retrain_status?.includes('success')) {
        toast.success('ML model retraining queued!', { duration: 5000, icon: '🧠' });
      }
      setForm({ performance_score: 5, technical_score: 5, communication_score: 5, collaboration_score: 5, comments: '' });
      setSelectedTeamNum('');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Submission failure');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTeams) return <PageLayout><LoadingSpinner text="Connecting to Feedback API..." /></PageLayout>;

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Calibration</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Performance <span className="text-blue-600">Assessor</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Verified field data serves as the ground truth for our AI retraining pipeline.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        <motion.div 
           initial={{ opacity: 0, y: 20 }} 
           animate={{ opacity: 1, y: 0 }} 
           className="lg:col-span-8"
        >
          <form onSubmit={handleSubmit} className="bg-white rounded-[2.5rem] border border-slate-100 p-8 md:p-12 shadow-sm space-y-10">
            {/* Context Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block italic">Team Generation Doc</label>
                <div className="relative group">
                  <select
                    value={selectedDoc}
                    onChange={e => { setSelectedDoc(e.target.value); setSelectedTeamNum(''); setTeamDoc(null); }}
                    className="h-14 w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 font-bold text-slate-900 appearance-none focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
                  >
                    <option value="">Choose generation...</option>
                    {teams.map((t, i) => (
                      <option key={t.team_document_id} value={t.team_document_id}>
                        Batch #{i + 1} ({t.total_teams} Units)
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={18} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-600 transition-colors" />
                </div>
              </div>

              <AnimatePresence>
                {teamDoc && (
                  <motion.div
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                  >
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 block italic">Synergy Group ID</label>
                    <div className="flex flex-wrap gap-2">
                      {teamDoc.teams?.map((t) => (
                        <button
                          key={t.team_number} type="button"
                          onClick={() => setSelectedTeamNum(t.team_number)}
                          className={`px-4 h-12 rounded-xl border font-black text-xs transition-all ${
                            selectedTeamNum === t.team_number
                              ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200'
                              : 'bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'
                          }`}
                        >
                          {t.team_name || `Team ${t.team_number}`}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Assessment Sliders — fixed dynamic Tailwind classes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 border-t border-slate-50 pt-10">
              {scoreFieldConfig.map(({ key, label, icon: Icon, iconBg, iconColor }) => (
                <div key={key} className="relative">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2">
                       <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg} ${iconColor}`}>
                          <Icon size={16} />
                       </div>
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-900">{label}</label>
                    </div>
                    <span className="text-xl font-black text-slate-900">{form[key]}</span>
                  </div>
                  <input
                    type="range" min={0} max={10} step={0.5}
                    value={form[key]}
                    onChange={e => setForm({ ...form, [key]: parseFloat(e.target.value) })}
                    className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-2 text-[8px] font-black text-slate-300 tracking-tighter uppercase">
                     <span>Poor</span>
                     <span>Mastery</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Qualitative Feedback */}
            <div className="border-t border-slate-50 pt-10">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4 block italic">Qualitative Observations</label>
              <textarea
                rows={4}
                value={form.comments}
                onChange={e => setForm({ ...form, comments: e.target.value })}
                placeholder="Briefly describe group dynamics, leadership shifts, or unexpected outcomes..."
                className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 font-medium text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-none shadow-inner"
              />
            </div>

            <div className="flex items-center justify-between gap-6 pt-4">
               <div className="hidden md:flex items-center gap-2 text-slate-400">
                  <Info size={14} />
                  <p className="text-[10px] font-bold italic uppercase tracking-tighter">Drafts are not autosaved</p>
               </div>
               <button 
                  type="submit" 
                  disabled={submitting} 
                  className={`h-16 px-10 rounded-[1.25rem] font-black flex items-center gap-3 transition-all active:scale-95 shadow-xl ${
                    submitting ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white shadow-slate-200 hover:bg-slate-800'
                  }`}
               >
                  {submitting ? (
                    <><RefreshCw size={20} className="animate-spin" /> Transmitting...</>
                  ) : (
                    <><Send size={20} /> Deploy Feedback</>
                  )}
               </button>
            </div>
          </form>
        </motion.div>

        {/* Sidebar Info */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} 
           animate={{ opacity: 1, x: 0 }} 
           className="lg:col-span-4 space-y-6"
        >
           <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-900/20">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400 mb-6">
                 <Brain size={24} />
              </div>
              <h3 className="text-xl font-black tracking-tight mb-3">Model Education</h3>
              <p className="text-sm font-bold text-slate-400 leading-relaxed mb-6">
                 Your evaluations are pooled to retrain the Random Forest model every 10 entries. This improves future team suggestions.
              </p>
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                 <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Queue Progress</p>
                    <p className="text-sm font-black">Syncing...</p>
                 </div>
                 <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    <CheckCircle2 size={20} />
                 </div>
              </div>
           </div>

           <div className="bg-blue-50 rounded-[2.5rem] p-8 border border-blue-100">
              <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">Quality Standard</h4>
              <p className="text-xs font-bold text-blue-900/60 leading-relaxed">
                 Ensure scores reflect evidence-based outcomes from the project deliverables. Avoid binary (0 or 10) ratings where possible.
              </p>
           </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
