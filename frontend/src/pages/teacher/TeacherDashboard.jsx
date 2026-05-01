import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Zap, BarChart3, Activity, 
  TrendingUp, Calendar, ArrowUpRight, 
  ChevronRight, LayoutDashboard, Database
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, CartesianGrid, Cell,
  AreaChart, Area
} from 'recharts';

export default function TeacherDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/teacher/dashboard-overview')
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Analyzing Class Data..." /></PageLayout>;

  const chartData = data ? [
    { name: 'ML Prediction', value: Math.round(data.avg_ml_score * 100), color: '#2563eb' },
    { name: 'Actual Performance', value: Math.round(data.avg_actual_performance * 10), color: '#10b981' },
  ] : [];

  const trendData = data ? [
    { name: 'Students', score: data.total_students * 5 },
    { name: 'Teams', score: data.total_team_generations * 15 },
    { name: 'Feedback', score: data.total_feedback_entries * 10 },
    { name: 'ML Score', score: Math.round(data.avg_ml_score * 100) },
    { name: 'Actual', score: Math.round(data.avg_actual_performance * 10) },
  ] : [];

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Faculty Overview</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Academic <span className="text-blue-600">Analytics Hub</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Monitor project success, model accuracy, and student synergy in real-time.</p>
          </div>
          <button className="h-12 px-6 bg-slate-900 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200">
            <Database size={18} /> Export Results
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard icon={Users} label="Total Students" value={data?.total_students} sub="Enrolled members" color="blue" delay={0} />
        <StatCard icon={Zap} label="Generations" value={data?.total_team_generations} sub="AI Formations" color="violet" delay={0.1} />
        <StatCard icon={BarChart3} label="Evaluations" value={data?.total_feedback_entries} sub="Verified entries" color="emerald" delay={0.2} />
        <StatCard icon={Activity} label="Model Health" value={data ? `${Math.round(data.avg_ml_score * 100)}%` : '—'} sub="Prediction accuracy" color="amber" delay={0.3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* ML vs Actual Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="lg:col-span-7 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">System Performance Index</h2>
              <p className="text-slate-400 text-sm font-medium">Predicted vs Verified Synergy</p>
            </div>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                Current Batch
              </span>
            </div>
          </div>

          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barSize={60} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700, fontFamily: 'Inter' }}
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  dx={-10}
                />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px 20px'
                  }}
                  itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                />
                <Bar dataKey="value" radius={[15, 15, 15, 15]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Class Sentiment/Growth Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="lg:col-span-5 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Progress Trajectory</h2>
            <p className="text-slate-400 text-sm font-medium">Weekly collective proficiency</p>
          </div>

          <div className="flex-1 h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorScore)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-8 p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-center justify-between group cursor-pointer">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Growth Action</p>
              <h3 className="text-sm font-bold text-slate-900">Review Student Roster</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
              <ChevronRight size={20} />
            </div>
          </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
