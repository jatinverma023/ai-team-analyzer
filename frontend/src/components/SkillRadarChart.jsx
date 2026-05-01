import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

export default function SkillRadarChart({ coding = 0, design = 0, communication = 0, leadership = 0, reliability = 0 }) {
  const data = [
    { subject: 'Coding', value: coding, fullMark: 10 },
    { subject: 'Design', value: design, fullMark: 10 },
    { subject: 'Communication', value: communication, fullMark: 10 },
    { subject: 'Leadership', value: leadership, fullMark: 10 },
    { subject: 'Reliability', value: reliability * 10, fullMark: 10 },
  ];

  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
        <PolarGrid stroke="#e2e8f0" />
        <PolarAngleAxis
          dataKey="subject"
          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 700, fontFamily: 'Inter' }}
        />
        <Radar
          name="Skills"
          dataKey="value"
          stroke="#2563eb"
          fill="#2563eb"
          fillOpacity={0.15}
          strokeWidth={3}
        />
        <Tooltip
          contentStyle={{
            background: '#ffffff',
            border: 'none',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            fontSize: '12px',
            fontWeight: 'bold',
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
