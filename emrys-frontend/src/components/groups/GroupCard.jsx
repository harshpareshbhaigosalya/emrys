import { Users, MessageCircle, ArrowRight } from 'lucide-react'

export default function GroupCard({ group, onClick }) {
    const memberCount = group.group_members?.length || 0

    return (
        <div
            onClick={onClick}
            className="group relative glass-card p-6 cursor-pointer hover:border-primary-500/50 transition-all duration-500 overflow-hidden"
        >
            {/* Background Glow */}
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all" />

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex -space-x-3">
                        {group.group_members?.slice(0, 3).map((member, i) => (
                            <div
                                key={i}
                                className="w-10 h-10 rounded-xl border-2 border-background bg-primary-900/50 flex items-center justify-center overflow-hidden"
                                title={member.personas?.name}
                            >
                                {member.personas?.avatar_url ? (
                                    <img src={member.personas.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-xs font-bold">{member.personas?.name.charAt(0)}</span>
                                )}
                            </div>
                        ))}
                        {memberCount > 3 && (
                            <div className="w-10 h-10 rounded-xl border-2 border-background bg-white/10 backdrop-blur-md flex items-center justify-center text-[10px] font-bold">
                                +{memberCount - 3}
                            </div>
                        )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 bg-primary-500/10 px-2 py-1 rounded-md">Neural Hub</span>
                </div>

                <h3 className="text-xl font-display font-black mb-1 group-hover:text-primary-300 transition-colors uppercase tracking-tight">{group.name}</h3>
                <p className="text-white/50 text-xs line-clamp-2 mb-6 font-medium leading-relaxed">
                    {group.description || 'A collective intelligence gathering of unique personas.'}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-white/30">
                        <Users className="w-3 h-3" />
                        {memberCount} Members
                    </div>
                    <div className="flex items-center gap-1 text-primary-400 font-bold text-xs group-hover:gap-2 transition-all">
                        Synchronize <ArrowRight className="w-3 h-3" />
                    </div>
                </div>
            </div>
        </div>
    )
}
