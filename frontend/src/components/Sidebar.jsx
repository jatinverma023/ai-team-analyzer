import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSidebar } from '../context/SidebarContext';
import {
  LayoutDashboard, Users, Zap, History, MessageSquare,
  BarChart3, LogOut, User, Shield,
  TrendingUp, CheckCircle2, Brain, UserCog, Activity,
  ChevronLeft, ChevronRight, Flame
} from 'lucide-react';

const studentNav = [
  { to: '/student', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/student/team', label: 'My Team', icon: Users },
  { to: '/student/ml-score', label: 'ML Score', icon: Brain },
  { to: '/student/growth', label: 'Growth Plan', icon: TrendingUp },
  { to: '/student/compatibility', label: 'Check Compatibility', icon: CheckCircle2 },
  { to: '/student/profile', label: 'Update Profile', icon: UserCog },
];

const teacherNav = [
  { to: '/teacher', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/teacher/students', label: 'Students', icon: Users },
  { to: '/teacher/generate', label: 'Generate Teams', icon: Zap },
  { to: '/teacher/teams', label: 'Team History', icon: History },
  { to: '/teacher/feedback', label: 'Submit Feedback', icon: MessageSquare },
  { to: '/teacher/model-accuracy', label: 'Model Accuracy', icon: BarChart3 },
  { to: '/teacher/compatibility', label: 'Compatibility', icon: CheckCircle2 },
];

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'User Management', icon: Users },
  { to: '/admin/model', label: 'Model Monitoring', icon: Activity },
];

const roleConfig = {
  student: { nav: studentNav, label: 'Student', icon: User },
  teacher: { nav: teacherNav, label: 'Teacher', icon: Shield },
  admin: { nav: adminNav, label: 'Admin', icon: Shield },
};

export default function Sidebar() {
  const { role, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();
  const navigate = useNavigate();
  const config = roleConfig[role] || roleConfig.student;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 80 : 280 }}
      transition={{ duration: 0.4, type: 'spring', damping: 20 }}
      className="fixed top-0 left-0 h-screen bg-white border-r border-slate-100 flex flex-col z-40 overflow-hidden shadow-[4px_0_24px_rgba(0,0,0,0.02)]"
    >
      {/* Header / Logo Section */}
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="shrink-0 w-10 h-10 rounded-2xl bg-[#2563eb] flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Flame size={22} className="text-white" />
        </div>
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col"
            >
              <span className="text-base font-black tracking-tight text-slate-900 leading-none uppercase">AI TEAM</span>
              <span className="text-xs font-bold text-blue-600 tracking-[0.2em] mt-0.5 uppercase">Analyzer</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation section */}
      <div className="flex-1 px-4 space-y-1.5 overflow-y-auto">
        <p className={`text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-4 transition-opacity duration-300 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          Main menu
        </p>
        {config.nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                isActive
                  ? 'bg-blue-50 text-blue-700 shadow-sm shadow-blue-500/5'
                  : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={`shrink-0 transition-colors ${isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -5 }}
                      className="text-[15px] font-semibold truncate"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && !collapsed && (
                   <motion.div 
                    layoutId="active-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600"
                   />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>

      {/* Bottom section: User & Logout */}
      <div className="p-4 border-t border-slate-50">
        <div className={`p-3 rounded-2xl bg-slate-50 mb-3 flex items-center transition-all ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs">
            {role?.[0]?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 truncate capitalize">{role}</span>
              <span className="text-[10px] font-medium text-slate-500 truncate lowercase">session active</span>
            </div>
          )}
        </div>
        
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span className="text-[15px] font-semibold">Log out</span>}
        </button>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="mt-4 w-full h-8 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </motion.aside>
  );
}
