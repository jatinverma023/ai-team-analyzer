import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, Brain,
  Settings2, Sparkles, ShieldCheck, Filter,
  RefreshCw, Hash, Layers
} from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import TeamCard from '../../components/TeamCard';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function GenerateTeams() {
  const [mode, setMode] = useState('size'); // 'size' or 'count'
  const [teamSize, setTeamSize] = useState(3);
  const [numTeams, setNumTeams] = useState(2);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [expanded, setExpanded] = useState(null);

  const handleGenerate = async () => {
    if (mode === 'size' && teamSize < 2) return toast.error('Team size must be at least 2');
    if (mode === 'count' && numTeams < 1) return toast.error('Need at least 1 team');
    setLoading(true);
    setResult(null);
    try {
      const payload = mode === 'size'
        ? { mode: 'size', team_size: teamSize }
        : { mode: 'count', num_teams: numTeams };
      const res = await api.post('/teacher/generate-teams', payload);
      setResult(res.data);
      toast.success(`Successfully calibrated ${res.data.total_teams} teams!`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Engine calibration failed');
    } finally {
      setLoading(false);
    }
  };

  const confidence = mode === 'size' 
    ? Math.min(90 + teamSize, 99) 
    : Math.min(88 + numTeams * 2, 99);

  return (
    <PageLayout>
      <header className="mb-10">
        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">
          Formation Engine
        </span>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 mt-3">
          Team <span className="text-blue-600">Architect</span>
        </h1>

        <p className="text-slate-500 mt-2 font-medium">
          Algorithmic distribution based on student skill weights and reliability.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">

        {/* ================= LEFT PANEL ================= */}
        <motion.div 
          whileHover={{ y: -5 }}
          className="lg:col-span-4 bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center">
              <Settings2 size={20} />
            </div>
            <h2 className="text-lg font-black">Calibration</h2>
          </div>

          <div className="space-y-6">

            {/* MODE TOGGLE */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Formation Mode</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setMode('size')}
                  className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-xs font-black transition-all ${
                    mode === 'size'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Layers size={14} /> By Size
                </button>
                <button
                  onClick={() => setMode('count')}
                  className={`flex items-center justify-center gap-2 h-12 rounded-2xl text-xs font-black transition-all ${
                    mode === 'count'
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <Hash size={14} /> By Count
                </button>
              </div>
            </div>

            {/* SLIDER — changes based on mode */}
            <div>
              {mode === 'size' ? (
                <>
                  <div className="flex justify-between mb-3 text-xs font-black text-slate-400 uppercase">
                    <span>Members Per Team</span>
                    <span className="text-blue-600">{teamSize} Members</span>
                  </div>
                  <input
                    type="range"
                    min={2}
                    max={10}
                    value={teamSize}
                    onChange={e => setTeamSize(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-blue-100 to-blue-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2 mt-4">
                    {Array.from({ length: teamSize }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow"
                      >
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between mb-3 text-xs font-black text-slate-400 uppercase">
                    <span>Number of Teams</span>
                    <span className="text-blue-600">{numTeams} Teams</span>
                  </div>
                  <input
                    type="range"
                    min={1}
                    max={10}
                    value={numTeams}
                    onChange={e => setNumTeams(parseInt(e.target.value))}
                    className="w-full h-2 bg-gradient-to-r from-violet-100 to-violet-500 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex gap-2 mt-4">
                    {Array.from({ length: numTeams }).map((_, i) => (
                      <div 
                        key={i}
                        className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-500 to-purple-600 text-white flex items-center justify-center text-xs font-bold shadow"
                      >
                        T{i + 1}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* AI INSIGHT */}
            <div className="p-4 rounded-3xl bg-blue-50 border border-blue-100">
              <div className="flex gap-2 mb-2">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-xs font-black text-blue-600">AI Insight</span>
              </div>

              <p className="text-xs font-bold text-blue-900/70">
                {mode === 'size' && teamSize <= 3 && "Small teams → fast execution & ownership."}
                {mode === 'size' && teamSize > 3 && teamSize <= 6 && "Balanced teams → best collaboration."}
                {mode === 'size' && teamSize > 6 && "Larger teams → diverse skills but coordination needed."}
                {mode === 'count' && numTeams <= 2 && "Few teams → larger groups with more diversity."}
                {mode === 'count' && numTeams > 2 && numTeams <= 5 && "Moderate split → good balance of size and count."}
                {mode === 'count' && numTeams > 5 && "Many teams → smaller focused groups."}
              </p>

              {/* CONFIDENCE BAR */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] font-bold text-slate-400">
                  <span>AI Confidence</span>
                  <span className="text-blue-600">{confidence}%</span>
                </div>
                <div className="w-full h-1 bg-slate-200 rounded-full mt-1">
                  <div 
                    className="h-full bg-blue-600 rounded-full transition-all"
                    style={{ width: `${confidence}%` }}
                  />
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <button 
              onClick={handleGenerate} 
              disabled={loading}
              className={`w-full h-14 rounded-2xl font-black flex items-center justify-center gap-2 transition-all ${
                loading 
                  ? 'bg-slate-100 text-slate-400' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:scale-[1.02]'
              }`}
            >
              {loading ? (
                <><RefreshCw size={18} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={18} /> Generate AI Teams</>
              )}
            </button>
          </div>
        </motion.div>

        {/* ================= RIGHT PANEL ================= */}
        {result && (
          <div className="lg:col-span-8 space-y-6">

            {/* STATS */}
            <div className="flex gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
              {[
                { label: 'Total Pool', val: result.total_students, icon: Users },
                { label: 'Teams', val: result.total_teams, icon: ShieldCheck },
                { label: 'Size', val: result.team_size, icon: Filter },
              ].map(({ label, val, icon: Icon }) => (
                <div key={label} className="flex-1 bg-white p-5 rounded-3xl border shadow-sm">
                  <Icon size={14} className="text-blue-600 mb-2" />
                  <p className="text-xs text-slate-400">{label}</p>
                  <p className="text-2xl font-black">{val}</p>
                </div>
              ))}
            </div>

            {/* TEAMS */}
            {result.teams?.map((team, i) => (
              <TeamCard key={i} team={team} index={i} expanded={expanded} setExpanded={setExpanded} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}