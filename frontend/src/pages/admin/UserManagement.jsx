import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Ban, AlertTriangle, CheckCircle, Users, ShieldCheck, ShieldOff, Mail } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmAction, setConfirmAction] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    api.get('/admin/all-users')
      .then(r => setUsers(r.data))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleBan = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      await api.put(`/admin/ban-user/${confirmAction.user._id}`);
      setUsers(users.map(u => u._id === confirmAction.user._id ? { ...u, is_active: false } : u));
      toast.success(`${confirmAction.user.name} has been banned.`);
      setConfirmAction(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to ban user');
    } finally {
      setProcessing(false);
    }
  };

  const handleUnban = async () => {
    if (!confirmAction) return;
    setProcessing(true);
    try {
      await api.put(`/admin/unban-user/${confirmAction.user._id}`);
      setUsers(users.map(u => u._id === confirmAction.user._id ? { ...u, is_active: true } : u));
      toast.success(`${confirmAction.user.name} has been re-enabled.`);
      setConfirmAction(null);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to unban user');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <PageLayout><LoadingSpinner text="Loading users..." /></PageLayout>;

  return (
    <PageLayout>
      <header className="mb-6 sm:mb-10">
        <div className="flex items-center gap-3 mb-2">
          <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">Access Control</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tighter">User <span className="text-blue-600">Management</span></h1>
        <p className="text-slate-500 mt-2 font-medium text-sm sm:text-base">{users.length} users registered · Manage access control</p>
      </header>

      {/* Search */}
      <div className="relative mb-6 sm:mb-8">
        <Search size={18} className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full h-12 sm:h-14 bg-white border border-slate-100 rounded-xl sm:rounded-2xl pl-12 sm:pl-14 pr-4 sm:pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm text-sm sm:text-base"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ====== DESKTOP TABLE (hidden on mobile) ====== */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="hidden md:block bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50">
                {['User', 'Email', 'Role', 'Status', 'Action'].map(h => (
                  <th key={h} className="px-6 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-50 hover:bg-slate-50/50 transition-all"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                        {u.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-slate-900 font-bold">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <Mail size={12} />
                      <span className="text-xs font-medium">{u.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      u.role === 'teacher' ? 'bg-violet-50 text-violet-600' :
                      u.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                      'bg-emerald-50 text-emerald-600'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active !== false ? (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider w-fit">
                        <ShieldCheck size={12} /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider w-fit">
                        <ShieldOff size={12} /> Banned
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {u.is_active !== false ? (
                      <button
                        onClick={() => setConfirmAction({ user: u, action: 'ban' })}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-black hover:bg-red-600 hover:text-white transition-all active:scale-95 min-h-[44px]"
                      >
                        <Ban size={13} /> Ban
                      </button>
                    ) : (
                      <button
                        onClick={() => setConfirmAction({ user: u, action: 'unban' })}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black hover:bg-emerald-600 hover:text-white transition-all active:scale-95 min-h-[44px]"
                      >
                        <CheckCircle size={13} /> Unban
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* ====== MOBILE CARD LIST (hidden on desktop) ====== */}
      <div className="md:hidden space-y-3">
        {filtered.map((u, i) => (
          <motion.div
            key={u._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs">
                  {u.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900 truncate">{u.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                u.role === 'teacher' ? 'bg-violet-50 text-violet-600' :
                u.role === 'admin' ? 'bg-rose-50 text-rose-600' :
                'bg-emerald-50 text-emerald-600'
              }`}>
                {u.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              {u.is_active !== false ? (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                  <ShieldCheck size={11} /> Active
                </span>
              ) : (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-[10px] font-black uppercase">
                  <ShieldOff size={11} /> Banned
                </span>
              )}
              {u.is_active !== false ? (
                <button
                  onClick={() => setConfirmAction({ user: u, action: 'ban' })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 text-red-600 text-xs font-black active:scale-95 transition-all min-h-[44px]"
                >
                  <Ban size={13} /> Ban
                </button>
              ) : (
                <button
                  onClick={() => setConfirmAction({ user: u, action: 'unban' })}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-black active:scale-95 transition-all min-h-[44px]"
                >
                  <CheckCircle size={13} /> Unban
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <Users size={40} className="text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-bold">No users found</p>
        </div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirmAction && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setConfirmAction(null)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white p-6 sm:p-8 rounded-t-3xl sm:rounded-[2.5rem] border border-slate-100 shadow-2xl max-w-sm w-full"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className={`p-3 rounded-2xl shrink-0 ${confirmAction.action === 'ban' ? 'bg-red-50' : 'bg-emerald-50'}`}>
                  <AlertTriangle size={24} className={confirmAction.action === 'ban' ? 'text-red-600' : 'text-emerald-600'} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {confirmAction.action === 'ban' ? 'Confirm Ban' : 'Confirm Unban'}
                  </h3>
                  <p className="text-slate-500 text-sm mt-2 font-medium">
                    {confirmAction.action === 'ban' 
                      ? <>Are you sure you want to disable <strong className="text-slate-900">{confirmAction.user.name}</strong>?</>
                      : <>Re-enable <strong className="text-slate-900">{confirmAction.user.name}</strong>?</>
                    }
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmAction(null)}
                  className="flex-1 h-12 sm:h-14 bg-slate-50 hover:bg-slate-100 text-slate-900 font-bold rounded-2xl border border-slate-100 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmAction.action === 'ban' ? handleBan : handleUnban}
                  disabled={processing}
                  className={`flex-1 h-12 sm:h-14 font-black rounded-2xl transition-all disabled:opacity-50 active:scale-95 ${
                    confirmAction.action === 'ban'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700'
                  }`}
                >
                  {processing ? 'Processing...' : confirmAction.action === 'ban' ? 'Yes, Ban' : 'Yes, Unban'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}
