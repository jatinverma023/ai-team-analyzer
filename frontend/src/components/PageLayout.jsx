import Sidebar from "./Sidebar";
import { motion } from "framer-motion";
import { useSidebar } from "../context/SidebarContext";

export default function PageLayout({ children }) {
  const { collapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className={`flex-1 min-h-screen transition-all duration-300 bg-slate-50 ${
        collapsed ? 'lg:ml-[80px]' : 'lg:ml-[280px]'
      }`}>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="p-4 sm:p-8 max-w-[1600px] mx-auto"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
