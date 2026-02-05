import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, LogOut, User, Settings, Users, Sparkles, Brain, Zap, ArrowRight, Shield, Globe } from 'lucide-react'
import Button from '../components/common/Button'
import PersonaCard from '../components/personas/PersonaCard'
import GroupCard from '../components/groups/GroupCard'
import EnhancedPersonaForm from '../components/personas/EnhancedPersonaForm'
import GroupCreationForm from '../components/groups/GroupCreationForm'
import Modal from '../components/common/Modal'
import Loading from '../components/common/Loading'
import NeuralFeed from '../components/dashboard/NeuralFeed'
import { authHelpers, personaHelpers, groupHelpers } from '../services/supabase'

export default function Dashboard({ user }) {
    const navigate = useNavigate()
    const [personas, setPersonas] = useState([])
    const [groups, setGroups] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreatePersonaModal, setShowCreatePersonaModal] = useState(false)
    const [showCreateGroupModal, setShowCreateGroupModal] = useState(false)
    const [userProfile, setUserProfile] = useState(null)
    const [activeView, setActiveView] = useState('all') // 'all', 'personas', 'hubs', 'nexus'

    useEffect(() => {
        loadData()
    }, [user])

    const loadData = async () => {
        try {
            const profile = await authHelpers.getUserProfile(user.id)
            setUserProfile(profile)

            const [personasData, groupsData] = await Promise.all([
                personaHelpers.getAll(user.id),
                groupHelpers.getAll(user.id)
            ])

            setPersonas(personasData)
            setGroups(groupsData)
        } catch (error) {
            console.error('Error loading dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async () => {
        await authHelpers.signOut()
        navigate('/login')
    }

    const handleSuccess = async () => {
        setShowCreatePersonaModal(false)
        setShowCreateGroupModal(false)
        await loadData()
    }

    if (loading) {
        return <Loading message="Accessing the EMRYS memory bank..." />
    }

    return (
        <div className="min-h-screen pb-20">
            {/* Header / Top Navigation */}
            <header className="glass-card mx-2 sm:mx-6 mt-4 sm:mt-6 mb-8 sm:mb-12">
                <div className="container mx-auto px-4 sm:px-8 py-4 sm:py-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary-500 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Brain className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-4xl sm:text-5xl font-black font-display tracking-tighter gradient-text leading-none">EMRYS</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-sm font-bold text-white tracking-wide">Active Protocol: {activeView.toUpperCase()}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary-400">Linked to {userProfile?.full_name}</p>
                        </div>
                        <div className="h-10 w-[1px] bg-white/10" />
                        <div className="flex items-center gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/nexus')}
                                className="p-3 border-none hover:bg-primary-500/10 hover:text-primary-400 group relative"
                            >
                                <Globe className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary-500 rounded-full animate-ping"></span>
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={() => navigate('/profile')}
                                className="p-3 border-none hover:bg-white/10"
                            >
                                <Settings className="w-5 h-5 text-white/60" />
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleLogout}
                                className="p-3 border-none hover:bg-red-500/10 hover:text-red-400"
                            >
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6">
                {/* Hero / Quick Actions */}
                <div className="grid lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-16">
                    <div className="lg:col-span-3 glass-card p-6 sm:p-10 relative overflow-hidden group">
                        {/* Decorative Background Elements */}
                        
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] pointer-events-none" />

                        <div className="absolute top-5 right-10 opacity-[0.05] group-hover:opacity-[0.1] transition-all duration-700 select-none pointer-events-none hidden sm:block">
                            <h2 className="text-4xl font-black tracking-[0.8em] uppercase" style={{ writingMode: 'vertical-rl' }}>EMRYS</h2>
                        </div>
                        <div className="relative z-10 max-w-2xl">
                            <h2 className="text-3xl sm:text-5xl font-black font-display tracking-tight mb-4 leading-tight sm:leading-none">The Vault</h2>
                            <p className="text-sm sm:text-lg text-white/60 font-bold mb-6 sm:mb-8 leading-relaxed">
                                Preserving the essence of thought and personality. Your archives are ready for exploration.
                            </p>
                            <div className="flex flex-wrap gap-3 sm:gap-4">
                                <Button
                                    onClick={() => setShowCreatePersonaModal(true)}
                                    className="px-6 sm:px-8 py-3 sm:py-4 glow-effect flex items-center gap-3 w-full sm:w-auto justify-center"
                                >
                                    <Plus className="w-5 h-5" />
                                    <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Create Persona</span>
                                </Button>
                                <Button
                                    variant="secondary"
                                    onClick={() => setShowCreateGroupModal(true)}
                                    className="px-6 sm:px-8 py-3 sm:py-4 flex items-center gap-3 hover:bg-white/10 w-full sm:w-auto justify-center"
                                >
                                    <Users className="w-5 h-5" />
                                    <span className="font-black uppercase tracking-widest text-[10px] sm:text-xs">Initialize Hub</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="glass-card p-8 flex flex-col justify-between border-l-4 border-primary-500 bg-primary-500/5">
                        <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary-400 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> System Core
                            </h3>
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/40">Preserved Lives</span>
                                    <span>{personas.length}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/40">Active Hubs</span>
                                    <span>{groups.length}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-white/40">Sync Status</span>
                                    <span className="text-primary-400">Stable</span>
                                </div>
                            </div>
                        </div>
                        <div className="pt-6 border-t border-white/5">
                            <div className="flex items-center gap-3">
                                <Shield className="w-8 h-8 text-primary-500/50" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Data protection active</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Repository Section */}
                <div className="space-y-8 sm:space-y-12">
                    {/* View Switcher Tabs */}
                    <div className="flex gap-4 sm:gap-8 border-b border-white/5 pb-2 overflow-x-auto no-scrollbar flex-nowrap">
                        <button
                            onClick={() => setActiveView('all')}
                            className={`pb-4 px-2 text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeView === 'all' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Archive
                        </button>
                        <button
                            onClick={() => setActiveView('personas')}
                            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeView === 'personas' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Individual Personas
                        </button>
                        <button
                            onClick={() => setActiveView('hubs')}
                            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all ${activeView === 'hubs' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-white/40 hover:text-white/60'}`}
                        >
                            Memory Hubs
                        </button>
                        <button
                            onClick={() => navigate('/nexus')}
                            className={`pb-4 px-2 text-xs font-black uppercase tracking-widest transition-all text-cyan-400 hover:text-cyan-300 flex items-center gap-2`}
                        >
                            <Sparkles className="w-3 h-3" />
                            The Nexus (Global Library)
                        </button>
                    </div>

                    {/* Content Grid with Feed Sidebar */}
                    <div className="grid lg:grid-cols-12 gap-12">
                        {/* Main Content Column */}
                        <div className="lg:col-span-8 space-y-12">
                            {/* Neural Hubs (Groups) */}
                            {(activeView === 'all' || activeView === 'hubs') && groups.length > 0 && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                                            <Users className="w-4 h-4" /> Active Hubs
                                        </h3>
                                        {activeView === 'all' && (
                                            <button onClick={() => setActiveView('hubs')} className="text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
                                                View All Hubs <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {groups.map(group => (
                                            <GroupCard
                                                key={group.id}
                                                group={group}
                                                onClick={() => navigate(`/hub/${group.id}`)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Personas Section */}
                            {(activeView === 'all' || activeView === 'personas') && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/20 flex items-center gap-3">
                                            <User className="w-4 h-4" /> Preserved Personas
                                        </h3>
                                        {activeView === 'all' && personas.length > 0 && (
                                            <button onClick={() => setActiveView('personas')} className="text-[10px] font-black uppercase tracking-widest text-primary-500 flex items-center gap-1 hover:gap-2 transition-all">
                                                Explore Archive <ArrowRight className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>

                                    {personas.length === 0 ? (
                                        <div className="glass-card p-16 text-center">
                                            <User className="w-16 h-16 text-primary-500/20 mx-auto mb-6" />
                                            <h4 className="text-2xl font-black mb-2 uppercase tracking-tight">The archive is empty</h4>
                                            <p className="text-white/50 text-sm max-w-xs mx-auto mb-8 font-medium italic">Begin by preserving your first human essence in our digital neural web.</p>
                                            <Button onClick={() => setShowCreatePersonaModal(true)} className="px-10 py-4 glow-effect uppercase font-black tracking-widest text-xs">
                                                Begin Preservation
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            {personas.map(persona => (
                                                <PersonaCard
                                                    key={persona.id}
                                                    persona={persona}
                                                    onClick={() => navigate(`/chat/${persona.id}`)}
                                                    onViewProfile={() => navigate(`/persona/${persona.id}`)}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Sidebar Column: Neural Feed */}
                        <div className="lg:col-span-4">
                            <NeuralFeed user={user} personas={personas} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal
                isOpen={showCreatePersonaModal}
                onClose={() => setShowCreatePersonaModal(false)}
                title="Protocol: Persona Preservation"
                size="xl"
            >
                <EnhancedPersonaForm
                    userId={user.id}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowCreatePersonaModal(false)}
                />
            </Modal>

            <Modal
                isOpen={showCreateGroupModal}
                onClose={() => setShowCreateGroupModal(false)}
                title="Protocol: Hub Synchronization"
                size="md"
            >
                <GroupCreationForm
                    userId={user.id}
                    onSuccess={handleSuccess}
                    onCancel={() => setShowCreateGroupModal(false)}
                />
            </Modal>
        </div>
    )
}
