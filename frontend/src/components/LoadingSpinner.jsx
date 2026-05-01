import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] gap-6">
      <div className="relative">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-blue-600"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="text-blue-100 animate-pulse" size={24} />
        </div>
      </div>
      <div className="text-center">
        <p className="text-slate-900 font-black tracking-tight text-lg">{text}</p>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Neural Processing</p>
      </div>
    </div>
  );
}
