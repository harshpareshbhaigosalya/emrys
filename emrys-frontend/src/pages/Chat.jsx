import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Eye, AlertCircle, Brain, Zap, Sparkles, MessageSquare, Info, History, Trash2, Mic, MicOff, Waves, Activity } from 'lucide-react'
import Button from '../components/common/Button'
import Loading from '../components/common/Loading'
import { personaHelpers, chatHelpers } from '../services/supabase'
import axios from 'axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function Chat({ user }) {
    const { personaId } = useParams()
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)

    const [persona, setPersona] = useState(null)
    const [conversation, setConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [inputMessage, setInputMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_api_key') || '')
    const [showApiKeyPrompt, setShowApiKeyPrompt] = useState(false)

    // Neural State
    const [currentMood, setCurrentMood] = useState('default')
    const [isRetrieving, setIsRetrieving] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [recognition, setRecognition] = useState(null)

    const MOOD_LABELS = {
        'default': 'Neural Synchronization Stable',
        'happy': 'Emotional Resonance: Warm',
        'sad': 'Emotional Resonance: Somber',
        'angry': 'Neural Activity: Intense',
        'nostalgic': 'Accessing Long-term Memory',
        'curious': 'Neural State: Inquisitive',
        'protective': 'State: Empathic Shield Active',
        'distant': 'Neural Signal: Reserved'
    }

    useEffect(() => {
        loadChatData()
    }, [personaId])

    useEffect(() => {
        scrollToBottom()
    }, [messages, isRetrieving, sending, isRecording])

    useEffect(() => {
        // Initialize Speech Recognition
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            const recog = new SpeechRecognition()
            recog.continuous = false
            recog.interimResults = false
            recog.lang = 'en-US'

            recog.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setInputMessage(prev => prev ? `${prev} ${transcript}` : transcript)
                setIsRecording(false)
            }

            recog.onerror = (event) => {
                console.error('Speech recognition error:', event.error)
                setIsRecording(false)
            }

            recog.onend = () => {
                setIsRecording(false)
            }

            setRecognition(recog)
        }
    }, [])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadChatData = async () => {
        try {
            const personaData = await personaHelpers.getById(personaId)
            setPersona(personaData)

            const conv = await chatHelpers.getOrCreateConversation(user.id, personaId)
            setConversation(conv)

            const msgs = await chatHelpers.getMessages(conv.id)
            setMessages(msgs)

            if (!apiKey) setShowApiKeyPrompt(true)
        } catch (error) {
            console.error('Error loading chat:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputMessage.trim() || sending) return
        if (!apiKey) {
            setShowApiKeyPrompt(true)
            return
        }

        const userMsg = inputMessage.trim()
        setInputMessage('')
        setSending(true)

        const tempUserMsg = {
            id: Date.now(),
            sender_type: 'user',
            content: userMsg,
            created_at: new Date().toISOString()
        }
        setMessages(prev => [...prev, tempUserMsg])

        setTimeout(() => setIsRetrieving(true), 500)

        try {
            const requestData = {
                user_id: user.id,
                persona_id: personaId,
                message: userMsg,
                api_key: apiKey
            }

            const response = await axios.post(`${BACKEND_URL}/api/chat/send`, requestData)

            if (response.data.mood) setCurrentMood(response.data.mood)
            setIsRetrieving(false)

            const aiMsg = {
                id: Date.now() + 1,
                sender_type: 'persona',
                content: response.data.response,
                created_at: new Date().toISOString(),
                safety_blocked: response.data.safety_blocked,
                retrieved: response.data.retrieved
            }
            setMessages(prev => [...prev, aiMsg])

        } catch (error) {
            console.error('Error sending message:', error)
            const serverError = error.response?.data?.error || "Neural link interrupted. Please check your connection or API key."
            const errorMsg = {
                id: Date.now() + 2,
                sender_type: 'persona',
                content: serverError,
                created_at: new Date().toISOString(),
                isError: true
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setSending(false)
            setIsRetrieving(false)
        }
    }

    const toggleRecording = () => {
        if (!recognition) {
            alert("Speech recognition is not supported in your browser.")
            return
        }

        if (isRecording) {
            recognition.stop()
        } else {
            setIsRecording(true)
            recognition.start()
        }
    }

    const handleClearHistory = async () => {
        if (!window.confirm("⚠️ Neural Wipe: Are you sure you want to permanently delete this chat history? This cannot be undone.")) return

        try {
            setLoading(true)
            await chatHelpers.clearHistory(conversation.id)
            setMessages([])
            alert("Memory sequence erased successfully.")
        } catch (err) {
            alert("Failed to erase memory: " + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveApiKey = () => {
        if (apiKey.trim()) {
            localStorage.setItem('openrouter_api_key', apiKey.trim())
            setShowApiKeyPrompt(false)
        }
    }

    if (loading) return <Loading message="Syncing neural frequencies..." />

    return (
        <div className="min-h-screen flex flex-col bg-background selection:bg-primary-500/30">
            {/* STICKY Premium Header */}
            <header className="sticky top-0 z-50 glass-card mx-6 mt-6 mb-4 border-b border-primary-500/10 backdrop-blur-2xl">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/dashboard')} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center overflow-hidden border border-primary-500/30">
                                {persona?.avatar_url ? (
                                    <img src={persona.avatar_url} className="w-full h-full object-cover" />
                                ) : (
                                    <Brain className="w-6 h-6 text-primary-400" />
                                )}
                            </div>
                            <div>
                                <h1 className="text-xl font-black font-display tracking-tight text-white uppercase">{persona?.name}</h1>
                                <div className="flex items-center gap-2">
                                    <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${sending ? 'bg-primary-500' : 'bg-green-500'}`} />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30 truncate max-w-[150px]">
                                        {MOOD_LABELS[currentMood]}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="hidden xl:flex items-center gap-4 px-4 py-2 bg-white/5 rounded-full border border-white/10 glass-card">
                        <div className="flex -space-x-2">
                            <div className="w-6 h-6 rounded-full border-2 border-background bg-primary-500 flex items-center justify-center">
                                <Activity className="w-3 h-3 text-white" />
                            </div>
                            <div className="w-6 h-6 rounded-full border-2 border-background bg-green-500 flex items-center justify-center">
                                <Sparkles className="w-3 h-3 text-white" />
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black uppercase tracking-widest text-primary-400">Biological Presence Detected</span>
                            <span className="text-[7px] text-white/40 uppercase font-bold tracking-widest">Neural Link: 98.4% Integrity</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="secondary"
                            onClick={handleClearHistory}
                            className="p-3 border-none hover:bg-red-500/10 text-red-400/50 hover:text-red-400 group"
                            title="Clear Chat History"
                        >
                            <Trash2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => navigate(`/persona/${personaId}`)}
                            className="p-3 border-none hover:bg-white/10"
                        >
                            <Eye className="w-5 h-5 text-white/60" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* Chat Body */}
            <div className="flex-1 container mx-auto px-6 mb-8 overflow-hidden grid lg:grid-cols-12 gap-6 relative">

                {/* Main Message Panel */}
                <div className="lg:col-span-12 flex flex-col h-full glass-card overflow-hidden relative border-primary-500/5">
                    {/* Background Detail */}
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] pointer-events-none">
                        <Brain className="w-96 h-96" />
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-4">
                                <Sparkles className="w-12 h-12 text-primary-500/20" />
                                <h3 className="text-xl font-black uppercase tracking-widest text-white/40">Neural Link Established</h3>
                                <p className="text-white/30 text-[10px] font-bold uppercase tracking-widest max-w-xs leading-relaxed italic border-y border-white/5 py-4">
                                    The consciousness of {persona?.name} is ready for interaction. Initializing dialogue sequence...
                                </p>
                            </div>
                        ) : (
                            messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender_type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                                    <div className="max-w-[85%] sm:max-w-[70%] space-y-1.5">
                                        {msg.sender_type === 'persona' && msg.retrieved && (
                                            <div className="flex items-center gap-1.5 pl-1 mb-1">
                                                <History className="w-3 h-3 text-primary-400" />
                                                <span className="text-[8px] font-black uppercase tracking-widest text-primary-400">Deep Memory Accessed</span>
                                            </div>
                                        )}
                                        <div className={`${msg.sender_type === 'user'
                                            ? 'bg-primary-500 text-white rounded-[2rem] rounded-tr-[5px] px-8 py-5 shadow-[0_10px_30px_rgba(168,85,247,0.2)] border-t border-white/20 -rotate-[0.5deg]'
                                            : msg.isError
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-400 px-8 py-5 rounded-[2rem] -rotate-[0.3deg]'
                                                : 'bg-white/[0.03] border border-white/5 text-white/90 rounded-[2rem] rounded-tl-[5px] px-8 py-5 backdrop-blur-3xl leading-relaxed shadow-lg rotate-[0.3deg]'
                                            }`}>
                                            {msg.safety_blocked && (
                                                <div className="flex items-center gap-2 mb-2 text-yellow-300">
                                                    <AlertCircle className="w-3 h-3" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Neural Filter Active</span>
                                                </div>
                                            )}
                                            <div className="markdown-content text-sm sm:text-base leading-relaxed">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {msg.content}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <p className="text-[9px] opacity-20 font-black uppercase tracking-tighter px-2">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}

                        {/* Retrieval / Loading State */}
                        {(sending || isRetrieving) && (
                            <div className="flex justify-start animate-pulse">
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 pl-1">
                                        <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-primary-400">
                                            {isRetrieving ? 'Accessing Archives...' : 'Neural Transmission Intake...'}
                                        </span>
                                    </div>
                                    <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-10 py-6 backdrop-blur-md">
                                        <div className="loading-dots">
                                            <span></span><span></span><span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Premium Input */}
                    <form onSubmit={handleSendMessage} className="p-8 border-t border-white/5 bg-white/[0.01]">
                        <div className="flex gap-4 relative">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder={`Communicate with ${persona?.name}...`}
                                className="input-field flex-1 pr-14 transition-all focus:border-primary-500/50"
                                disabled={sending}
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={toggleRecording}
                                    className={`p-3 rounded-xl transition-all duration-300 ${isRecording ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] scale-110' : 'bg-white/5 text-white/40 hover:text-white hover:bg-white/10'}`}
                                >
                                    {isRecording ? <MicOff className="w-5 h-5 animate-pulse" /> : <Mic className="w-5 h-5" />}
                                </button>
                                <Button type="submit" disabled={sending || !inputMessage.trim()} className="p-3 min-w-0 glow-effect rounded-xl">
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>

                            {/* Human-Touch Recording Visualizer */}
                            {isRecording && (
                                <div className="absolute -top-16 left-0 right-0 flex justify-center items-center gap-2 pointer-events-none animate-bounce">
                                    <div className="px-6 py-3 glass-card border-primary-500/30 flex items-center gap-4 shadow-2xl">
                                        <Waves className="w-5 h-5 text-primary-400 animate-pulse" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-300">Listening to your consciousness...</span>
                                        <div className="flex gap-1 h-3 items-center">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <div key={i} className="w-1 bg-primary-500/50 rounded-full" style={{ height: `${20 + Math.random() * 80}%`, animation: `pulse 0.5s ease-in-out infinite ${i * 0.1}s` }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-4 flex items-center justify-between px-2 opacity-30">
                            <div className="flex items-center gap-4">
                                <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <Zap className="w-2.5 h-2.5" /> EMRYS Core v2.8
                                </span>
                                <span className="text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                    <MessageSquare className="w-2.5 h-2.5" /> Sentiment Analysis: Active
                                </span>
                            </div>
                        </div>
                    </form>
                </div>
            </div>

            {/* API Key Modal */}
            {showApiKeyPrompt && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/80 backdrop-blur-3xl">
                    <div className="glass-card max-w-md w-full p-10 border-2 border-primary-500/30">
                        <div className="flex flex-col items-center text-center space-y-8">
                            <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center animate-pulse">
                                <Zap className="w-10 h-10 text-primary-400" />
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black uppercase tracking-tighter">Neural Link Key</h2>
                                <p className="text-white/40 text-sm italic font-medium">Authorise the neural link via Google Gemini or OpenRouter to initialize consciousness transmission.</p>
                            </div>
                            <div className="w-full space-y-4">
                                <input
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIza... or sk-or-..."
                                    className="input-field text-center font-mono py-4"
                                />
                                <Button onClick={handleSaveApiKey} className="w-full py-5 glow-effect font-black uppercase tracking-widest text-xs">Authorize Link</Button>
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
        </div>
    )
}
