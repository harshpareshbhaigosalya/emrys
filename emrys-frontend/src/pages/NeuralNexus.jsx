import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Search, Sparkles, Brain, Zap, Users, ShieldCheck, Heart, Star, LayoutGrid, List, Filter, ArrowLeft } from 'lucide-react'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import { personaHelpers } from '../services/supabase'

export default function NeuralNexus({ user }) {
    const navigate = useNavigate()
    const [personas, setPersonas] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [viewMode, setViewMode] = useState('grid')

    const categories = ['All', 'Famous People', 'Specialized Models', 'Fictional Characters', 'Historical Figures', 'Professional Agents']

    useEffect(() => {
        loadLibrary()
    }, [])

    const loadLibrary = async () => {
        try {
            setLoading(true)
            const publicPersonas = await personaHelpers.getPublic()
            setPersonas(publicPersonas || [])
        } catch (err) {
            console.error('Failed to load Nexus:', err)
        } finally {
            setLoading(false)
        }
    }

    const filteredPersonas = personas.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.occupation?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory
        return matchesSearch && matchesCategory
    })

    if (loading) return <Loading message="Accessing Neural Nexus..." />

    return (
        <div className="min-h-screen pb-20 bg-background relative selection:bg-primary-500/30">
            {/* Elegant Background Accents */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-cyan-500/10 rounded-full blur-[120px]" />
            </div>

            {/* Header Section */}
            <div className="relative overflow-hidden pt-12 pb-16 px-6">
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center">

                    {/* Back Button & Top Navigation */}
                    <div className="w-full flex justify-between items-center mb-12">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="group flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all duration-300"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back to Archive</span>
                        </button>

                        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[.2em] text-white/40">Nexus Network: Synchronized</span>
                        </div>
                    </div>

                    <div className="text-center space-y-6 max-w-4xl">
                        <div className="flex justify-center mb-8">
                            <div className="px-5 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-xl flex items-center gap-3">
                                <Globe className="w-5 h-5 text-primary-400 animate-spin-slow" />
                                <span className="text-[11px] font-black uppercase tracking-[0.3em] text-primary-400">Verified Collective Intelligence Repository</span>
                            </div>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black font-display tracking-tight uppercase leading-[0.85] text-white">
                            Neural <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">Nexus</span>
                        </h1>

                        <p className="text-white/40 text-sm md:text-base max-w-2xl mx-auto font-medium leading-relaxed tracking-wider py-4">
                            Access the global library of specialized consciousness. Initialize synchronization with any objective-driven mindset from history, reality, or fiction.
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls bar */}
            <div className="max-w-7xl mx-auto px-6 mb-12 relative z-20">
                <div className="glass-card p-6 flex flex-col lg:flex-row gap-8 items-center justify-between border-primary-500/20 backdrop-blur-2xl">
                    <div className="relative w-full lg:w-[400px] group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20 group-focus-within:text-primary-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Identify mindsets in the nexus..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="input-field pl-14 py-4 bg-white/5 border-white/5 focus:bg-white/10 focus:border-primary-500/50 shadow-inner"
                        />
                    </div>

                    <div className="flex items-center gap-3 overflow-x-auto pb-4 lg:pb-0 w-full lg:flex-1 lg:max-w-2xl px-2 custom-scrollbar-horizontal">
                        {categories.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] whitespace-nowrap transition-all duration-300 ${selectedCategory === cat
                                        ? 'bg-primary-500 text-white shadow-[0_8px_20px_rgba(168,85,247,0.4)] border border-primary-400/50'
                                        : 'bg-white/5 text-white/40 border border-white/10 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 border-l border-white/10 pl-6 hidden lg:flex">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-white/20 border border-white/5 hover:text-white/40'}`}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-3 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' : 'bg-white/5 text-white/20 border border-white/5 hover:text-white/40'}`}
                        >
                            <List className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Persona Grid */}
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {filteredPersonas.length === 0 ? (
                    <div className="py-32 text-center glass-card border-dashed border-2 border-primary-500/10 bg-primary-500/[0.02]">
                        <Users className="w-20 h-20 mx-auto mb-6 text-primary-500/10 animate-pulse" />
                        <h3 className="text-2xl font-black uppercase tracking-widest text-white/20">Collective Quiet</h3>
                        <p className="text-white/40 text-sm italic">No entries found matching your neural filters.</p>
                        <Button
                            variant="secondary"
                            className="mt-8 px-8"
                            onClick={() => { setSearchQuery(''); setSelectedCategory('All') }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid'
                        ? "grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        : "space-y-6"
                    }>
                        {filteredPersonas.map((persona) => (
                            <div
                                key={persona.id}
                                className={`glass-card group hover:scale-[1.03] active:scale-[0.98] transition-all duration-500 border-white/5 hover:border-primary-500/50 cursor-pointer overflow-hidden relative flex ${viewMode === 'list' ? 'flex-row items-center p-5 ring-1 ring-white/5 hover:ring-primary-500/30' : 'flex-col p-8'}`}
                                onClick={() => navigate(`/persona/${persona.id}`)}
                            >
                                {/* Premium Glowing Background Layer */}
                                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.08] via-transparent to-cyan-500/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                                {/* Geometric Decoration */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rotate-45 translate-x-16 -translate-y-16 group-hover:bg-primary-500/10 transition-colors" />

                                <div className={`relative ${viewMode === 'list' ? 'shrink-0 mr-8' : 'mb-8'}`}>
                                    <div className={`${viewMode === 'list' ? 'w-20 h-20' : 'w-28 h-28 mx-auto'} rounded-[2rem] bg-background border-2 border-white/5 group-hover:border-primary-500/50 overflow-hidden transition-all duration-500 shadow-2xl flex items-center justify-center p-1`}>
                                        <div className="w-full h-full rounded-[1.7rem] overflow-hidden bg-primary-900/40 relative">
                                            {persona.avatar_url ? (
                                                <img src={persona.avatar_url} className="w-full h-full object-cover grayscale-[0.3] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" />
                                            ) : (
                                                <Brain className="w-12 h-12 text-primary-400/20 group-hover:text-primary-400 transition-all absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Verification Badge */}
                                    <div className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-primary-500 shadow-[0_0_20px_rgba(168,85,247,0.6)] scale-0 group-hover:scale-100 transition-all duration-500 delay-100 ring-2 ring-background">
                                        <Zap className="w-3.5 h-3.5 text-white fill-current" />
                                    </div>
                                </div>

                                <div className={`${viewMode === 'list' ? 'flex-1 min-w-0' : 'text-center'} relative space-y-2`}>
                                    <div className="flex items-center gap-3 justify-center lg:justify-start">
                                        <h3 className="text-xl font-black uppercase tracking-tight truncate group-hover:text-primary-100 transition-colors">{persona.name}</h3>
                                        {persona.is_public && <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)]" />}
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.25em] text-white/30 truncate group-hover:text-white/50 transition-colors">{persona.occupation || 'Specialized Entity'}</p>

                                    {viewMode === 'grid' && (
                                        <div className="pt-6 mt-8 border-t border-white/10 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                                                    <Users className="w-3.5 h-3.5 text-primary-400" />
                                                    <span className="text-[11px] font-black text-white/20 tracking-tighter">{persona.use_count || 0}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
                                                    <Heart className="w-3.5 h-3.5 text-red-500/50" />
                                                    <span className="text-[11px] font-black text-white/20 tracking-tighter">{(persona.use_count || 0) * 3}</span>
                                                </div>
                                            </div>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary-400 bg-primary-500/10 px-3 py-1.5 rounded-lg border border-primary-500/20 group-hover:bg-primary-500/20 transition-all">{persona.category}</span>
                                        </div>
                                    )}
                                </div>

                                {viewMode === 'list' && (
                                    <div className="ml-auto flex items-center gap-8">
                                        <div className="hidden lg:flex flex-col items-end">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary-500/60 mb-1">{persona.category}</span>
                                            <div className="flex items-center gap-3 text-white/20 text-[10px] font-black tracking-widest uppercase">
                                                <span>{persona.use_count || 0} Syncs</span>
                                                <span>•</span>
                                                <span>{(persona.use_count || 0) * 3} Likes</span>
                                            </div>
                                        </div>
                                        <Button className="px-8 py-3 text-[11px] font-black uppercase tracking-widest glow-effect min-w-[120px]">Initialize</Button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style sx>{`
                .custom-scrollbar-horizontal::-webkit-scrollbar {
                    height: 4px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.02);
                    border-radius: 10px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb {
                    background: rgba(168, 85, 247, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar-horizontal::-webkit-scrollbar-thumb:hover {
                    background: rgba(168, 85, 247, 0.4);
                }
            `}</style>
        </div>
    )
}
