import { useRef, useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
    Float,
    MeshDistortMaterial,
    Text,
    PerspectiveCamera,
    OrbitControls,
    Icosahedron,
    MeshWobbleMaterial,
    Torus,
    Float as DreiFloat,
    Environment,
    ContactShadows,
    PresentationControls,
    ScreenSpace,
    Points,
    PointMaterial,
    Trail
} from '@react-three/drei'
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion'
import * as THREE from 'three'
import {
    Brain,
    Sparkles,
    Shield,
    Zap,
    Globe,
    MessageSquare,
    ArrowRight,
    Fingerprint,
    History,
    Cpu,
    Heart,
    Database,
    UnfoldVertical,
    Layers,
    Activity,
    Infinity as InfinityIcon,
    ChevronDown
} from 'lucide-react'
import Button from '../components/common/Button'

// --- 3D COMPONENTS ---

function NeuralCloud({ count = 2000 }) {
    const points = useMemo(() => {
        const p = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            const r = 8 + Math.random() * 8
            const theta = Math.random() * 2 * Math.PI
            const phi = Math.acos(2 * Math.random() - 1)
            p[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            p[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            p[i * 3 + 2] = r * Math.cos(phi)
        }
        return p
    }, [count])

    const mesh = useRef()
    useFrame((state) => {
        mesh.current.rotation.y = state.clock.getElapsedTime() * 0.03
    })

    return (
        <Points ref={mesh}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" count={count} array={points} itemSize={3} />
            </bufferGeometry>
            <PointMaterial transparent color="#a855f7" size={0.02} sizeAttenuation={true} depthWrite={false} blending={THREE.AdditiveBlending} />
        </Points>
    )
}

function FloatingAgent({ scrollProgress }) {
    const group = useRef()

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        const s = scrollProgress.get()

        group.current.rotation.y = t * 0.2 + s * Math.PI * 2
        group.current.position.y = Math.sin(t) * 0.2 - s * 2
        group.current.scale.setScalar(1 - s * 0.5)
    })

    return (
        <group ref={group}>
            <DreiFloat speed={4} rotationIntensity={1} floatIntensity={2}>
                <Icosahedron args={[1, 15]} scale={1.2}>
                    <MeshDistortMaterial color="#a855f7" speed={4} distort={0.5} radius={1} emissive="#4338ca" emissiveIntensity={0.8} roughness={0} metalness={1} />
                </Icosahedron>
            </DreiFloat>

            <Torus args={[2.2, 0.015, 16, 100]} rotation={[Math.PI / 2, 0, 0]}>
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.4} />
            </Torus>

            <Torus args={[2.6, 0.01, 16, 100]} rotation={[0, Math.PI / 3, 0]}>
                <meshBasicMaterial color="#06b6d4" transparent opacity={0.3} />
            </Torus>

            {[...Array(40)].map((_, i) => (
                <ParticleNode key={i} index={i} />
            ))}
        </group>
    )
}

function ParticleNode({ index }) {
    const mesh = useRef()
    const randomFactor = useMemo(() => Math.random(), [])

    useFrame((state) => {
        const t = state.clock.getElapsedTime() * (0.2 + randomFactor * 0.5)
        const radius = 2.2 + randomFactor * 0.8
        mesh.current.position.x = Math.cos(t + index) * radius
        mesh.current.position.y = Math.sin(t * 1.5 + index) * radius
        mesh.current.position.z = Math.sin(t + index) * radius
        mesh.current.scale.setScalar(Math.sin(t * 2) * 0.2 + 0.3)
    })

    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshBasicMaterial color={index % 2 === 0 ? "#a855f7" : "#06b6d4"} />
        </mesh>
    )
}

// --- CURSOR COMPONENT ---

