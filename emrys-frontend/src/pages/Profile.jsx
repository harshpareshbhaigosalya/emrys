import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Key, User, Shield, Info, Zap, Settings, Globe } from 'lucide-react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import Loading from '../components/common/Loading'
import { authHelpers } from '../services/supabase'

export default function Profile({ user }) {
    const navigate = useNavigate()
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [apiKey, setApiKey] = useState(localStorage.getItem('openrouter_api_key') || '')
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        loadProfile()
    }, [user])

    const loadProfile = async () => {
        try {
            const profileData = await authHelpers.getUserProfile(user.id)
            setProfile(profileData)
        } catch (error) {
            console.error('Error loading profile:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSaveApiKey = () => {
        localStorage.setItem('openrouter_api_key', apiKey)
        setMessage({ type: 'success', text: 'Neural Key synchronised successfully!' })
        setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    }

    if (loading) {
        return <Loading message="Accessing Identity Core..." />
    }

    return (
        <div className="min-h-screen pb-20 bg-background selection:bg-primary-500/30">
            {/* Header */}
            <header className="glass-card mx-6 mt-6 mb-12 border-primary-500/10">
                <div className="container mx-auto px-8 py-5 flex justify-between items-center">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="p-3 hover:bg-white/10 rounded-xl transition-all border border-transparent hover:border-white/10"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black font-display tracking-tight uppercase text-white">Identity <span className="text-primary-500">Core</span></h1>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Neural Configuration Settings</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="container mx-auto px-6 max-w-5xl grid lg:grid-cols-12 gap-8">

                {/* Left Column: Profile Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="glass-card p-8 border-t-4 border-primary-500 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none group-hover:scale-110 transition-transform">
                            <User className="w-32 h-32" />
                        </div>

                        {/* FIX: Centered and straightened Profile Picture */}
                        <div className="flex flex-col items-center">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-500/20 to-cyan-500/20 border-2 border-primary-500/30 flex items-center justify-center p-1 mb-6 relative shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                                <div className="w-full h-full rounded-[2.3rem] bg-background flex items-center justify-center overflow-hidden">
                                    <User className="w-16 h-16 text-primary-500/50" />
                                </div>
                                <div className="absolute -bottom-2 px-4 py-1 rounded-full bg-primary-500 text-[8px] font-black uppercase tracking-widest text-white shadow-xl">Verified User</div>
                            </div>

                            <div className="text-center space-y-1">
                                <h2 className="text-xl font-black uppercase tracking-tight">{profile?.full_name}</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{profile?.email}</p>
                            </div>
                        </div>

                        <div className="mt-10 space-y-6">
                            <div className="pt-6 border-t border-white/5">
                                <span className="text-[9px] font-black uppercase tracking-widest text-primary-400 block mb-2">Sync Genesis</span>
                                <p className="text-sm font-bold text-white/60">
                                    {new Date(profile?.created_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                            {profile?.referral_source && (
                                <div className="pt-6 border-t border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-primary-400 block mb-2">Acquisition Path</span>
                                    <p className="text-sm font-bold text-white/60">{profile.referral_source}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Key & Security */}
                <div className="lg:col-span-8 space-y-8">
                    {message.text && (
                        <div className={`p-5 rounded-2xl border flex items-center gap-4 animate-slide-up ${message.type === 'success' ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-red-500/10 border-red-500/30 text-red-500'
                            }`}>
                            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
                            <p className="text-xs font-black uppercase tracking-widest">{message.text}</p>
                        </div>
                    )}

                    {/* API Key Configuration */}
                    <div className="glass-card p-10 relative overflow-hidden group">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 rounded-xl bg-primary-500/10 border border-primary-500/20">
                                <Key className="w-6 h-6 text-primary-400" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black uppercase tracking-tight">Neural Sync Hub</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Google Gemini & OpenRouter Integration</p>
                            </div>
                        </div>

                        <p className="text-white/40 text-sm leading-relaxed mb-8 italic">
                            Your Neural Key bridges the link to advanced consciousness models. We now support
                            <span className="text-primary-400"> Google Gemini (Free)</span> and OpenRouter.
                            Stored locally on your device—never transmitted to our global core.
                        </p>

                        <div className="space-y-6">
                            <div className="relative">
                                <Input
                                    label="Neural Access Key"
                                    type="password"
                                    value={apiKey}
                                    onChange={(e) => setApiKey(e.target.value)}
                                    placeholder="AIza... or sk-or-..."
                                    className="pr-12"
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button onClick={handleSaveApiKey} className="px-10 py-4 glow-effect flex items-center gap-3">
                                    <Save className="w-5 h-5" />
                                    <span className="font-black uppercase tracking-widest text-xs">Synchronise Key</span>
                                </Button>
                                <a
                                    href="https://aistudio.google.com/app/apikey"
                                    target="_blank"
                                    className="flex-1 glass-card border-primary-500/20 hover:border-primary-500/50 flex items-center justify-center gap-2 group transition-all"
                                >
                                    <Globe className="w-4 h-4 text-primary-400 group-hover:animate-spin" />
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40 group-hover:text-primary-400">Get Free Gemini Key</span>
                                </a>
                            </div>
                        </div>

                        <div className="mt-10 p-6 bg-white/[0.02] rounded-2xl border border-white/5">
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="w-3 h-3 text-primary-400" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/30">Synaptic Cost Estimate</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase text-white/20">Gemini 1.5 (Free)</span>
                                    <p className="text-[10px] font-bold text-green-500/60">0.00 Credits</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase text-white/20">Llama 3 (Free)</span>
                                    <p className="text-[10px] font-bold text-green-500/60">OpenRouter (Free)</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase text-white/20">Claude 3.5</span>
                                    <p className="text-[10px] font-bold text-white/40">~$0.02 / Session</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase text-white/20">GPT-4 Turbo</span>
                                    <p className="text-[10px] font-bold text-white/40">~$0.03 / Session</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase text-white/20">Neural Engine</span>
                                    <p className="text-[10px] font-bold text-primary-500">v2.8 Deep Link</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Security & Intelligence Core */}
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 border-l-2 border-cyan-500">
                            <div className="flex items-center gap-3 mb-6">
                                <Shield className="w-5 h-5 text-cyan-400" />
                                <h3 className="text-lg font-black uppercase tracking-tight">Access Control</h3>
                            </div>
                            <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">
                                All persona manifestations and conversational logs are protected by Row-Level Security.
                                Neural data is fragmented and only accessible via your unique encrypted session.
                            </p>
                        </div>
                        <div className="glass-card p-8 border-l-2 border-primary-500">
                            <div className="flex items-center gap-3 mb-6">
                                <Info className="w-5 h-5 text-primary-400" />
                                <h3 className="text-lg font-black uppercase tracking-tight">Intelligence Ops</h3>
                            </div>
                            <p className="text-[11px] font-medium text-white/40 leading-relaxed italic">
                                Built-in ethical filters prevent the generation of harmful medical, financial, or
                                legal directives. Personas operate within an empathic boundary protocol.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
