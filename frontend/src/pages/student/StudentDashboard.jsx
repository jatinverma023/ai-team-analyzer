import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Brain, TrendingUp, Activity, Star, 
  Target, ShieldCheck, 
  ChevronRight, User
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import SkillRadarChart from '../../components/SkillRadarChart';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import { Link } from 'react-router-dom';

// Generate skill-based progress data from actual profile
const buildProgressData = (s) => {
  if (!s?.skills) return [];
  const base = Math.round(s.overall_skill_score * 10);
  return [
    { name: 'Coding', score: (s.skills.coding || 0) * 10, avg: base },
    { name: 'Design', score: (s.skills.design || 0) * 10, avg: base },
    { name: 'Comm.', score: (s.skills.communication || 0) * 10, avg: base },
    { name: 'Leadership', score: (s.skills.leadership || 0) * 10, avg: base },
    { name: 'Reliability', score: Math.round((s.reliability || 0) * 100), avg: base },
    { name: 'Overall', score: base, avg: base },
  ];
};

// Return a real label based on the score value
const getScoreLabel = (score) => {
  if (score >= 8) return 'Expert Level';
  if (score >= 6) return 'Proficient';
  if (score >= 4) return 'Developing';
  return 'Beginner';
};

const getReliabilityLabel = (rel) => {
  if (rel >= 0.85) return 'Highly Dependable';
  if (rel >= 0.7) return 'Dependable';
  if (rel >= 0.5) return 'Moderate';
  return 'Needs Improvement';
};

export default function StudentDashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/student/personal-summary')
      .then(r => setSummary(r.data))
      .catch(() => setSummary(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Analyzing your progress..." /></PageLayout>;

  const skillLabels = { coding: 'Coding', design: 'Design', communication: 'Communication', leadership: 'Leadership' };

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Hello, <span className="text-blue-600">{summary?.name?.split(' ')[0] || 'Student'}</span> 👋
          </h1>
          <p className="text-slate-500 font-medium">Here's your performance report for this semester.</p>
        </div>
      </div>

      {summary ? (
        <div className="space-y-8">
          {/* Key Metrics Grid — all real data, no fake subs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <StatCard 
              icon={Activity} 
              label="Overall Score" 
              value={`${summary.overall_skill_score}/10`} 
              sub={getScoreLabel(summary.overall_skill_score)}
              color="blue" 
              delay={0} 
            />
            <StatCard 
              icon={Star} 
              label="Strongest Skill" 
              value={skillLabels[summary.strongest_skill]} 
              sub={`Score: ${summary.skills?.[summary.strongest_skill] || 0}/10`}
              color="emerald" 
              delay={0.1} 
            />
            <StatCard 
              icon={Target} 
              label="Focus Area" 
              value={skillLabels[summary.weakest_skill]} 
              sub={`Score: ${summary.skills?.[summary.weakest_skill] || 0}/10`}
              color="amber" 
              delay={0.2} 
            />
            <StatCard 
              icon={ShieldCheck} 
              label="Reliability" 
              value={`${Math.round(summary.reliability * 100)}%`} 
              sub={getReliabilityLabel(summary.reliability)}
              color="rose" 
              delay={0.3} 
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Main Progress Chart (Large) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="lg:col-span-8 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Performance Index</h2>
                  <p className="text-slate-500 text-sm">Skill-by-skill performance breakdown</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-wider">
                  Current Semester
                </span>
              </div>

              <div className="h-[250px] sm:h-[340px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={buildProgressData(summary)}>
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      animationDuration={2000}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="avg" 
                      stroke="#94a3b8" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fill="none" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Radar / Skills Insight (Right) */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="lg:col-span-4 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-center justify-center text-center"
            >
              <h2 className="text-xl font-bold text-slate-900 mb-1">Skill DNA</h2>
              <p className="text-slate-500 text-sm mb-6">Visual breakdown of core skills</p>
              
              <SkillRadarChart
                coding={summary.skills?.coding}
                design={summary.skills?.design}
                communication={summary.skills?.communication}
                leadership={summary.skills?.leadership}
                reliability={summary.reliability}
              />

              <div className="w-full space-y-3 mt-6">
                 {Object.entries(summary.skills || {}).map(([key, val], idx) => (
                    <div key={key} className="flex items-center gap-3">
                        <span className="w-16 text-[10px] font-extrabold text-slate-400 uppercase text-right">{key}</span>
                        <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                           <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${val * 10}%` }}
                            transition={{ delay: 0.7 + (idx * 0.1), duration: 1.5 }}
                            className="h-full bg-blue-600 rounded-full"
                           />
                        </div>
                    </div>
                 ))}
              </div>
            </motion.div>
          </div>

          {/* Bottom Grid: Activity & Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             {/* Skills Summary */}
             <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="lg:col-span-7 bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm"
            >
               <h2 className="text-xl font-bold text-slate-900 mb-6">Skills Summary</h2>
                 <div className="space-y-6">
                  {[
                    { label: `Strongest: ${skillLabels[summary.strongest_skill]}`, date: `Score: ${summary.skills?.[summary.strongest_skill]}/10`, icon: Star },
                    { label: `Focus Area: ${skillLabels[summary.weakest_skill]}`, date: `Score: ${summary.skills?.[summary.weakest_skill]}/10`, icon: Target },
                    { label: `Reliability Index`, date: `${Math.round(summary.reliability * 100)}% dependable`, icon: Activity },
                  ].map((act, i) => (
                    <div key={i} className="flex items-center gap-4 group">
                       <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                         <act.icon size={20} />
                       </div>
                       <div className="flex-1">
                         <p className="text-sm font-bold text-slate-900">{act.label}</p>
                         <p className="text-xs text-slate-500">{act.date}</p>
                       </div>
                       <ChevronRight size={18} className="text-slate-300" />
                    </div>
                  ))}
                 </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4"
            >
               {[
                  { to: '/student/team', label: 'My Team', icon: Star, color: 'blue' },
                  { to: '/student/ml-score', label: 'ML Insights', icon: Brain, color: 'violet' },
                  { to: '/student/growth', label: 'Growth Plan', icon: TrendingUp, color: 'emerald' },
                  { to: '/student/profile', label: 'Edit Profile', icon: User, color: 'slate' },
               ].map((action, i) => (
                 <Link 
                  key={i} 
                  to={action.to}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all text-center flex flex-col items-center justify-center group"
                >
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all mb-4">
                      <action.icon size={24} />
                    </div>
                    <span className="text-sm font-extrabold text-slate-500 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{action.label}</span>
                 </Link>
               ))}
            </motion.div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <User size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Setup Required</h2>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">
            We need a bit more data to analyze your skills. Please complete your profile to unlock insights.
          </p>
          <Link to="/student/profile" className="blueflame-btn inline-flex items-center gap-2">
            Complete Profile <ChevronRight size={18} />
          </Link>
        </div>
      )}
    </PageLayout>
  );
}
