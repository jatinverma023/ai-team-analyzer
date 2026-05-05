import { motion } from 'framer-motion';

export default function StatCard({ icon: Icon, label, value, sub, color = 'blue', delay = 0 }) {
  const accentColors = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5, type: 'spring' }}
      className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group"
    >
      <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
        <div className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl ${accentColors[color] || accentColors.blue} transition-transform group-hover:scale-110 duration-300`}>
          {Icon && <Icon size={20} className="sm:w-6 sm:h-6" />}
        </div>
        {sub && (
          <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
            <span className="w-1 h-1 rounded-full bg-emerald-500" />
            <span className="truncate max-w-[100px] sm:max-w-none">{sub}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-slate-500 text-xs sm:text-sm font-bold tracking-tight mb-1 uppercase">{label}</p>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tighter truncate">
          {value ?? '—'}
        </h3>
      </div>
    </motion.div>
  );
}
