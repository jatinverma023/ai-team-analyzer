import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ChevronDown, X, Code, Palette, 
  MessageCircle, Award, ShieldCheck, Mail, 
  User, Filter, MoreHorizontal, ArrowLeft, ArrowRight
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';

export default function StudentsList() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/teacher/students')
      .then(r => setStudents(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = students.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <PageLayout><LoadingSpinner text="Retrieving Student Directory..." /></PageLayout>;

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Management</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Student <span className="text-blue-600">Directory</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Browse individual performance metrics and technical calibration.</p>
          </div>
          <div className="flex gap-3">
             <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  className="h-14 pl-12 pr-6 bg-white border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all w-[300px] shadow-sm" 
                  placeholder="Search by name or UID..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                />
             </div>
             <button className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all shadow-sm">
                <Filter size={20} />
             </button>
          </div>
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden mb-10">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                {['Technical Lead', 'Calibrated Skills', 'Reliability', 'Status', ''].map(h => (
                  <th key={h} className="px-8 py-5 text-left text-[10px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((s, i) => (
                <>
                  <motion.tr
                    key={s._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelected(selected?._id === s._id ? null : s)}
                    className={`group cursor-pointer transition-all ${
                      selected?._id === s._id ? 'bg-blue-50/30' : 'hover:bg-slate-50/50'
                    }`}
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-black text-sm group-hover:scale-110 transition-transform">
                          {s.name?.[0]?.toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-slate-900 font-black tracking-tight">{s.name}</span>
                          <span className="text-xs font-bold text-slate-400 truncate flex items-center gap-1.5 mt-0.5">
                            <Mail size={12} /> {s.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex gap-1.5">
                          {['coding_skill', 'design_skill', 'communication', 'leadership'].map(k => (
                             <div key={k} className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black border ${
                               s[k] >= 8 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                               s[k] >= 5 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                               'bg-amber-50 text-amber-600 border-amber-100'
                             }`}>
                               {s[k]}
                             </div>
                          ))}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1.5">
                         <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black text-slate-400">SYNC RATE</span>
                            <span className="text-[10px] font-black text-blue-600">{Math.round((s.reliability || 0) * 100)}%</span>
                         </div>
                         <div className="w-32 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <motion.div 
                               initial={{ width: 0 }}
                               animate={{ width: `${(s.reliability || 0) * 100}%` }}
                               className="h-full bg-blue-600 rounded-full"
                            />
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      {s.is_active !== false
                        ? <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" /> Available
                          </span>
                        : <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-500">
                            Offline
                          </span>
                      }
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button className="w-10 h-10 rounded-xl hover:bg-white hover:shadow-md border border-transparent hover:border-slate-100 flex items-center justify-center text-slate-400 transition-all">
                          <MoreHorizontal size={18} />
                       </button>
                    </td>
                  </motion.tr>

                  {/* Expanded Visualizer */}
                  <AnimatePresence>
                    {selected?._id === s._id && (
                      <tr key={`${s._id}-exp`}>
                        <td colSpan={5} className="bg-blue-50/10 p-0">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden"
                          >
                             <div className="px-12 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                                {[
                                  { label: 'Technical Proficiency', val: s.coding_skill, Icon: Code, color: 'blue' },
                                  { label: 'Creative Intelligence', val: s.design_skill, Icon: Palette, color: 'indigo' },
                                  { label: 'Structural Logic', val: s.leadership, Icon: Award, color: 'violet' },
                                  { label: 'Semantic Clarity', val: s.communication, Icon: MessageCircle, color: 'emerald' },
                                ].map(({ label, val, Icon, color }) => (
                                  <div key={label} className="bg-white p-6 rounded-3xl border border-blue-100/30 shadow-sm relative overflow-hidden group">
                                    <Icon size={40} className={`absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform text-${color}-600`} />
                                    <div className={`w-10 h-10 rounded-xl bg-${color}-50 text-${color}-600 flex items-center justify-center mb-4`}>
                                       <Icon size={20} />
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                                    <div className="flex items-baseline gap-1">
                                       <span className="text-3xl font-black text-slate-900">{val}0</span>
                                       <span className="text-xs font-bold text-slate-400">%</span>
                                    </div>
                                    <div className="h-1 bg-slate-50 rounded-full mt-4 overflow-hidden">
                                      <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${val * 10}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full bg-blue-600`}
                                      />
                                    </div>
                                  </div>
                                ))}
                             </div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </>
              ))}
            </tbody>
          </table>
        </div>
        
        {filtered.length === 0 && (
          <div className="text-center py-24 text-slate-400 bg-white">
            <User size={48} className="mx-auto mb-4 opacity-10" />
            <p className="font-bold tracking-tight">No results matched your query</p>
          </div>
        )}

        <div className="px-8 py-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
           <p className="text-xs font-bold text-slate-500">Showing <span className="text-slate-900 font-black">{filtered.length}</span> of {students.length} entries</p>
           <div className="flex gap-2">
              <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                 <ArrowLeft size={16} />
              </button>
              <button className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all shadow-sm">
                 <ArrowRight size={16} />
              </button>
           </div>
        </div>
      </div>
    </PageLayout>
  );
}
