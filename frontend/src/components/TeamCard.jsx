import { motion, AnimatePresence } from 'framer-motion';

export default function TeamCard({ team, expanded, setExpanded, index }) {
  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className="bg-white rounded-3xl border p-6 shadow-sm"
    >
      <button
        onClick={() => setExpanded(expanded === index ? null : index)}
        className="w-full flex justify-between items-center"
      >
        <div>
          <p className="text-lg font-black text-left">
            {team.team_name || `Team ${team.team_number}`}
          </p>
          <p className="text-xs text-slate-400 text-left">
            {team.members.length} Members
          </p>
        </div>

        <p className="text-blue-600 font-black">
          {Math.round(team.ml_compatibility_score * 100)}%
        </p>
      </button>

      <AnimatePresence>
        {expanded === index && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 space-y-3"
          >
            {team.members.map(m => (
              <div key={m.id} className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{m.name}</span>
                <span className="text-slate-400 font-bold uppercase text-[10px] tracking-widest">{m.specialty}</span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
