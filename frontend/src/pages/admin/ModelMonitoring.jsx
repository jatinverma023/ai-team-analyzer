import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, RefreshCw, Loader2, Target, TrendingUp, TrendingDown, Brain, CheckCircle2 } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ModelMonitoring() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retraining, setRetraining] = useState(false);
  const [noData, setNoData] = useState(false);

  const fetchData = () => {
    setLoading(true);
    api.get('/admin/model-monitoring')
      .then(r => {
        if (r.data.message) setNoData(true);
        else { setData(r.data); setNoData(false); }
      })
      .catch(() => setNoData(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleRetrain = async () => {
    setRetraining(true);
    try {
      const res = await api.post('/admin/retrain-model');
      toast.success(`Retrain: ${res.data.status}`);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Retraining failed');
    } finally {
      setRetraining(false);
    }
  };

  if (loading) return <PageLayout><LoadingSpinner text="Loading model stats..." /></PageLayout>;

  const COLORS = ['#f59e0b', '#ef4444', '#10b981'];

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">ML Operations</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Model <span className="text-blue-600">Monitoring</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Random Forest model health and prediction performance.</p>
          </div>
          <button
            onClick={handleRetrain}
            disabled={retraining}
            className="h-14 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest px-8 rounded-2xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {retraining
              ? <><Loader2 size={18} className="animate-spin" /> Retraining...</>
              : <><RefreshCw size={18} /> Force Retrain</>}
          </button>
        </div>
      </header>

      {noData || !data ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 shadow-sm text-center max-w-2xl mx-auto">
          <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-300 mx-auto mb-6">
            <Activity size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No Evaluation Data</h2>
          <p className="text-slate-500 font-medium mb-8">Submit at least 10 team feedback entries to see model metrics.</p>
          <div className="bg-blue-50/50 p-4 rounded-2xl text-blue-600 text-sm font-bold inline-block border border-blue-100/50">
            The model retrains automatically after every 10 feedback entries.
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={Target} label="Total Evaluations" value={data.total_evaluations} sub="Matched pairs" color="blue" delay={0} />
            <StatCard icon={Activity} label="Model Accuracy" value={`${data.model_accuracy_percent}%`} sub={data.model_accuracy_percent >= 70 ? 'Healthy' : 'Needs data'} color="emerald" delay={0.05} />
            <StatCard icon={TrendingUp} label="Avg Error" value={data.average_prediction_error?.toFixed(3)} sub="Mean absolute" color="amber" delay={0.1} />
            <StatCard icon={TrendingDown} label="Overestimated" value={data.overestimated_cases} sub="Predictions" color="rose" delay={0.15} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Accuracy Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="lg:col-span-7 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">Model Accuracy</h2>
              <p className="text-slate-400 text-sm font-medium mb-8">Overall prediction performance indicator</p>

              <div className="flex items-end gap-3 mb-6">
                <span className="text-6xl font-black text-slate-900">
                  {data.model_accuracy_percent}<span className="text-3xl text-slate-400">%</span>
                </span>
              </div>

              <div className="h-4 bg-slate-50 rounded-full overflow-hidden mb-4 border border-slate-100">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.model_accuracy_percent}%` }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  className={`h-full rounded-full ${
                    data.model_accuracy_percent >= 70
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                      : data.model_accuracy_percent >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-red-500 to-rose-500'
                  }`}
                />
              </div>

              <p className="text-slate-500 text-sm font-bold mb-8">
                {data.model_accuracy_percent >= 70
                  ? '✅ Model performing well — predictions are reliable'
                  : data.model_accuracy_percent >= 50
                  ? '⚠️ Model needs more training data for better accuracy'
                  : '❌ Consider retraining with more feedback data'}
              </p>

              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Prediction Summary</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-amber-500 font-black text-2xl">{data.underestimated_cases}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Underestimated</p>
                  </div>
                  <div>
                    <p className="text-red-500 font-black text-2xl">{data.overestimated_cases}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Overestimated</p>
                  </div>
                  <div>
                    <p className="text-emerald-500 font-black text-2xl">
                      {data.total_evaluations - data.underestimated_cases - data.overestimated_cases}
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Accurate</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="lg:col-span-5 bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-2">Prediction Distribution</h2>
              <p className="text-slate-400 text-sm font-medium mb-6">Breakdown of prediction accuracy</p>

              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Underestimated', value: data.underestimated_cases },
                      { name: 'Overestimated', value: data.overestimated_cases },
                      { name: 'Accurate', value: Math.max(0, data.total_evaluations - data.underestimated_cases - data.overestimated_cases) },
                    ].filter(d => d.value > 0)}
                    cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={4} dataKey="value"
                  >
                    {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#ffffff',
                      border: '1px solid #f1f5f9',
                      borderRadius: '16px',
                      color: '#0f172a',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    }}
                  />
                  <Legend
                    formatter={(v) => <span style={{ color: '#64748b', fontSize: '12px', fontWeight: 700 }}>{v}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="mt-6 p-5 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-center gap-4">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                  <Brain size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-0.5">Auto-Retrain</p>
                  <p className="text-xs font-bold text-blue-900/60">Model updates every 10 feedback entries</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
