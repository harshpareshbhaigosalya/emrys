import { useState, useEffect } from 'react'
import { Brain, Sparkles, Clock, MessageSquare, Zap, Activity, RefreshCw } from 'lucide-react'
import { personaHelpers, supabase } from '../../services/supabase'
import axios from 'axios'
import Button from '../common/Button'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

export default function NeuralFeed({ user, personas }) {
    const [posts, setPosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const apiKey = localStorage.getItem('openrouter_api_key')

    useEffect(() => {
        loadPosts()
    }, [user])

    const loadPosts = async () => {
        try {
            setLoading(true)
            const data = await personaHelpers.getPosts(user.id)
            setPosts(data || [])
        } catch (err) {
            console.error('Failed to load feed:', err)
        } finally {
            setLoading(false)
        }
    }

    const triggerReflection = async () => {
        if (!personas || personas.length === 0 || generating || !apiKey) return

        try {
            setGenerating(true)
            // Pick a random persona for reflection
            const persona = personas[Math.floor(Math.random() * personas.length)]

            const response = await axios.post(`${BACKEND_URL}/api/life/reflect`, {
                persona,
                user_id: user.id,
                api_key: apiKey
            })

            const newPost = {
                persona_id: persona.id,
                user_id: user.id,
                content: response.data.content,
                mood_code: response.data.mood_code,
                post_type: 'reflection'
            }

            // Save to DB via frontend service (or let backend do it, but here we save manually to persona_posts)
            const { data, error } = await supabase
                .from('persona_posts')
                .insert([newPost])
                .select(`
                    *,
                    personas (name, avatar_url, occupation)
                `)
                .single()

            if (data) setPosts(prev => [data, ...prev])

        } catch (err) {
            console.error('Reflection failed:', err)
        } finally {
            setGenerating(false)
        }
    }

    if (loading && posts.length === 0) {
        return (
            <div className="glass-card p-12 text-center animate-pulse">
                <Activity className="w-10 h-10 text-primary-500/20 mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Accessing Neural Timelines...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
                    <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white/40 flex items-center gap-2">
                        <Clock className="w-4 h-4" /> Neural Timelines
                    </h3>
                </div>
                <button
                    onClick={triggerReflection}
                    disabled={generating || !apiKey}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all text-xs font-black uppercase tracking-widest text-white/40 hover:text-primary-400 group disabled:opacity-30"
                >
                    <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
                    {generating ? 'Syncing...' : 'Initiate Pulse'}
                </button>
            </div>

            {posts.length === 0 ? (
                <div className="glass-card p-16 text-center border-dashed border-2 border-white/5">
                    <Brain className="w-12 h-12 text-white/10 mx-auto mb-6" />
                    <h4 className="text-lg font-black uppercase tracking-widest text-white/20 mb-2">The Silence of the Nexus</h4>
                    <p className="text-[10px] text-white/20 font-bold uppercase tracking-widest italic max-w-xs mx-auto mb-8">
                        No spontaneous thoughts detected. Communicate with your personas to spark neural activity.
                    </p>
                    <Button onClick={triggerReflection} disabled={generating || !apiKey} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest">
                        Generate Frst Pulse
                    </Button>
                </div>
            ) : (
                <div className="space-y-4">
                    {posts.map((post) => (
                        <div key={post.id} className="glass-card p-6 border-white/5 hover:border-primary-500/20 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity">
                                <Sparkles className="w-16 h-16" />
                            </div>

                            <div className="flex gap-4 items-start relative z-10">
                                <div className="w-12 h-12 shrink-0 rounded-2xl bg-primary-900/30 border border-white/10 overflow-hidden">
                                    {post.personas?.avatar_url ? (
                                        <img src={post.personas.avatar_url} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Brain className="w-6 h-6 text-white/20" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-black uppercase tracking-tight text-white/80">{post.personas?.name}</span>
                                            <span className="w-1 h-1 rounded-full bg-white/10" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-primary-400/60">Reflection</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest text-white/20">
                                            {new Date(post.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-sm font-medium text-white/60 leading-relaxed italic">
                                        "{post.content}"
                                    </p>
                                    <div className="pt-3 flex items-center gap-4">
                                        <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <Zap className="w-3 h-3 text-primary-400" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-500/80">Active Pulse</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                                            <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-cyan-500/80">Sentiment Sync</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
