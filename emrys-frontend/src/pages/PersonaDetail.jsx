import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Edit, Trash2, MessageCircle, Globe, FileText, Info, Brain, Zap, Heart, Sparkles, User, Database, Upload } from 'lucide-react'
import Button from '../components/common/Button'
import EnhancedPersonaForm from '../components/personas/EnhancedPersonaForm'
import Modal from '../components/common/Modal'
import Loading from '../components/common/Loading'
import { personaHelpers, knowledgeHelpers } from '../services/supabase'

export default function PersonaDetail({ user }) {
    const { personaId } = useParams()
    const navigate = useNavigate()

    const [persona, setPersona] = useState(null)
    const [knowledge, setKnowledge] = useState([])
    const [loading, setLoading] = useState(true)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        loadPersonaData()
    }, [personaId])

    const loadPersonaData = async () => {
        try {
            const personaData = await personaHelpers.getById(personaId)
            setPersona(personaData)

            const knowledgeData = await knowledgeHelpers.getAll(personaId)
            setKnowledge(knowledgeData)
        } catch (error) {
            console.error('Error loading persona:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleUpdate = async () => {
        setShowEditModal(false)
        await loadPersonaData()
    }

    const handleDelete = async () => {
        try {
            await personaHelpers.delete(personaId)
            navigate('/dashboard')
        } catch (error) {
            console.error('Error deleting persona:', error)
        }
    }

    if (loading) {
        return <Loading message="Synthesizing persona data..." />
    }

    const TabButton = ({ id, label, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-t-xl transition-all duration-300 font-bold tracking-wide uppercase text-[10px] sm:text-xs whitespace-nowrap shrink-0 ${activeTab === id
                ? 'bg-primary-500/20 text-primary-400 border-b-2 border-primary-500'
                : 'text-white/40 hover:text-white/60 hover:bg-white/5'
                }`}
        >
            <Icon className="w-4 h-4" />
            {label}
        </button>
    )

    return (
        <div className="min-h-screen pb-20">
            {/* Header Hero Area */}
            <div className="relative min-h-[50vh] sm:h-64 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary-900/40 to-transparent z-0" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-background to-transparent z-0" />
                <div className="container mx-auto px-4 sm:px-6 h-full flex items-end relative z-10 pb-6 sm:pb-8">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="absolute top-6 left-6 p-2 bg-white/10 backdrop-blur-md rounded-full hover:bg-white/20 transition-all border border-white/10 group"
                    >
                        <ArrowLeft className="w-6 h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 sm:gap-8 w-full text-center sm:text-left">
                        <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden glass-card p-1 shrink-0 shadow-2xl">
                            <div className="w-full h-full rounded-2xl overflow-hidden bg-primary-900/50 flex items-center justify-center">
                                {persona.avatar_url ? (
                                    <img src={persona.avatar_url} alt={persona.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-3xl sm:text-4xl font-black text-primary-500">{persona.name.charAt(0)}</span>
                                )}
                            </div>
                        </div>

                        <div className="flex-1 flex flex-col sm:flex-row justify-between items-center sm:items-end w-full gap-6">
                            <div>
                                <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight mb-2 drop-shadow-xl">{persona.name}</h1>
                                <div className="flex items-center justify-center sm:justify-start gap-4">
                                    <span className="px-3 py-1 bg-primary-500/30 text-primary-300 text-[10px] sm:text-xs font-black uppercase tracking-widest rounded-full backdrop-blur-md border border-primary-500/20">
                                        {persona.relationship || 'Individual'}
                                    </span>
                                    {persona.location && (
                                        <span className="flex items-center gap-1 text-white/50 text-xs sm:text-sm font-medium">
                                            <Globe className="w-3 h-3" /> {persona.location}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
                                <Button
                                    onClick={() => navigate(`/chat/${personaId}`)}
                                    className="flex-1 sm:flex-none px-6 sm:px-8 py-3 glow-effect flex items-center justify-center gap-2 group"
                                >
                                    <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs sm:text-base font-black uppercase tracking-tight sm:tracking-normal sm:font-bold sm:capitalize">Chat</span>
                                </Button>
                                {persona.user_id === user.id && (
                                    <div className="flex gap-2 shrink-0">
                                        <Button
                                            variant="secondary"
                                            onClick={() => setShowEditModal(true)}
                                            className="p-2 sm:p-3"
                                            title="Edit Profile"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="p-2 sm:p-3"
                                            title="Unplug / Delete"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="container mx-auto px-6 mb-8">
                <div className="flex border-b border-white/5 overflow-x-auto no-scrollbar">
                    <TabButton id="profile" label="Profile" icon={User} />
                    <TabButton id="psychology" label="Mindset" icon={Brain} />
                    <TabButton id="history" label="Shared History" icon={Info} />
                    <TabButton id="knowledge" label="Learned Data" icon={Database} />
                    <TabButton id="raw" label="Raw Knowledge" icon={FileText} />
                </div>
            </div>

            <div className="container mx-auto px-6">
                <div className="grid lg:grid-cols-12 gap-8">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8">
                        {activeTab === 'profile' && (
                            <div className="space-y-8 animate-fade-in">
                                {/* Bio Card */}
                                <div className="glass-card p-8">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-3">
                                        <Info className="w-5 h-5" /> Biography & Current Status
                                    </h3>
                                    <div className="space-y-6">
                                        {persona.background_story && (
                                            <div>
                                                <h4 className="text-sm font-bold text-primary-400 mb-2 uppercase">Core Origin</h4>
                                                <p className="text-lg text-white/80 leading-relaxed font-medium">{persona.background_story}</p>
                                            </div>
                                        )}
                                        {persona.current_life_situation && (
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10 italic">
                                                <h4 className="text-xs font-bold text-white/40 mb-2 uppercase tracking-widest">Ongoing Context</h4>
                                                <p className="text-white/70">"{persona.current_life_situation}"</p>
                                            </div>
                                        )}

                                        <div className="grid sm:grid-cols-2 gap-8 pt-4">
                                            <div>
                                                <h4 className="text-xs font-black text-white/30 mb-3 uppercase tracking-widest">Metadata</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                        <span className="text-white/40 text-sm">Occupation</span>
                                                        <span className="font-bold">{persona.occupation || 'Unknown'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2 border-b border-white/5">
                                                        <span className="text-white/40 text-sm">Age Instance</span>
                                                        <span className="font-bold">{persona.age ? `${persona.age} Standard Years` : 'Undefined'}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center py-2">
                                                        <span className="text-white/40 text-sm">Subject Protocol</span>
                                                        <span className="font-bold">{persona.calls_user_by || 'Default'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-black text-white/30 mb-3 uppercase tracking-widest">Social Matrix</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {persona.social_media_links?.length > 0 ? (
                                                        persona.social_media_links.map((link, i) => (
                                                            <a
                                                                key={i}
                                                                href={link}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors flex items-center gap-2"
                                                            >
                                                                <Globe className="w-4 h-4 text-primary-400" />
                                                                <span className="text-xs font-bold">Link {i + 1}</span>
                                                            </a>
                                                        ))
                                                    ) : (
                                                        <p className="text-xs text-white/20 italic">No external links connected</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Interests Card */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="glass-card p-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-primary-400 mb-4">Focus Interests</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {persona.interests?.map((item, i) => (
                                                <span key={i} className="px-3 py-1 bg-primary-500/10 border border-primary-500/20 rounded-lg text-sm text-primary-300 font-bold">
                                                    {item}
                                                </span>
                                            )) || <span className="text-white/20 italic text-sm">None defined</span>}
                                        </div>
                                    </div>
                                    <div className="glass-card p-6">
                                        <h3 className="text-sm font-black uppercase tracking-widest text-gold-400 mb-4">Milestone Achievements</h3>
                                        <p className="text-white/70 text-sm leading-relaxed">{persona.achievements || 'No specific milestones logged yet.'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'psychology' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="glass-card p-8">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white/30 mb-8 flex items-center gap-4">
                                        <Brain className="w-6 h-6" /> Mindset Profile
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div className="space-y-8">
                                            <div>
                                                <h4 className="text-xs font-black text-gold-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Sparkles className="w-3 h-3" /> Traits & Dynamics
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {persona.personality_traits?.map((t, i) => (
                                                        <span key={i} className="px-3 py-1 bg-gold-500/10 border border-gold-500/20 rounded-full text-xs text-gold-200 font-bold uppercase">{t}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-black text-cyan-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Heart className="w-3 h-3" /> Value Alignment
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {persona.values?.map((v, i) => (
                                                        <span key={i} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full text-xs text-cyan-200 font-bold uppercase">{v}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-8">
                                            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                                                <h4 className="text-xs font-black text-white/40 mb-4 uppercase tracking-widest">Communication Style</h4>
                                                <div className="space-y-3">
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-white/50">Depth</span>
                                                        <span className="font-bold capitalize">{persona.response_style}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-white/50">Formality</span>
                                                        <span className="font-bold capitalize">{persona.formality_level.replace('_', ' ')}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center text-sm">
                                                        <span className="text-white/50">Humor</span>
                                                        <span className="font-bold capitalize">{persona.humor_level}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-xs font-black text-pink-400 mb-4 uppercase tracking-[0.2em]">Unique Expression</h4>
                                                <div className="space-y-2">
                                                    {persona.catchphrases?.map((c, i) => (
                                                        <div key={i} className="text-sm font-italic text-pink-200">"{c}"</div>
                                                    )) || <p className="text-xs text-white/20 italic">No patterns recorded</p>}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="glass-card p-8">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white/30 mb-8">Relationship Records</h3>
                                    <div className="space-y-12">
                                        <h1 className="text-4xl sm:text-6xl md:text-8xl font-black font-display tracking-tight uppercase leading-[0.85] text-white">
                                            The <br />
                                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-cyan-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">Gallery</span>
                                        </h1>
                                        <div className="relative pl-8 border-l-2 border-primary-500/30 space-y-4">
                                            <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(168,85,247,1)]" />
                                            <h4 className="text-sm font-black text-primary-400 uppercase tracking-widest">Stored Memories</h4>
                                            <p className="text-lg text-white/80 leading-relaxed italic">"{persona.memories || 'The archive is currently empty.'}"</p>
                                        </div>

                                        <div className="relative pl-8 border-l-2 border-cyan-500/30 space-y-4">
                                            <div className="absolute top-0 -left-[9px] w-4 h-4 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]" />
                                            <h4 className="text-sm font-black text-cyan-400 uppercase tracking-widest">Shared Experiences</h4>
                                            <p className="text-lg text-white/80 leading-relaxed">{persona.shared_experiences || 'No specific occurrences have been documented.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'knowledge' && (
                            <div className="space-y-6 animate-fade-in">
                                <div className="glass-card p-8">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white/30 mb-6 flex justify-between items-center">
                                        Learned Dynamics
                                        <span className="text-xs px-2 py-1 bg-white/5 rounded-md font-mono">{knowledge.length} Nodes</span>
                                    </h3>
                                    {knowledge.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Database className="w-12 h-12 text-white/10 mx-auto mb-4" />
                                            <p className="text-white/40">Knowledge pathways are still developing. Chat with this profile to activate data gathering.</p>
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            {knowledge.map((item) => (
                                                <div key={item.id} className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:border-primary-500/30 transition-all group">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-primary-400 px-2 py-1 bg-primary-500/10 rounded-md">{item.category}</span>
                                                        <span className="text-[10px] text-white/20 font-mono">{new Date(item.learned_at).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm font-black mb-1 group-hover:text-primary-300 transition-colors">{item.key}</p>
                                                    <p className="text-sm text-white/60 leading-relaxed font-medium">{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'raw' && (
                            <div className="space-y-8 animate-fade-in">
                                <div className="glass-card p-8">
                                    <h3 className="text-xl font-black uppercase tracking-widest text-white/30 mb-6">Subject Knowledge Repository</h3>

                                    <div className="space-y-8">
                                        {/* Data Dump */}
                                        <div>
                                            <h4 className="text-xs font-black text-white/40 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Database className="w-4 h-4" /> Comprehensive Data Dump
                                            </h4>
                                            {persona.data_dump ? (
                                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 font-mono text-sm text-white/70 max-h-96 overflow-y-auto custom-scrollbar whitespace-pre-wrap">
                                                    {persona.data_dump}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-white/20 italic">No bulk data has been imported for this subject.</p>
                                            )}
                                        </div>

                                        {/* Life Data */}
                                        {persona.life_data && (
                                            <div>
                                                <h4 className="text-xs font-black text-white/40 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                                    <Info className="w-4 h-4" /> Structured Life Records
                                                </h4>
                                                <div className="p-6 bg-white/5 rounded-2xl border border-white/10 font-mono text-xs text-white/50 whitespace-pre-wrap">
                                                    {persona.life_data}
                                                </div>
                                            </div>
                                        )}

                                        {/* Uploaded Files */}
                                        <div>
                                            <h4 className="text-xs font-black text-white/40 mb-4 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <Upload className="w-4 h-4" /> Neural Source Documents
                                            </h4>
                                            {persona.uploaded_files?.length > 0 ? (
                                                <div className="grid sm:grid-cols-2 gap-4">
                                                    {persona.uploaded_files.map((file, i) => (
                                                        <a
                                                            key={i}
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-primary-500/30 transition-all group"
                                                        >
                                                            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center group-hover:bg-primary-500/40 transition-all">
                                                                <FileText className="w-5 h-5 text-primary-400" />
                                                            </div>
                                                            <div className="overflow-hidden">
                                                                <p className="text-sm font-bold truncate">{file.name}</p>
                                                                <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Open Resource</p>
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-white/20 italic">No external files have been successfully ingested.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Quick Stats */}
                        <div className="glass-card p-6 border-l-4 border-primary-500">
                            <h3 className="text-xs font-black uppercase tracking-widest text-white/30 mb-6 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-primary-500" /> System Core Stats
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-white/50">Subject Intricacy</span>
                                        <span className="text-primary-400">88%</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-primary-500 w-[88%] shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-1">
                                        <span className="text-white/50">Subject Loyalty</span>
                                        <span className="text-cyan-400">High</span>
                                    </div>
                                    <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-cyan-500 w-[94%] shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Speech Sample */}
                        <div className="glass-card p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-pink-400 mb-4">Speech Sample</h3>
                            <div className="relative">
                                <div className="absolute -left-2 top-0 text-3xl text-pink-500/20 font-serif">"</div>
                                <p className="text-sm font-bold italic text-white/80 leading-relaxed pr-2">
                                    {persona.typical_greeting || "The subject has not provided a baseline greeting protocol yet."}
                                </p>
                            </div>
                        </div>

                        {/* Catchphrases */}
                        <div className="glass-card p-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-4">Mannerisms</h3>
                            <div className="space-y-3">
                                {persona.catchphrases?.slice(0, 3).map((c, i) => (
                                    <div key={i} className="flex items-center gap-2 text-xs font-bold text-white/60">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                                        {c}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <Modal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                title={`Modifying Essence: ${persona.name}`}
                size="xl"
            >
                <EnhancedPersonaForm
                    userId={user.id}
                    persona={persona}
                    onSuccess={handleUpdate}
                    onCancel={() => setShowEditModal(false)}
                />
            </Modal>

            {/* Delete Confirmation */}
            <Modal
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                title="Protocol Termination"
                size="sm"
            >
                <div className="space-y-6">
                    <p className="text-white/80 leading-relaxed">
                        You are about to permanently delete the neural identity of <strong>{persona.name}</strong>.
                        This instance and all associated memories will be purged.
                    </p>
                    <div className="flex flex-col gap-3">
                        <Button variant="danger" onClick={handleDelete} className="w-full py-4 font-black uppercase tracking-widest bg-red-600 hover:bg-red-500">
                            Confirm Termination
                        </Button>
                        <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="w-full py-4 font-bold border-none">
                            Abort Process
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
