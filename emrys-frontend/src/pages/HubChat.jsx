import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, AlertCircle, Users, Zap, Brain, Sparkles, MessageSquare, Info, History, Mic, MicOff, Waves, Activity, UserPlus } from 'lucide-react'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import AddPersonaModal from '../components/groups/AddPersonaModal'
import { personaHelpers, groupHelpers, chatHelpers } from '../services/supabase'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function HubChat({ user }) {
    const { groupId } = useParams()
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)

    const [group, setGroup] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_api_key') || '')
    const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false)
    const [activeSpeaker, setActiveSpeaker] = useState(null)
    const [isRetrieving, setIsRetrieving] = useState(false)
    const [showAddModal, setShowAddModal] = useState(false)

    // Mention state
    const [showMentions, setShowMentions] = useState(false)
    const [mentionQuery, setMentionQuery] = useState('')
    const [mentionStyles, setMentionStyles] = useState({})
    const [selectedIndex, setSelectedIndex] = useState(0)

    const MOOD_LABELS = {
        'default': 'Synchronized',
        'happy': 'Warm Resonance',
        'sad': 'Somber Alignment',
        'angry': 'Intense Frequency',
        'nostalgic': 'Deep Access',
        'curious': 'High Inquiry',
        'protective': 'Shield Active',
        'distant': 'Faint Signal'
    }

    useEffect(() => {
        loadHubData()
    }, [groupId])

    useEffect(() => {
        scrollToBottom()
    }, [messages, sending, isRetrieving])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadHubData = async () => {
        try {
            const groupData = await groupHelpers.getById(groupId)
            setGroup(groupData)

            const { data: conv } = await chatHelpers.getOrCreateGroupConversation(user.id, groupId)
            const msgs = await chatHelpers.getMessages(conv.id)
            setMessages(msgs)

            if (!apiKey) setShowApiKeyPrompt(true)
        } catch (error) {
            console.error('Error loading hub:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputMessage.trim() || sending) return
        if (!apiKey) return setShowApiKeyPrompt(true)

        const userMsgContent = inputMessage.trim()
        setInputMessage('')
        setSending(true)
        setIsRetrieving(true)

        const tempUserMsg = {
            id: Date.now(),
            sender_type: 'user',
            content: userMsgContent,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempUserMsg])

        try {
            const requestData = {
                user_id: user.id,
                group_id: groupId,
                message: userMsgContent,
                api_key: apiKey
            }

            const response = await axios.post(`${BACKEND_URL}/api/chat/group/send`, requestData)
            setIsRetrieving(false)

            if (response.data.error) {
                throw new Error(response.data.error)
            }

            const newResps = Array.isArray(response.data.responses) ? response.data.responses : []

            if (newResps.length === 0) {
                throw new Error("The collective failed to initialize a response pattern.")
            }

            newResps.forEach((resp, idx) => {
                setTimeout(() => {
                    const aiMsg = {
                        id: Date.now() + idx,
                        sender_type: 'persona',
                        persona_id: resp.persona_id,
                        persona_name: resp.persona_name,
                        content: resp.response,
                        created_at: new Date().toISOString(),
                        mood: resp.mood
                    }
                    setMessages(prev => [...prev, aiMsg])
                    setActiveSpeaker({ id: resp.persona_id, mood: resp.mood })
                }, idx * 1200)
            })

        } catch (error) {
            console.error('Error in hub sync:', error)
            const errorMsg = {
                id: Date.now() + 99,
                sender_type: 'system',
                content: error.message || 'Neural Hub synchronization failed.',
                isError: true,
                created_at: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setSending(false)
            setTimeout(() => setActiveSpeaker(null), 8000)
        }
    }

    const handleInputChange = (e) => {
        const value = e.target.value
        setInputMessage(value)

        // Check for @ mention
        const cursorPosition = e.target.selectionStart
        const textBeforeCursor = value.slice(0, cursorPosition)
        const lastAt = textBeforeCursor.lastIndexOf('@')

        if (lastAt !== -1 && (lastAt === 0 || textBeforeCursor[lastAt - 1] === ' ')) {
            const query = textBeforeCursor.slice(lastAt + 1)
            setMentionQuery(query)
            setShowMentions(true)
            setSelectedIndex(0)
        } else {
            setShowMentions(false)
        }
    }

    const selectPersona = (name) => {
        const cursorPosition = inputMessage.slice(0, inputMessage.lastIndexOf('@', inputMessage.length)).length
        const textAfter = inputMessage.slice(inputMessage.indexOf(' ', inputMessage.lastIndexOf('@')) !== -1 ? inputMessage.indexOf(' ', inputMessage.lastIndexOf('@')) : inputMessage.length)

        // Simpler approach: find the last @ and replace the part after it up to next space or end
        const lastAtIndex = inputMessage.lastIndexOf('@')
        const newText = inputMessage.slice(0, lastAtIndex) + `@${name.replace(/\s+/g, '')} `

        setInputMessage(newText)
        setShowMentions(false)
    }

    const handleKeyDown = (e) => {
        if (showMentions) {
            if (e.key === 'ArrowDown') {
                e.preventDefault()
                setSelectedIndex(prev => (prev + 1) % filteredMembers.length)
            } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                setSelectedIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length)
            } else if (e.key === 'Enter' || e.key === 'Tab') {
                e.preventDefault()
                if (filteredMembers[selectedIndex]) {
                    selectPersona(filteredMembers[selectedIndex].personas.name)
                }
            } else if (e.key === 'Escape') {
                setShowMentions(false)
            }
        }
    }

    const filteredMembers = group?.group_members?.filter(m =>
        m.personas?.name.toLowerCase().includes(mentionQuery.toLowerCase())
    ) || []

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('openrouter_api_key', apiKey.trim())
            setShowApiKeyPrompt(false)
        }
    }

    if (loading) return <Loading message="Calibrating Neural Hub..." />

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* Premium Hub Header */}
            <header className="glass-card mx-6 mt-6 mb-4 border-b border-primary-500/10">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                {group.group_members?.map((m, i) => (
                                    <div key={i} className={`w-10 h-10 rounded-xl border-2 border-background bg-primary-900/50 flex items-center justify-center overflow-hidden transition-all duration-500 ${activeSpeaker?.id === m.persona_id ? 'scale-125 border-primary-500 z-20 shadow-[0_0_20px_rgba(168,85,247,0.6)]' : 'z-10 grayscale-[0.5] opacity-60'}`}>
                                        {m.personas?.avatar_url ? (
                                            <img src={m.personas.avatar_url} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-white/50">{m.personas?.name.charAt(0)}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h1 className="text-xl font-black font-display tracking-tight text-white uppercase">{group.name}</h1>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 truncate">Collective Coherence: Optimized</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary-400">Total Linked Mindsets</span>
                            <span className="text-[10px] font-bold text-white/60">{group.group_members?.length || 0} Entities Active</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 container mx-auto px-6 grid lg:grid-cols-12 gap-6 overflow-hidden mb-8">

                {/* The Void (Chat) */}
                <div className="lg:col-span-8 flex flex-col h-full glass-card overflow-hidden relative">
                    {/* Visual Flourish */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                        <Users className="w-96 h-96" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                                <Users className="w-16 h-16 text-primary-500/20 animate-pulse" />
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black uppercase tracking-tighter text-white/40">The Council is Formed</h3>
                                    <p className="text-white/20 text-xs max-w-sm italic leading-relaxed mx-auto px-8 py-4 border-y border-white/5">
                                        "Unified by neural convergence, we await your command. Address the collective or target specific entities with @name."
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className="max-w-[85%] sm:max-w-[70%] space-y-2">
                                        {msg.sender_type === 'persona' && (
                                            <div className="flex items-center gap-2 mb-1 pl-1">
                                                <div className="w-5 h-5 rounded-lg bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                                                    <Brain className="w-3 h-3 text-primary-400" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-primary-400">{msg.persona_name}</span>
                                                {msg.mood && (
                                                    <span className="text-[8px] font-bold text-white/20 uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/5">
                                                        {MOOD_LABELS[msg.mood]}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        <div className={`${msg.sender_type === 'user'
                                            ? 'bg-primary-500 text-white rounded-2xl rounded-tr-sm px-6 py-4 shadow-[0_5px_20px_rgba(168,85,247,0.25)] font-medium'
                                            : msg.sender_type === 'system'
                                                ? 'bg-red-500/5 border border-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg'
                                                : 'bg-white/5 border border-white/10 text-white/90 rounded-2xl rounded-tl-sm px-6 py-4 backdrop-blur-md shadow-sm'
                                            }`}>
                                            <div className="markdown-content text-sm sm:text-base leading-relaxed">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Neural Retrieval / Thinking State */}
                        {(sending || isRetrieving) && (
                            <div className="flex justify-start animate-fade-in">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3 pl-1">
                                        <div className="relative">
                                            <div className="w-4 h-4 rounded-full border-2 border-primary-500/30 border-t-primary-500 animate-spin" />
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-[0.3em] text-primary-400 animate-pulse">
                                            {isRetrieving ? 'Collective Archival Access...' : 'Generating Neural Output...'}
                                        </span>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-8 py-5">
                                        <div className="loading-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Collective Input */}
                    <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-white/[0.01]">
                        <div className="flex gap-4 relative">
                            {showMentions && filteredMembers.length > 0 && (
                                <div className="absolute bottom-full left-0 mb-4 w-72 border-primary-500/50 overflow-hidden z-[100] animate-slide-up shadow-[0_20px_80px_rgba(0,0,0,1)] bg-slate-950 border border-white/10 rounded-2xl">
                                    <div className="p-4 border-b border-white/10 bg-primary-600/20 flex items-center gap-3">
                                        <div className="w-6 h-6 rounded-lg bg-primary-500/20 flex items-center justify-center border border-primary-500/30">
                                            <Brain className="w-3.5 h-3.5 text-primary-400" />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-200">Neural Targeting</span>
                                    </div>
                                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                                        {filteredMembers.map((m, idx) => (
                                            <div
                                                key={m.persona_id}
                                                onClick={() => selectPersona(m.personas.name)}
                                                onMouseEnter={() => setSelectedIndex(idx)}
                                                className={`p-4 flex items-center gap-4 cursor-pointer transition-all duration-200 border-l-4 ${selectedIndex === idx
                                                    ? 'bg-white/10 border-primary-500 shadow-inner'
                                                    : 'hover:bg-white/5 border-transparent'}`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden border-2 shrink-0 transition-transform duration-300 ${selectedIndex === idx ? 'border-primary-400 scale-110 shadow-[0_0_15px_rgba(168,85,247,0.5)]' : 'border-white/10'}`}>
                                                    {m.personas?.avatar_url ? (
                                                        <img src={m.personas.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-xs font-black text-primary-400">{m.personas?.name.charAt(0)}</span>
                                                    )}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-black uppercase tracking-tight text-cyan-400">
                                                        {m.personas?.name}
                                                    </p>
                                                    <p className={`text-[9px] font-bold uppercase truncate tracking-[0.1em] ${selectedIndex === idx ? 'text-primary-300' : 'text-white/40'}`}>
                                                        {m.personas?.occupation || 'Linked Entity'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={handleInputChange}
                                onKeyDown={handleKeyDown}
                                placeholder="Communicate with the Collective Hub... (use @ to target)"
                                className="input-field flex-1 pr-14 transition-all focus:border-primary-500"
                                disabled={sending}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                <Button type="submit" disabled={sending || !inputMessage.trim()} className="p-3 min-w-0 glow-effect rounded-xl">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-4 px-2 opacity-30">
                            <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5"><Zap className="w-2.5 h-2.5" /> Collective Engine v2.0</span>
                            <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5"><Sparkles className="w-2.5 h-2.5" /> RAG-Enabled Search</span>
                            <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">@mention Targeting: Active</span>
                        </div>
                    </form>
                </div>

                {/* Entity Roster Sidebar */}
                <div className="lg:col-span-4 hidden lg:block h-full">
                    <div className="glass-card p-8 border-l-2 border-primary-500/50 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 flex items-center gap-3">
                                <Users className="w-4 h-4 text-primary-400" /> Linked Mindsets
                            </h3>
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="p-2 bg-primary-500/10 hover:bg-primary-500/20 rounded-lg border border-primary-500/20 text-primary-400 transition-all hover:scale-105 active:scale-95"
                                title="Link More Entities"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pr-2">
                            {group.group_members?.map((m, i) => (
                                <div key={i} className={`p-5 rounded-2xl border-2 transition-all duration-700 ${activeSpeaker?.id === m.persona_id ? 'bg-primary-500/10 border-primary-500 shadow-[0_0_30px_rgba(168,85,247,0.15)] ring-1 ring-primary-500/50' : 'bg-white/5 border-white/5'}`}>
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl bg-primary-900/50 flex items-center justify-center overflow-hidden shrink-0 border-2 transition-all duration-500 ${activeSpeaker?.id === m.persona_id ? 'border-primary-500 scale-105' : 'border-white/5 grayscale opacity-50'}`}>
                                            {m.personas?.avatar_url ? (
                                                <img src={m.personas.avatar_url} className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-lg font-black">{m.personas?.name.charAt(0)}</span>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className={`font-black uppercase tracking-tight truncate ${activeSpeaker?.id === m.persona_id ? 'text-white' : 'text-white/40'}`}>{m.personas?.name}</p>
                                            <p className="text-[9px] font-black text-white/20 uppercase tracking-[0.2em] truncate">{m.personas?.occupation || 'Linked Entity'}</p>
                                        </div>
                                    </div>

                                    {activeSpeaker?.id === m.persona_id && (
                                        <div className="mt-5 pt-5 border-t border-primary-500/20 flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[8px] font-black uppercase text-primary-400 tracking-widest">Neural Status</span>
                                                <span className="text-[8px] font-black uppercase text-white/40 tracking-widest animate-pulse">Transmitting...</span>
                                            </div>
                                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary-500 animate-progress-fast" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Sparkles className="w-2.5 h-2.5 text-primary-500" />
                                                <span className="text-[9px] font-bold text-primary-400 capitalize">{activeSpeaker.mood ? MOOD_LABELS[activeSpeaker.mood] : 'Neural Shift'}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Operational Intel */}
                        <div className="mt-8 p-6 bg-primary-500/5 rounded-2xl border border-primary-500/10 relative overflow-hidden group">
                            <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Zap className="w-24 h-24" />
                            </div>
                            <div className="flex items-center gap-3 mb-3">
                                <Info className="w-4 h-4 text-primary-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Sync Protocol</span>
                            </div>
                            <p className="text-[10px] text-white/30 leading-relaxed font-medium italic">
                                "The council shares a integrated memory pool. Use <span className="text-primary-400">@name</span> for directed neural focus."
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* API Modal - Matches Chat style */}
            {showApiKeyPrompt && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-background/90 backdrop-blur-2xl">
                    <div className="glass-card max-w-md w-full p-10 border-2 border-primary-500/30">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <Users className="w-16 h-16 text-primary-500 animate-pulse" />
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Collective Link Key</h2>
                                <p className="text-white/40 text-sm">Authorise the neural collective via Google Gemini or OpenRouter to initialize the council interaction.</p>
                            </div>
                            <div className="w-full space-y-4">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIza... or sk-or-..."
                                    className="input-field text-center font-mono py-4"
                                />
                                <Button onClick={handleSaveApiKey} className="w-full py-5 text-lg font-black tracking-widest glow-effect uppercase tracking-widest text-xs">Authorize Collective</Button>
                                <p className="text-[9px] text-white/20 font-black uppercase tracking-[0.3em] flex flex-wrap justify-center gap-x-2">
                                    <span>Google: <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-primary-500 hover:underline">AI Studio</a></span>
                                    <span>|</span>
                                    <span>OpenRouter: <a href="https://openrouter.ai/keys" target="_blank" className="text-primary-500 hover:underline">Keys</a></span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showAddModal && (
                <AddPersonaModal
                    group={group}
                    userId={user.id}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false)
                        loadHubData()
                    }}
                />
            )}
        </div>
    )
}
