import { motion } from 'framer-motion';

export default function MLScoreGauge({ score = 0, size = 160 }) {
  const percentage = Math.round(score > 1 ? score : score * 100);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (percentage / 100) * circumference;

  const getColor = (pct) => {
    if (pct >= 85) return '#2563eb'; // Deep Blue
    if (pct >= 70) return '#3b82f6'; // Blue
    if (pct >= 50) return '#60a5fa'; // Light Blue
    return '#94a3b8'; // Slate
  };

  const color = getColor(percentage);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Shadow effect */}
        <div className="absolute inset-4 rounded-full bg-white shadow-2xl shadow-blue-500/10" />
        
        <svg width={size} height={size} viewBox="0 0 120 120" className="drop-shadow-sm">
          {/* Background circle */}
          <circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke="#f8fafc"
            strokeWidth="10"
          />
          {/* Progress circle */}
          <motion.circle
            cx="60" cy="60" r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            transform="rotate(-90 60 60)"
          />
          {/* Center text */}
          <text 
            x="60" y="60" 
            textAnchor="middle" 
            fill="#0f172a" 
            fontSize="26" 
            fontWeight="900" 
            dominantBaseline="middle"
            style={{ letterSpacing: '-1px' }}
          >
            {percentage}%
          </text>
        </svg>
      </div>
      <div className="flex flex-col items-center">
         <span className="px-4 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm">
            {percentage >= 85 ? 'Strategic Match' :
             percentage >= 70 ? 'High Synergy' :
             percentage >= 50 ? 'Standard Sync' : 'Low Efficiency'}
         </span>
      </div>
    </div>
  );
}
