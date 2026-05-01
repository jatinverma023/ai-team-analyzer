import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  Flame,
  Mail,
  Lock,
  User,
  ChevronRight,
  Loader2,
} from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

// ✅ Decode JWT payload to extract role if not in response body
const decodeRole = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role || payload.user_role || payload.type || null;
  } catch {
    return null;
  }
};

export default function Auth() {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "register") {
        await api.post("/register", form);
        toast.success("Account created! Please log in.");
        setMode("login");
        setForm({ ...form, name: "" });
      } else {
        const res = await api.post("/login", {
          email: form.email,
          password: form.password,
        });

        const access_token = res.data.access_token;
        const role = res.data.role || decodeRole(access_token);

        if (!role) {
          toast.error("Could not determine user role. Contact admin.");
          return;
        }

        login(access_token, role, res.data.user || null);
        toast.success(`Welcome back!`);
        navigate(`/${role}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.detail || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-10 bg-slate-50">
      {/* Left Column - Brand (4 cols) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400/20 rounded-full -ml-24 -mb-24 blur-2xl opacity-30" />
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative z-10"
        >
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <Flame className="text-blue-600" size={28} />
            </div>
            <span className="text-2xl font-black tracking-tight uppercase">AI TEAM ANALYZER</span>
          </div>
          
          <h2 className="text-5xl font-bold leading-tight mb-6">
            Build perfectly <br />
            <span className="text-blue-200">balanced teams</span> <br />
            with AI.
          </h2>
          <p className="text-blue-50 text-xl font-medium max-w-sm opacity-80">
            Our smart compatibility engine ensures your project groups are optimized for success.
          </p>
        </motion.div>

        <div className="relative z-10">
          <p className="text-blue-200/60 text-sm font-bold uppercase tracking-widest">
            © 2026 AI Team Analyzer • Modern Collaboration
          </p>
        </div>
      </div>

      {/* Right Column - Form (6 cols) */}
      <div className="lg:col-span-6 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-3 mb-10 justify-center">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Flame className="text-white" size={24} />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent uppercase leading-none">AI TEAM ANALYZER</span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 sm:p-10"
          >
            <div className="mb-10 text-center sm:text-left text-slate-900">
              <h1 className="text-3xl font-black tracking-tight mb-2">
                {mode === "login" ? "Welcome back!" : <><span className="text-blue-600">Create</span> Account</>}
              </h1>
              <p className="text-slate-500 font-medium">
                {mode === "login" 
                  ? "Enter your credentials to access your dashboard." 
                  : "Join us and start building smarter teams today."}
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-slate-100/80 rounded-2xl p-1.5 mb-8">
              {["login", "register"].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-3.5 rounded-xl text-sm font-black transition-all duration-300 capitalize ${
                    mode === m
                      ? "bg-white text-blue-600 shadow-md shadow-slate-200/50"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {mode === "register" && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 ml-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User
                        size={18}
                        className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. John Doe"
                        className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@university.edu"
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2 ml-1">
                  <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400">
                    Password
                  </label>

                </div>
                <div className="relative">
                  <Lock
                    size={18}
                    className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                    placeholder="••••••••"
                    className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-6 font-bold text-slate-900 placeholder:text-slate-300 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <AnimatePresence mode="wait">
                {mode === "register" && (
                  <motion.div
                    key="role"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <label className="block text-[10px] uppercase font-black tracking-widest text-slate-400 mb-3 ml-1">
                      Account Type
                    </label>
                    <div className="flex gap-4">
                      {["student", "teacher"].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setForm({ ...form, role: r })}
                          className={`flex-1 py-3.5 rounded-2xl text-xs font-black border-2 capitalize transition-all duration-300 ${
                            form.role === r
                              ? "border-blue-600 bg-blue-50 text-blue-600 shadow-sm"
                              : "border-slate-50 bg-slate-50 text-slate-400 hover:border-slate-200"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-16 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-400 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 flex items-center justify-center gap-3 mt-4 transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    {mode === "login" ? "Sign In" : "Initialize Account"}
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center sm:hidden">
               <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  © 2026 AI Team Analyzer
               </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
