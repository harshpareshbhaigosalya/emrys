import { MessageCircle, Eye, User } from 'lucide-react'

export default function PersonaCard({ persona, onClick, onViewProfile }) {
    const handleViewProfile = (e) => {
        e.stopPropagation()
        onViewProfile()
    }

    return (
        <div className="persona-card group" onClick={onClick}>
            {/* Avatar */}
            <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-full flex items-center justify-center text-2xl font-bold">
                    {persona.avatar_url ? (
                        <img src={persona.avatar_url} alt={persona.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <span>{persona.name.charAt(0).toUpperCase()}</span>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h3 className="text-xl font-display font-bold">{persona.name}</h3>
                        {persona.is_public && (
                            <span className="px-2 py-0.5 bg-cyan-500/20 border border-cyan-500/30 rounded text-[10px] font-black uppercase tracking-widest text-cyan-400">
                                Public
                            </span>
                        )}
                    </div>
                    {persona.relationship && (
                        <p className="text-white/70 text-sm">{persona.relationship}</p>
                    )}
                </div>
            </div>

            {/* Info */}
            <div className="space-y-2 mb-4">
                {persona.occupation && (
                    <p className="text-white/80 text-sm">
                        <span className="text-white/50">Occupation:</span> {persona.occupation}
                    </p>
                )}
                {persona.location && (
                    <p className="text-white/80 text-sm">
                        <span className="text-white/50">Location:</span> {persona.location}
                    </p>
                )}
                {persona.age && (
                    <p className="text-white/80 text-sm">
                        <span className="text-white/50">Age:</span> {persona.age}
                    </p>
                )}
            </div>

            {/* Traits */}
            {persona.personality_traits && persona.personality_traits.length > 0 && (
                <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                        {persona.personality_traits.slice(0, 3).map((trait, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-xs text-primary-300"
                            >
                                {trait}
                            </span>
                        ))}
                        {persona.personality_traits.length > 3 && (
                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-white/50">
                                +{persona.personality_traits.length - 3} more
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 mt-4 pt-4 border-t border-white/10">
                <button
                    onClick={onClick}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-primary-500/20 hover:bg-primary-500/30 border border-primary-500/30 rounded-lg transition-colors"
                >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm">Chat</span>
                </button>
                <button
                    onClick={handleViewProfile}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
                >
                    <Eye className="w-4 h-4" />
                    <span className="text-sm">View</span>
                </button>
            </div>
        </div>
    )
}
