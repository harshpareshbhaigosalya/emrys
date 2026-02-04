import { useState, useEffect } from 'react'
import { X, Users, Sparkles, Shield, UserPlus, Info, Search } from 'lucide-react'
import Button from '../common/Button'
import { personaHelpers, groupHelpers } from '../../services/supabase'

export default function AddPersonaModal({ group, userId, onClose, onSuccess }) {
    const [selectedPersonas, setSelectedPersonas] = useState([])
    const [availablePersonas, setAvailablePersonas] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadAvailablePersonas()
    }, [])

    const loadAvailablePersonas = async () => {
        try {
            setFetching(true)
            const [personalData, publicData] = await Promise.all([
                personaHelpers.getAll(userId),
                personaHelpers.getPublic()
            ])

            // Combine and filter duplicates
            const combined = [...personalData]
            const personalIds = new Set(personalData.map(p => p.id))

            publicData.forEach(p => {
                if (!personalIds.has(p.id)) {
                    combined.push(p)
                }
            })

            // Filter out personas already in the group
            const existingMemberIds = new Set(group.group_members?.map(m => m.persona_id) || [])
            const filtered = combined.filter(p => !existingMemberIds.has(p.id))

            setAvailablePersonas(filtered)
        } catch (err) {
            console.error('Error loading personas:', err)
            setError('Failed to load personas for selection')
        } finally {
            setFetching(false)
        }
    }

    const togglePersona = (id) => {
        setSelectedPersonas(prev =>
            prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
        )
    }

    const handleAddPersonas = async () => {
        if (selectedPersonas.length === 0) return

        setLoading(true)
        setError('')

        try {
            await groupHelpers.addMembers(group.id, selectedPersonas)
            onSuccess()
        } catch (err) {
            setError(err.message)
            setLoading(false)
        }
    }

    const filteredPersonas = availablePersonas.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.occupation?.toLowerCase() || '').includes(searchQuery.toLowerCase())
        const isOwn = p.user_id === userId
        if (activeTab === 'personal') return matchesSearch && isOwn
        if (activeTab === 'nexus') return matchesSearch && p.is_public
        return matchesSearch
    })

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-background/90 backdrop-blur-xl animate-fade-in">
            <div className="glass-card max-w-2xl w-full p-8 border-2 border-primary-500/20 relative shadow-2xl">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-xl transition-all"
                >
                    <X className="w-5 h-5 text-white/40" />
                </button>

                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 bg-primary-500/20 rounded-2xl border border-primary-500/30">
                            <UserPlus className="w-6 h-6 text-primary-400" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Expand Collective</h2>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Integrating new neural patterns into {group.name}</p>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
                        <p className="text-red-400 text-xs font-bold uppercase tracking-wide">{error}</p>
                    </div>
                )}

                <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                            {['all', 'personal', 'nexus'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-primary-500 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                            <input
                                type="text"
                                placeholder="Scan neural architectures..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 w-full transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {fetching ? (
                            <div className="col-span-full py-20 text-center">
                                <div className="loading-dots mx-auto mb-4 justify-center"><span></span><span></span><span></span></div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Accessing Collective Archives...</p>
                            </div>
                        ) : filteredPersonas.length === 0 ? (
                            <div className="col-span-full py-20 text-center glass-card border-dashed border-2 border-white/5 bg-white/[0.02]">
                                <Info className="w-10 h-10 text-white/5 mx-auto mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">No new neural patterns detected</p>
                            </div>
                        ) : (
                            filteredPersonas.map(persona => (
                                <div
                                    key={persona.id}
                                    onClick={() => togglePersona(persona.id)}
                                    className={`p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center gap-4 group relative overflow-hidden ${selectedPersonas.includes(persona.id)
                                        ? 'bg-primary-500/20 border-primary-500 shadow-[0_0_30px_rgba(168,85,247,0.15)]'
                                        : 'bg-white/5 border-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-primary-900/50 flex items-center justify-center shrink-0 overflow-hidden border-2 transition-all duration-500 ${selectedPersonas.includes(persona.id) ? 'border-primary-400' : 'border-white/5'}`}>
                                        {persona.avatar_url ? (
                                            <img src={persona.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-sm font-black text-primary-400">{persona.name.charAt(0)}</span>
                                        )}
                                    </div>
                                    <div className="overflow-hidden flex-1">
                                        <div className="flex items-center gap-2">
                                            <p className={`text-sm font-black uppercase tracking-tight truncate ${selectedPersonas.includes(persona.id) ? 'text-white' : 'text-white/60'}`}>{persona.name}</p>
                                        </div>
                                        <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest truncate">{persona.occupation || 'Linked Entity'}</p>
                                    </div>
                                    {selectedPersonas.includes(persona.id) && (
                                        <div className="absolute top-3 right-3">
                                            <div className="w-2.5 h-2.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(168,85,247,1)] animate-pulse" />
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-white/10">
                        <Button
                            onClick={handleAddPersonas}
                            disabled={loading || selectedPersonas.length === 0}
                            className="flex-1 py-4 glow-effect font-black uppercase tracking-[0.2em] text-xs"
                        >
                            {loading ? 'Synthesizing Connection...' : `Integrate ${selectedPersonas.length} Entities`}
                        </Button>
                        <Button type="button" variant="secondary" onClick={onClose} className="px-8 py-4">
                            Abort
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
