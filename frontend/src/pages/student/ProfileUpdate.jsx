import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, UserCog, ShieldCheck, Star, Brain, Cpu, MessageSquare, Zap } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const fields = [
  { key: 'coding_skill', label: 'Coding Proficiency', min: 0, max: 10, step: 1, color: 'blue', icon: Cpu },
  { key: 'design_skill', label: 'Design & UX Aesthetic', min: 0, max: 10, step: 1, color: 'indigo', icon: Zap },
  { key: 'leadership', label: 'Strategic Leadership', min: 0, max: 10, step: 1, color: 'violet', icon: Star },
  { key: 'communication', label: 'Collaborative Communication', min: 0, max: 10, step: 1, color: 'emerald', icon: MessageSquare },
  { key: 'reliability', label: 'Operational Reliability', min: 0, max: 1, step: 0.05, color: 'rose', icon: ShieldCheck },
];

export default function ProfileUpdate() {
  const [form, setForm] = useState({ coding_skill: 0, design_skill: 0, leadership: 0, communication: 0, reliability: 0.5 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/profile').then(r => {
      setForm({
        coding_skill: r.data.coding_skill || 0,
        design_skill: r.data.design_skill || 0,
        leadership: r.data.leadership || 0,
        communication: r.data.communication || 0,
        reliability: r.data.reliability || 0.5,
      });
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleChange = (key, val) => setForm({ ...form, [key]: val });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put('/profile', form);
      toast.success('Your skill matrix has been updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'System error during profile synchronization');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageLayout><LoadingSpinner text="Synchronizing skill data..." /></PageLayout>;

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Self Assessment</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Skill <span className="text-blue-600">Calibration</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Fine-tune your technical profile to improve team matching accuracy.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="lg:col-span-7"
        >
            <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-10">
              {fields.map(({ key, label, min, max, step, color, icon: Icon }) => {
                const val = form[key];
                const displayVal = key === 'reliability' ? `${Math.round(val * 100)}%` : `${val}/10`;

                return (
                  <div key={key} className="group">
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 group-focus-within:bg-blue-600 group-focus-within:text-white transition-all flex items-center justify-center">
                            <Icon size={16} />
                         </div>
                         <label className="text-slate-900 font-bold text-sm uppercase tracking-tight">{label}</label>
                      </div>
                      <span className="font-black text-blue-600 text-lg bg-blue-50 px-4 py-1 rounded-2xl">{displayVal}</span>
                    </div>
                    
                    <div className="relative pt-2">
                      <input
                        type="range"
                        min={min} max={max} step={step}
                        value={val}
                        onChange={e => handleChange(key, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-blue-600"
                      />
                      <div className="flex justify-between mt-4 px-1">
                         {Array.from({ length: 3 }, (_, i) => {
                            const label = i === 0 ? 'Novice' : i === 1 ? 'Proficient' : 'Expert';
                            return <span key={i} className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
                         })}
                      </div>
                    </div>
                  </div>
                );
              })}

              <button 
                type="submit" 
                disabled={saving} 
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98]"
              >
                {saving ? <><Loader2 size={24} className="animate-spin" /> Synchronizing...</> : <><Save size={20} /> Deploy Calibration</>}
              </button>
            </form>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            transition={{ delay: 0.2 }}
            className="lg:col-span-5"
        >
            <div className="bg-slate-900 p-10 rounded-[2.5rem] text-white sticky top-10">
                <Brain className="text-blue-400 mb-6" size={40} />
                <h2 className="text-2xl font-black mb-4">ML Intelligence</h2>
                <p className="text-slate-400 font-medium mb-10 leading-relaxed">
                    Our Random Forest model processes these values to determine team synergy. Honest calibration leads to 14% higher project success rates.
                </p>

                <div className="space-y-6">
                    <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                            <Cpu size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Input Processing</p>
                            <p className="text-sm font-bold">Standardized Vectorization</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/5 border border-white/10">
                        <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase">Validation</p>
                            <p className="text-sm font-bold">Cross-referenced Metrics</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 bg-blue-600 p-6 rounded-3xl">
                    <p className="text-xs font-black uppercase tracking-widest mb-2 opacity-80">Pro Tip</p>
                    <p className="text-sm font-bold">Update your profile after every major project to keep your compatibility score optimal.</p>
                </div>
            </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
