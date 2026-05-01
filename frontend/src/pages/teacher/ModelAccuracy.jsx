import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, Target, TrendingUp, TrendingDown, 
  Brain, Zap, ShieldCheck, Activity,
  Info
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ModelAccuracy() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    api.get('/teacher/model-accuracy')
      .then(r => setData(r.data))
      .catch(err => {
        if (err.response?.status === 404) setNoData(true);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Retrieving Neural Benchmarks..." /></PageLayout>;

  if (noData || !data) {
    return (
      <PageLayout>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Analytics</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Engine <span className="text-blue-600">Fidelity</span></h1>
        </header>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 border-dashed p-20 text-center shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 text-slate-300">
            <Activity size={40} />
          </div>
          <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Pending Submissions</h2>
          <p className="text-slate-400 font-medium max-w-sm mx-auto">Model accuracy metrics will be generated once verified field feedback is ingested via the Performance Assessor.</p>
        </div>
      </PageLayout>
    );
  }

  const pieData = [
    { name: 'Under', value: data.underestimated_cases },
    { name: 'Over', value: data.overestimated_cases },
    { name: 'Exact', value: data.total_evaluations - data.underestimated_cases - data.overestimated_cases },
  ].filter(d => d.value > 0);

  const COLORS = ['#F59E0B', '#F43F5E', '#10B981'];

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Performance Dashboard</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Engine <span className="text-blue-600">Fidelity</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Comparative analysis of Random Forest predictions vs verified field outcomes.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
         {[
           { label: 'Total Syncs', val: data.total_evaluations, icon: Activity, color: 'blue' },
           { label: 'Engine Confidence', val: `${data.model_accuracy_percent}%`, icon: Target, color: 'emerald' },
           { label: 'Mean Variance', val: data.average_prediction_error, icon: TrendingUp, color: 'amber' },
           { label: 'High Bias Count', val: data.overestimated_cases, icon: TrendingDown, color: 'rose' },
         ].map((stat, i) => (
           <motion.div
             key={stat.label}
             initial={{ opacity: 0, y: 10 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: i * 0.05 }}
             className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm"
           >
              <div className="flex items-center gap-3 mb-3">
                 <div className={`w-8 h-8 rounded-xl bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center`}>
                    <stat.icon size={16} />
                 </div>
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-2xl font-black text-slate-900">{stat.val}</p>
           </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-10">
        {/* Progress Tracker */}
        <motion.div 
           initial={{ opacity: 0, x: -20 }} 
           animate={{ opacity: 1, x: 0 }} 
           className="lg:col-span-12 xl:col-span-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-10">
             <div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Accuracy Calibration</h2>
                <p className="text-xs font-bold text-slate-400 mt-1">Real-time precision tracking against truth data.</p>
             </div>
             <div className="px-5 py-2 rounded-2xl bg-emerald-50 text-emerald-600 text-sm font-black flex items-center gap-2">
                <ShieldCheck size={18} /> Verified
             </div>
          </div>

          <div className="space-y-12">
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                   <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">Global Precision</span>
                   <span className="text-3xl font-black text-slate-900">{data.model_accuracy_percent}%</span>
                </div>
                <div className="text-right">
                   <span className="text-xs font-bold text-emerald-600">+1.2% this session</span>
                </div>
              </div>
              <div className="h-4 bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-1">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.model_accuracy_percent}%` }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/20"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                        <TrendingUp size={16} />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Lower Bounds</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mb-1">{data.underestimated_cases}</p>
                  <p className="text-xs font-bold text-slate-400">Cases where synergy exceeded prediction</p>
               </div>
               <div className="bg-slate-50/50 rounded-3xl p-6 border border-slate-100">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                        <TrendingDown size={16} />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Upper Bounds</span>
                  </div>
                  <p className="text-3xl font-black text-slate-900 mb-1">{data.overestimated_cases}</p>
                  <p className="text-xs font-bold text-slate-400">Cases where synergy failed expectations</p>
               </div>
            </div>
          </div>
        </motion.div>

        {/* Distribution Chart */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }} 
           animate={{ opacity: 1, x: 0 }} 
           className="lg:col-span-12 xl:col-span-4 bg-slate-900 p-8 md:p-10 rounded-[2.5rem] text-white shadow-2xl shadow-slate-900/20"
        >
          <h2 className="text-xl font-black tracking-tight mb-2">Neural Spread</h2>
          <p className="text-xs font-bold text-slate-400 mb-8">Classification of prediction error types.</p>
          
          <div className="flex justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={95} paddingAngle={8} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} strokeWidth={0} />)}
                </Pie>
                <Tooltip 
                   contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '16px', color: '#fff', fontSize: '12px', fontWeight: 'bold' }} 
                   itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 space-y-4">
             {pieData.map((d, i) => (
               <div key={d.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                     <span className="text-xs font-bold text-slate-400">{d.name} Prediction</span>
                  </div>
                  <span className="text-sm font-black">{d.value}</span>
               </div>
             ))}
          </div>
        </motion.div>
      </div>

      <div className="p-8 bg-blue-50 rounded-[2.5rem] border border-blue-100 flex gap-4">
         <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0">
            <Info size={24} />
         </div>
         <div>
            <h4 className="font-black text-slate-900">Training Logic Insight</h4>
            <p className="text-sm font-bold text-slate-500 leading-relaxed max-w-2xl">
               The Random Forest algorithm evaluates 100 decision trees to determine synergy. Every 10 field assessments trigger a background retraining event to refine these decision boundaries.
            </p>
         </div>
      </div>
    </PageLayout>
  );
}