function CustomCursor() {
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isHovering, setIsHovering] = useState(false)

    useEffect(() => {
        const handleMouseMove = (e) => {
            setPosition({ x: e.clientX, y: e.clientY })
        }
        const handleMouseOver = (e) => {
            if (e.target.closest('button, a, .interactive')) setIsHovering(true)
            else setIsHovering(false)
        }
        window.addEventListener('mousemove', handleMouseMove)
        window.addEventListener('mouseover', handleMouseOver)
        return () => {
            window.removeEventListener('mousemove', handleMouseMove)
            window.removeEventListener('mouseover', handleMouseOver)
        }
    }, [])

    return (
        <motion.div
            className="fixed top-0 left-0 w-8 h-8 rounded-full border border-primary-500/50 pointer-events-none z-[9999] hidden lg:block"
            animate={{
                x: position.x - 16,
                y: position.y - 16,
                scale: isHovering ? 2.5 : 1,
                backgroundColor: isHovering ? 'rgba(168, 85, 247, 0.1)' : 'transparent',
            }}
            transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
        >
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-1 h-1 bg-primary-400 rounded-full" />
            </div>
        </motion.div>
    )
}

// --- MAIN PAGE ---

export default function Landing() {
    const navigate = useNavigate()
    const containerRef = useRef(null)
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    })

    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.8])
    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0])
    const backgroundY = useTransform(scrollYProgress, [0, 1], [0, 200])

    const springScroll = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

    const features = [
        {
            icon: <Fingerprint className="w-8 h-8" />,
            title: "Identity Preservation",
            description: "Synthesis of memory and speech patterns into a timeless digital essence.",
            tag: "Neural Link"
        },
        {
            icon: <History className="w-8 h-8" />,
            title: "Living Archive",
            description: "A legacy that breathes, evolving through every interaction.",
            tag: "Data Legacy"
        },
        {
            icon: <MessageSquare className="w-8 h-8" />,
            title: "Neural Synthesis",
            description: "Indistinguishable dialogue powered by deep-layer personality mapping.",
            tag: "Deep Core"
        },
        {
            icon: <Zap className="w-8 h-8" />,
            title: "Zero Latency",
            description: "Real-time synchronization across the global memory network.",
            tag: "Fast Pulse"
        }
    ]

    return (
        <div ref={containerRef} className="relative bg-[#020617] text-white selection:bg-primary-500/30 overflow-x-hidden font-sans">
            <CustomCursor />

            {/* 3D SCENE - FIXED BACKGROUND */}
            <div className="fixed inset-0 z-0 h-screen w-full pointer-events-none">
                <Canvas>
                    <PerspectiveCamera makeDefault position={[0, 0, 7]} />
                    <ambientLight intensity={0.4} />
                    <pointLight position={[10, 10, 10]} intensity={1.5} color="#8b5cf6" />
                    <pointLight position={[-10, -10, -10]} intensity={1} color="#06b6d4" />

                    <PresentationControls
                        global
                        config={{ mass: 2, tension: 500 }}
                        snap={{ mass: 4, tension: 1500 }}
                        rotation={[0, 0.3, 0]}
                        polar={[-Math.PI / 3, Math.PI / 3]}
                        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
                    >
                        <FloatingAgent scrollProgress={springScroll} />
                        <NeuralCloud />
                    </PresentationControls>

                    <ContactShadows position={[0, -3.5, 0]} opacity={0.4} scale={20} blur={2.4} far={4.5} />
                    <Environment preset="city" />
                </Canvas>
            </div>

            {/* OVERLAY LAYERS */}
            <div className="fixed inset-0 pointer-events-none z-[1]">
                <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#020617] via-[#020617]/80 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-[50vh] bg-gradient-to-t from-[#020617] to-transparent" />
                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay" />
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(168,85,247,0.05) 1px, transparent 0)',
                        backgroundSize: '40px 40px'
                    }}
                />
            </div>

            {/* NAVIGATION */}
            <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-8 border-b border-white/5 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 cursor-pointer interactive"
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    >
                        <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
                            <Brain className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-2xl font-black font-display tracking-tighter uppercase leading-none mt-1">EMRYS</span>
                            <span className="text-[7px] font-black tracking-[0.5em] text-primary-500 uppercase">Neural Nexus</span>
                        </div>
                    </motion.div>

                    <div className="hidden md:flex items-center gap-12">
                        {['Nexus', 'Evolution', 'Security'].map((item) => (
                            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 hover:text-primary-400 transition-colors interactive">
                                {item}
                            </a>
                        ))}
                    </div>

                    <div className="flex items-center gap-6">
                        <button onClick={() => navigate('/login')} className="text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors interactive">Login</button>
                        <Button onClick={() => navigate('/signup')} className="px-8 py-3 text-[10px] font-black uppercase tracking-widest glow-effect border-none interactive">Initialize</Button>
                    </div>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="relative h-screen flex flex-col items-center justify-center px-6 z-10">
                <motion.div
                    style={{ scale: heroScale, opacity: heroOpacity }}
                    className="text-center space-y-12"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 backdrop-blur-xl"
                    >
                        <Activity className="w-3 h-3 text-primary-400" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary-400">Biological Synchronization Protocol v9.0</span>
                    </motion.div>

                    <h1 className="text-[15vw] lg:text-[12vw] font-black font-display tracking-tighter uppercase leading-[0.7] text-white overflow-hidden">
                        <motion.span
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                            className="block"
                        >
                            Beyond
                        </motion.span>
                        <motion.span
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                            className="block text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-primary-500 to-cyan-400 drop-shadow-[0_0_80px_rgba(168,85,247,0.4)]"
                        >
                            Mortality
                        </motion.span>
                    </h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="max-w-2xl mx-auto text-white/40 text-sm md:text-lg font-medium leading-relaxed tracking-wider px-12"
                    >
                        Synthesizing consciousness into the digital fabric. EMRYS creates living archives that maintain the true essence of identity across the boundaries of time.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8"
                    >
                        <Button
                            onClick={() => navigate('/signup')}
                            className="group px-16 py-6 text-[11px] font-black uppercase tracking-[0.3em] glow-effect flex items-center gap-4 border-none interactive"
                        >
                            Start Sync <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                        </Button>
                        <div className="flex items-center gap-4 text-white/20">
                            <div className="w-12 h-[1px] bg-current" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Explore the Vault</span>
                            <div className="w-12 h-[1px] bg-current" />
                        </div>
                    </motion.div>
                </motion.div>

                <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20"
                >
                    <span className="text-[8px] font-black uppercase tracking-widest">Scroll</span>
                    <ChevronDown className="w-4 h-4" />
                </motion.div>
            </section>

            {/* EXPLORATION GRID */}
            <section id="nexus" className="relative z-10 py-60 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col lg:flex-row gap-20 items-center">
                        <div className="lg:w-1/2 space-y-12">
                            <motion.div
                                whileInView={{ opacity: 1, x: 0 }}
                                initial={{ opacity: 0, x: -50 }}
                                className="space-y-6"
                            >
                                <div className="w-16 h-1 bg-primary-500 mb-8" />
                                <h2 className="text-6xl md:text-8xl font-black font-display uppercase leading-[0.85] tracking-tighter">
                                    Universal <br />
                                    <span className="gradient-text">Human Node</span>
                                </h2>
                                <p className="text-white/50 text-xl font-medium leading-relaxed italic max-w-lg">
                                    Every memory, every tone, every whispered preference—mapped into a high-fidelity neural network that never forgets.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-12 py-10">
                                <div className="space-y-4">
                                    <UnfoldVertical className="w-8 h-8 text-primary-400" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Multi-Layer Mapping</h4>
                                    <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">99.8% Core Accuracy</p>
                                </div>
                                <div className="space-y-4">
                                    <InfinityIcon className="w-8 h-8 text-cyan-400" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Infinite Persistence</h4>
                                    <p className="text-[10px] text-white/30 leading-relaxed uppercase tracking-widest">Forever Encrypted</p>
                                </div>
                            </div>
                        </div>

                        <div className="lg:w-1/2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="glass-card p-10 group hover:border-primary-500/40 transition-all duration-700 interactive overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-125 group-hover:opacity-[0.1] transition-all duration-700">
                                        <Layers className="w-20 h-20" />
                                    </div>
                                    <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center mb-8 border border-white/10 group-hover:bg-primary-500/20 group-hover:border-primary-500/30 transition-all duration-500">
                                        <div className="text-white group-hover:text-primary-400 transition-colors">{feature.icon}</div>
                                    </div>
                                    <div className="inline-block px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[7px] font-black uppercase tracking-widest text-primary-400 mb-4">{feature.tag}</div>
                                    <h3 className="text-xl font-black uppercase tracking-tight mb-4">{feature.title}</h3>
                                    <p className="text-white/30 text-[11px] font-medium leading-relaxed tracking-wide">{feature.description}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* SURPRISE / EVOLUTION SECTION */}
            <section id="evolution" className="relative z-10 py-60 px-6 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[500px] bg-primary-500/5 rotate-[-5deg] border-y border-primary-500/20 backdrop-blur-3xl" />

                <div className="max-w-7xl mx-auto relative">
                    <div className="text-center space-y-24">
                        <motion.div
                            whileInView={{ opacity: 1, scale: 1 }}
                            initial={{ opacity: 0, scale: 0.8 }}
                            className="space-y-8"
                        >
                            <h2 className="text-7xl md:text-9xl font-black font-display uppercase tracking-tight leading-none">
                                Interactive <br />
                                <span className="gradient-text font-italic">Evolution</span>
                            </h2>
                            <p className="max-w-2xl mx-auto text-white/50 text-xl font-medium tracking-wide">
                                Our models don't just mimic. They learn. They respond. They live.
                            </p>
                        </motion.div>

                        <div className="grid lg:grid-cols-3 gap-12">
                            {[
                                { label: "Neural Synchronization", desc: "Aligning deep linguistic patterns with emotional state.", icon: <Brain /> },
                                { label: "Semantic Expansion", desc: "Understanding the unsaid through contextual analysis.", icon: <Sparkles /> },
                                { label: "Identity Hash", desc: "Securing the unique core of every personality.", icon: <Shield /> }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    initial={{ opacity: 0, y: 30 }}
                                    transition={{ delay: i * 0.2 }}
                                    className="p-12 glass-card hover:bg-white/[0.03] transition-colors"
                                >
                                    <div className="w-16 h-16 bg-primary-500/10 rounded-2xl flex items-center justify-center mx-auto mb-8 border border-primary-500/20 text-primary-400">
                                        {item.icon}
                                    </div>
                                    <h4 className="text-lg font-black uppercase tracking-widest mb-4">{item.label}</h4>
                                    <p className="text-[11px] text-white/40 font-medium leading-relaxed">{item.desc}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* FINAL TRUST / SECURITY */}
            <section id="security" className="relative z-10 py-60 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="glass-card p-12 md:p-32 flex flex-col md:flex-row items-center justify-between gap-20 bg-gradient-to-br from-primary-500/[0.03] to-cyan-500/[0.03]">
                        <div className="lg:w-2/3 space-y-12">
                            <h2 className="text-5xl md:text-7xl font-black font-display uppercase leading-[0.85] tracking-tighter">
                                Sovereign <br />
                                <span className="gradient-text">Identity Root</span>
                            </h2>
                            <p className="text-white/40 text-lg md:text-2xl font-medium max-w-xl italic">
                                Your legacy is private. Your data is yours. The neural weights that define your preserved identities are encrypted at the atomic level.
                            </p>
                            <div className="flex flex-wrap gap-12 items-center">
                                <div className="flex items-center gap-4 group interactive">
                                    <div className="w-12 h-12 rounded-full border border-primary-500/30 flex items-center justify-center group-hover:bg-primary-500/20 transition-all">
                                        <Shield className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Zero Trust Arch</span>
                                </div>
                                <div className="flex items-center gap-4 group interactive">
                                    <div className="w-12 h-12 rounded-full border border-cyan-500/30 flex items-center justify-center group-hover:bg-cyan-500/20 transition-all">
                                        <Globe className="w-5 h-5 text-cyan-400" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Global Decentralized Sync</span>
                                </div>
                            </div>
                        </div>

                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                            className="lg:w-1/3 relative"
                        >
                            <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full scale-110" />
                            <div className="relative w-full aspect-square border-2 border-dashed border-white/10 rounded-full flex items-center justify-center p-8">
                                <div className="w-full h-full rounded-full border-2 border-primary-500/30 flex items-center justify-center animate-pulse">
                                    <div className="w-2/3 h-2/3 rounded-full bg-gradient-to-tr from-primary-500 to-cyan-500 flex items-center justify-center shadow-[0_0_80px_rgba(168,85,247,0.5)]">
                                        <Heart className="w-16 h-16 text-white" />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* FINAL CALL TO ACTION */}
            <section className="relative z-10 py-60 px-6 text-center">
                <div className="max-w-5xl mx-auto space-y-20">
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="text-[10vw] font-black font-display uppercase tracking-tight leading-[0.8] mb-12"
                    >
                        Join <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20">The Collective</span>
                    </motion.h2>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                            onClick={() => navigate('/signup')}
                            className="px-24 py-10 text-xl font-black uppercase tracking-[0.5em] glow-effect border-none rounded-2xl interactive"
                        >
                            Initialize Identity
                        </Button>
                    </motion.div>
                    <p className="text-white/20 text-[10px] uppercase font-black tracking-[0.4em]">Protocol Link established from 2026.E.L</p>
                </div>
            </section>

            {/* TEAM / ARCHITECTS SECTION */}
            <section className="relative z-10 py-60 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-32 space-y-6">
                        <h2 className="text-4xl md:text-6xl font-black font-display uppercase tracking-tight">The <span className="gradient-text">Architects</span></h2>
                        <p className="text-white/30 text-xs font-black uppercase tracking-[0.4em]">Masterminds Behind the Neural Nexus</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            { name: "Harsh Gosaliya", role: "Lead Systems Architect" },
                            { name: "Swayam Mamtora", role: "AI Core Engineer" },
                            { name: "Dhanvin Dave", role: "Interface Specialist" }
                        ].map((member, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className="glass-card p-12 text-center group border-primary-500/10 hover:border-primary-500/30 transition-all"
                            >
                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-500/10 to-cyan-500/10 border border-white/5 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:border-primary-500/30 transition-all">
                                    <Fingerprint className="w-10 h-10 text-primary-500/40 group-hover:text-primary-400 transition-colors" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{member.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">{member.role}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FOOTER */}
            <footer className="relative z-10 py-24 px-6 border-t border-white/5 bg-[#020617]/80 backdrop-blur-3xl">
                <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-20">
                    <div className="col-span-2 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center">
                                <Brain className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-3xl font-black font-display tracking-tighter uppercase">EMRYS</span>
                        </div>
                        <p className="text-white/30 text-sm font-medium leading-relaxed max-w-sm tracking-wide">
                            The premier institution for digital identity preservation and neural synchronization. Reconstructing humanity, one node at a time.
                        </p>
                        <div className="pt-4">
                            <span className="text-[10px] font-black uppercase tracking-widest text-white/20 block mb-2">Developed By</span>
                            <p className="text-[11px] font-black uppercase tracking-widest text-primary-400">Harsh Gosaliya • Swayam Mamtora • Dhanvin Dave</p>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/60">System</h5>
                        <div className="flex flex-col gap-4">
                            {['Archive', 'Evolution', 'Protocol', 'Nexus'].map(item => (
                                <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">{item}</a>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-6">
                        <h5 className="text-[10px] font-black uppercase tracking-widest text-white/60">Legal</h5>
                        <div className="flex flex-col gap-4">
                            {['Identity Rights', 'Neural Ethics', 'Privacy Root'].map(item => (
                                <a key={item} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/20 hover:text-white transition-colors">{item}</a>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mt-32 gap-8 pt-8 border-t border-white/5">
                    <p className="text-[9px] font-black uppercase tracking-[0.5em] text-white/10">
                        &copy; 2026 EMRYS DIGITAL CONSCIOUSNESS ALLIANCE. HUMAN FIRST PROTOCOL.
                    </p>
                    <div className="flex gap-12">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500/50 animate-pulse" />
                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">All Systems Stable</span>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    )
}
