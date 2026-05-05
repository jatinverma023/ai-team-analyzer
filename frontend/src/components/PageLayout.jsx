import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";
import { Menu } from "lucide-react";

export default function PageLayout({ children }) {
  const { collapsed, setMobileOpen } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className={`flex-1 min-h-screen transition-all duration-300 bg-slate-50 ${
        collapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
      }`}>
        {/* Mobile Top Bar with Hamburger */}
        <div className="lg:hidden sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-100 px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-11 h-11 flex items-center justify-center rounded-xl bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all active:scale-95"
            aria-label="Open menu"
          >
            <Menu size={22} />
          </button>
          <span className="text-sm font-black text-slate-900 uppercase tracking-tight">AI Team Analyzer</span>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
