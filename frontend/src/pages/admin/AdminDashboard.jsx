import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, BarChart3, FileText, Activity, ChevronRight, Database } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageLayout from '../../components/PageLayout';
import StatCard from '../../components/StatCard';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';

const actionColorClasses = {
  blue: {
    icon: 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white',
  },
  violet: {
    icon: 'bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white',
  },
};

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/overview').then(r => setData(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Loading admin overview..." /></PageLayout>;

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">Admin Panel</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tighter">System <span className="text-blue-600">Overview</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Monitor platform health, users, and ML model performance.</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <StatCard icon={Users} label="Total Users" value={data?.total_users} sub="All accounts" color="blue" delay={0} />
        <StatCard icon={Users} label="Students" value={data?.total_students} sub="Enrolled" color="emerald" delay={0.05} />
        <StatCard icon={Shield} label="Teachers" value={data?.total_teachers} sub="Faculty" color="violet" delay={0.1} />
        <StatCard icon={FileText} label="Team Documents" value={data?.total_team_documents} sub="Generated" color="amber" delay={0.15} />
        <StatCard icon={BarChart3} label="Feedback Entries" value={data?.total_feedback_entries} sub="Verified" color="rose" delay={0.2} />
      </div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h2 className="text-xl font-bold text-slate-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {[
            { to: '/admin/users', label: 'User Management', desc: 'View, search, and manage user access', icon: Users, color: 'blue' },
            { to: '/admin/model', label: 'Model Monitoring', desc: 'Check ML accuracy & trigger retraining', icon: Activity, color: 'violet' },
          ].map(({ to, label, desc, icon: Icon, color }) => (
            <Link
              key={to}
              to={to}
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group flex items-center gap-6"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 ${actionColorClasses[color].icon}`}>
                <Icon size={28} />
              </div>
              <div className="flex-1">
                <p className="text-lg font-black text-slate-900 group-hover:text-blue-600 transition-colors">{label}</p>
                <p className="text-slate-500 text-sm font-medium mt-1">{desc}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <ChevronRight size={20} />
              </div>
            </Link>
          ))}
        </div>
      </motion.div>
    </PageLayout>
  );
}
