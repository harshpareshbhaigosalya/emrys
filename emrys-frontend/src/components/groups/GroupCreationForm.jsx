import { useState, useEffect } from 'react'
import { X, Users, Sparkles, Shield, UserPlus, Info } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { personaHelpers, groupHelpers } from '../../services/supabase'

export default function GroupCreationForm({ userId, onSuccess, onCancel }) {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [selectedPersonas, setSelectedPersonas] = useState([])
    const [availablePersonas, setAvailablePersonas] = useState([])
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        loadPersonas()
    }, [])

    const loadPersonas = async () => {
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

            setAvailablePersonas(combined)
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) return setError('Group name is required')
        if (selectedPersonas.length < 2) return setError('Select at least 2 personas to form a hub')

        setLoading(true)
        setError('')

        try {
            await groupHelpers.create({
                user_id: userId,
                name,
                description
            }, selectedPersonas)
            onSuccess()
        } catch (err) {
            setError(err.message)
        } finally {
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
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4">
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            )}

            <div className="space-y-4">
                <div className="flex items-center gap-3 mb-2">
                    <Users className="w-6 h-6 text-primary-400" />
                    <h3 className="text-xl font-display font-bold text-white">Initialize Neural Hub</h3>
                </div>

                <Input
                    label="Hub Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. The Creative Council"
                    required
                />

                <div>
                    <label className="block text-white/90 font-medium mb-2">Objective / Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="What is the purpose of this collective gathering?"
                        rows="2"
                        className="textarea-field"
                    />
                </div>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-white/90 font-medium flex items-center gap-2">
                            <UserPlus className="w-4 h-4 text-primary-400" />
                            Select Personas to Link ({selectedPersonas.length})
                        </label>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/30">Min 2 Required</span>
                    </div>

                    {/* Search and Tabs */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab('all')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'all' ? 'bg-primary-500 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                            >
                                All
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('personal')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'personal' ? 'bg-primary-500 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                            >
                                Personal
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab('nexus')}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === 'nexus' ? 'bg-primary-500 text-white shadow-lg' : 'text-white/40 hover:text-white/60'}`}
                            >
                                Nexus
                            </button>
                        </div>
                        <input
                            type="text"
                            placeholder="Filter neural patterns..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-primary-500/50 flex-1"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar p-1">
                    {fetching ? (
                        <div className="col-span-full py-12 text-center">
                            <div className="loading-dots mx-auto mb-4 justify-center"><span></span><span></span><span></span></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">Accessing Collective Archives...</p>
                        </div>
                    ) : filteredPersonas.length === 0 ? (
                        <div className="col-span-full py-12 text-center glass-card border-dashed border-2 border-white/5 bg-white/[0.02]">
                            <Info className="w-8 h-8 text-white/5 mx-auto mb-3" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30">No matching neural patterns found</p>
                            {activeTab === 'nexus' && <p className="text-[8px] text-white/20 mt-2 uppercase tracking-tighter">Explore the Neural Nexus to find public personas</p>}
                        </div>
                    ) : (
                        filteredPersonas.map(persona => (
                            <div
                                key={persona.id}
                                onClick={() => togglePersona(persona.id)}
                                className={`p-3 rounded-xl border cursor-pointer transition-all duration-300 flex items-center gap-3 group relative overflow-hidden ${selectedPersonas.includes(persona.id)
                                    ? 'bg-primary-500/15 border-primary-500 shadow-[0_0_20px_rgba(168,85,247,0.15)] ring-1 ring-primary-500/30'
                                    : 'bg-white/5 border-white/10 hover:border-white/30'
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-lg bg-primary-900/50 flex items-center justify-center shrink-0 overflow-hidden border border-white/5 group-hover:border-primary-500/30 transition-colors">
                                    {persona.avatar_url ? (
                                        <img src={persona.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-xs font-black text-primary-400">{persona.name.charAt(0)}</span>
                                    )}
                                </div>
                                <div className="overflow-hidden flex-1">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-bold truncate group-hover:text-primary-200 transition-colors">{persona.name}</p>
                                        {persona.user_id === userId ? (
                                            <span className="text-[7px] bg-white/10 text-white/40 px-1.5 py-0.5 rounded border border-white/5 font-black uppercase tracking-tighter shrink-0">Yours</span>
                                        ) : persona.is_public && (
                                            <Shield className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-[9px] text-white/40 uppercase font-black tracking-widest truncate">{persona.occupation || persona.relationship || 'Entity'}</p>
                                </div>
                                {selectedPersonas.includes(persona.id) && (
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(168,85,247,1)]" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-white/10">
                <Button
                    type="submit"
                    disabled={loading || selectedPersonas.length < 2}
                    className="flex-1 py-3 glow-effect font-bold uppercase tracking-widest text-xs"
                >
                    {loading ? 'Linking Consciousness...' : 'Establish Hub'}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} className="px-6 py-3">
                    Cancel
                </Button>
            </div>
        </form>
    )
}
