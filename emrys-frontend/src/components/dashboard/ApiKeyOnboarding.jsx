import { motion } from 'framer-motion'
import { Key, Sparkles, Globe, ArrowRight, Info, ShieldCheck, Zap } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Button from '../common/Button'

export default function ApiKeyOnboarding() {
    const navigate = useNavigate()

    const steps = [
        {
            icon: <Globe className="w-5 h-5 text-cyan-400" />,
            title: "Get your link",
            desc: "Click the 'Get Key' button to go to Google or OpenRouter."
        },
        {
            icon: <ShieldCheck className="w-5 h-5 text-green-400" />,
            title: "Copy the Key",
            desc: "Create a new API key and copy the long code provided."
        },
        {
            icon: <Key className="w-5 h-5 text-primary-400" />,
            title: "Paste & Sync",
            desc: "Paste it into your EMRYS profile and click 'Sync Key'."
        }
    ]

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
        >
            <div className="glass-card p-8 sm:p-12 border-t-4 border-primary-500 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                <div className="relative z-10">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
                                <Sparkles className="w-3 h-3 text-primary-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-primary-400">Action Required</span>
                            </div>
                            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight font-display">
                                Initialize Your <br />
                                <span className="gradient-text">Neural Link</span>
                            </h2>
                            <p className="text-white/40 text-sm max-w-md font-medium leading-relaxed italic">
                                To give life to your personas, EMRYS needs a connection to a brain model.
                                Think of the API Key as a digital soul that powers the intelligence.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <Button
                                onClick={() => navigate('/profile')}
                                className="px-10 py-5 glow-effect flex items-center justify-center gap-3 group"
                            >
                                <Settings className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
                                <span className="font-black uppercase tracking-widest text-xs">Go to Setup Page</span>
                            </Button>
                            <p className="text-[10px] text-center text-white/20 font-black uppercase tracking-[0.2em]">Takes less than 2 minutes</p>
                        </div>
                    </div>

                    {/* Non-tech Friendly Steps */}
                    <div className="grid md:grid-cols-3 gap-8 mb-12">
                        {steps.map((step, i) => (
                            <div key={i} className="bg-white/[0.02] p-6 rounded-2xl border border-white/5 space-y-4">
                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                    {step.icon}
                                </div>
                                <h4 className="text-xs font-black uppercase tracking-widest text-white/80">{step.title}</h4>
                                <p className="text-[10px] text-white/40 font-bold leading-relaxed">{step.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Tutorial / Help Box */}
                    <div className="p-6 bg-primary-500/5 rounded-2xl border border-primary-500/20 flex gap-6 items-start">
                        <div className="p-2 bg-primary-500/20 rounded-lg shrink-0">
                            <Info className="w-5 h-5 text-primary-400" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary-400">Not a tech person?</h4>
                            <p className="text-[11px] text-white/50 leading-relaxed font-medium italic">
                                Don't worry! Most users use **Google Gemini** because it's completely free.
                                On the setup page, just click "Get Free Gemini Key", sign in with Google,
                                and click the blue button that says "Create API key". Copy that code and you're done!
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

function Settings({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>
    )
}
