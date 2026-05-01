import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Search, Loader2, User, Users, ShieldCheck, Zap, Sparkles, AlertCircle, Brain } from "lucide-react";
import PageLayout from "../../components/PageLayout";
import MLScoreGauge from "../../components/MLScoreGauge";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function CheckCompatibility() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get("/student/all-students")
      .then((r) => setStudents(r.data))
      .catch(() => {});
  }, []);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleCheck = async () => {
    if (!selected) return toast.error("Select a technical candidate first!");
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post(
        `/student/check-compatibility?teammate_id=${selected._id}`,
      );
      setResult(res.data);
    } catch (err) {
      toast.error(
        err.response?.data?.detail || "Synergy analysis failed. Reconnecting...",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Synergy Engine</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Teammate <span className="text-blue-600">Compatibility Check</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Predict project success by analyzing skill-set alignment with our ML engine.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Candidate List */}
        <motion.div
           initial={{ opacity: 0, x: -20 }}
           animate={{ opacity: 1, x: 0 }}
           className="lg:col-span-5 space-y-6"
        >
           <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h2 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                 <Users size={18} className="text-blue-600" /> Candidate Directory
              </h2>
              
              <div className="relative mb-6">
                <Search
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  className="w-full h-14 pl-12 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all"
                  placeholder="Search by name or email hash..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
                {filtered.length === 0 && (
                  <div className="text-center py-20 border-2 border-dashed border-slate-50 rounded-3xl">
                     <AlertCircle size={30} className="text-slate-200 mx-auto mb-3" />
                     <p className="text-slate-400 font-bold uppercase tracking-tighter text-[10px]">No matches found</p>
                  </div>
                )}
                {filtered.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => {
                      setSelected(s);
                      setResult(null);
                    }}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 group ${
                      selected?._id === s._id
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                        : "bg-slate-50 hover:bg-white hover:shadow-md border border-transparent hover:border-blue-100"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-colors ${
                       selected?._id === s._id ? "bg-white/20 text-white" : "bg-white text-blue-600"
                    }`}>
                      {s.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-black truncate ${selected?._id === s._id ? "text-white" : "text-slate-900"}`}>
                        {s.name}
                      </p>
                      <p className={`text-[10px] uppercase font-bold tracking-tight truncate ${selected?._id === s._id ? "text-blue-200" : "text-slate-400"}`}>
                        {s.email}
                      </p>
                    </div>
                    {selected?._id === s._id && (
                       <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-blue-600">
                          <CheckCircle2 size={12} strokeWidth={4} />
                       </div>
                    )}
                  </button>
                ))}
              </div>

              <button
                onClick={handleCheck}
                disabled={!selected || loading}
                className="w-full h-16 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 flex items-center justify-center gap-3 transition-all mt-6 active:scale-[0.98]"
              >
                {loading ? (
                  <><Loader2 size={18} className="animate-spin" /> Neural Sync...</>
                ) : (
                  <><Zap size={18} /> Analyze Alignment</>
                )}
              </button>
           </div>
        </motion.div>

        {/* Prediction Results */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-7"
        >
           <div className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm min-h-[640px] flex flex-col items-center justify-center relative overflow-hidden">
              <Sparkles className="absolute top-10 right-10 text-slate-50" size={100} />
              
              {!result && !loading && (
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 mx-auto mb-8 border border-slate-100">
                    <User size={48} />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Awaiting Candidate</h3>
                  <p className="text-slate-500 font-medium">Select a student from the directory to initialize the synergy prediction algorithm.</p>
                </div>
              )}

              {loading && (
                <div className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-10">
                     <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 border-t-4 border-blue-600 rounded-full"
                     />
                     <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-4 border-b-4 border-emerald-500 rounded-full opacity-50"
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <Brain size={40} className="text-blue-600 animate-pulse" />
                     </div>
                  </div>
                  <p className="text-lg font-black text-slate-900">Synchronizing Vectors</p>
                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Running Random Forest Analysis</p>
                </div>
              )}

              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full flex flex-col items-center"
                >
                  <div className="flex items-center gap-12 mb-16 relative">
                     <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-blue-50 rounded-full blur-2xl" />
                     
                     <div className="z-10 text-center space-y-4">
                        <div className="w-24 h-24 rounded-[2rem] bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-blue-500/30">
                          {result.student_1?.[0]}
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                          You
                        </p>
                     </div>

                     <div className="z-10 flex flex-col items-center gap-2">
                        <div className="px-5 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">Match</div>
                        <div className="h-px w-20 bg-slate-100" />
                     </div>

                     <div className="z-10 text-center space-y-4">
                        <div className="w-24 h-24 rounded-[2rem] bg-slate-900 flex items-center justify-center text-white font-black text-3xl shadow-xl shadow-black/10">
                          {result.student_2?.[0]}
                        </div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tighter">
                          Candidate
                        </p>
                     </div>
                  </div>

                  <div className="relative mb-12">
                     <MLScoreGauge score={result.compatibility_score} size={280} />
                     <div className="absolute inset-0 flex flex-col items-center justify-center pt-10">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Synergy Score</p>
                        <p className="text-5xl font-black text-slate-900">{Math.round(result.compatibility_score)}</p>
                     </div>
                  </div>

                  <div className={`px-10 py-4 rounded-[2rem] flex items-center gap-3 border shadow-sm ${
                     result.status?.includes("High") 
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                        : result.status?.includes("Moderate")
                        ? "bg-blue-50 text-blue-600 border-blue-100"
                        : "bg-amber-50 text-amber-600 border-amber-100"
                  }`}>
                    <ShieldCheck size={24} />
                    <span className="text-xl font-black tracking-tight">{result.status} Alignment</span>
                  </div>

                  <div className="mt-12 w-full max-w-md grid grid-cols-2 gap-4">
                     <div className="p-5 rounded-3xl bg-slate-50 text-center border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Project Potential</p>
                        <p className="text-sm font-black text-slate-900">High Success Range</p>
                     </div>
                     <div className="p-5 rounded-3xl bg-slate-50 text-center border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Team Efficiency</p>
                        <p className="text-sm font-black text-slate-900">Optimized Synthesis</p>
                     </div>
                  </div>
                </motion.div>
              )}
           </div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
