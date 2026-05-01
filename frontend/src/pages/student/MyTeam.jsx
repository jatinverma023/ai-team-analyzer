import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Code, Palette, MessageCircle, Award, Zap, Mail, ShieldCheck, ChevronRight, Star } from 'lucide-react';
import PageLayout from '../../components/PageLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import api from '../../api/axios';

const skillIcons = { coding: Code, design: Palette, communication: MessageCircle, leadership: Award };

export default function MyTeam() {
  const [teamInfo, setTeamInfo] = useState(null);
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/student/team-info'),
      api.get('/student/team-members'),
    ]).then(([infoRes, memRes]) => {
      setTeamInfo(infoRes.data);
      setMembers(memRes.data);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLayout><LoadingSpinner text="Retrieving team roster..." /></PageLayout>;

  const notAssigned = teamInfo?.message || members?.message;

  return (
    <PageLayout>
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest">Collaborative Unit</span>
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">My <span className="text-blue-600">Collaborative Team</span></h1>
        <p className="text-slate-500 mt-2 font-medium">Connect with your teammates and explore collective capabilities.</p>
      </header>

      {notAssigned ? (
        <div className="bg-white p-16 rounded-[2.5rem] border border-slate-100 shadow-sm text-center max-w-2xl mx-auto mt-12">
          <div className="w-20 h-20 bg-slate-50 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Users size={40} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">No Team Found</h2>
          <p className="text-slate-500 mb-8 font-medium">You haven't been assigned to a technical team yet.</p>
          <div className="bg-blue-50/50 p-4 rounded-2xl text-blue-600 text-sm font-bold inline-block border border-blue-100/50">
             Contact your course instructor to finalize group assignments.
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Team Summary Header */}
          {teamInfo && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-wrap items-center gap-10"
            >
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                    <Users size={28} />
                 </div>
                 <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 shadow-sm opacity-80">
                    ASSIGNED GROUP
                  </p>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                      {teamInfo.team_name || `Team Unit #${teamInfo.team_number}`}
                    </h2>
                  </div>
                 </div>
              </div>
              
              <div className="flex flex-col">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Roster Size</p>
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2">
                      {[...Array(members?.total_members || 0)].map((_, i) => (
                        <div key={i} className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white" />
                      ))}
                   </div>
                   <span className="text-sm font-black text-slate-900">{members?.total_members} Members</span>
                </div>
              </div>

              <div className="flex flex-col ml-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Team Established</p>
                <p className="text-sm font-black text-slate-900">{teamInfo.created_at ? new Date(teamInfo.created_at).toLocaleDateString() : 'Active Session'}</p>
              </div>
            </motion.div>
          )}

          {/* Members Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {members?.members?.map((member, i) => {
              const StrongestIcon = skillIcons[member.strongest_skill] || Zap;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 rounded-[1.5rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-blue-600 font-black text-xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                      {member.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-black text-slate-900 truncate group-hover:text-blue-600 transition-colors">{member.name}</h3>
                      <div className="flex items-center gap-1.5 text-slate-400">
                         <Mail size={12} />
                         <span className="text-xs font-bold truncate leading-none">{member.email}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">Top Skill</p>
                       <div className="flex items-center gap-1.5 text-blue-600">
                          <StrongestIcon size={14} />
                          <span className="text-xs font-black capitalize">{member.strongest_skill}</span>
                       </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                       <p className="text-[9px] font-black text-slate-400 uppercase tracking-tight mb-1">Reliability</p>
                       <div className="flex items-center gap-1.5 text-emerald-600">
                          <ShieldCheck size={14} />
                          <span className="text-xs font-black">{Math.round(member.reliability * 100)}%</span>
                       </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {[
                      { label: 'Coding', val: member.coding, color: 'blue' },
                      { label: 'Design', val: member.design, color: 'indigo' },
                      { label: 'Comm.', val: member.communication, color: 'emerald' },
                      { label: 'Lead.', val: member.leadership, color: 'violet' },
                    ].map(({ label, val, color }) => (
                      <div key={label}>
                        <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase mb-1.5 px-1">
                          <span>{label}</span>
                          <span className="text-slate-900">{val}/10</span>
                        </div>
                        <div className="h-1.5 bg-slate-50 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${val * 10}%` }}
                            transition={{ duration: 1, delay: i * 0.1 + 0.4 }}
                            className={`h-full bg-blue-600 rounded-full group-hover:bg-blue-500 transition-all`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-8 pt-6 border-t border-slate-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all">
                     <span className="text-xs font-bold text-slate-400">View public profile</span>
                     <button className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">
                        <ChevronRight size={16} />
                     </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </PageLayout>
  );
}
