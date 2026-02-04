import { Link } from 'react-router-dom'
import { Heart, Sparkles, Shield, Infinity } from 'lucide-react'
import Button from '../components/common/Button'

export default function Landing() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="relative overflow-hidden">
                {/* Animated Background */}
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
                </div>

                {/* Navbar */}
                <nav className="relative z-10 container mx-auto px-6 py-6 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <Infinity className="w-8 h-8 text-primary-400" />
                        <h1 className="text-3xl font-display font-bold gradient-text">EMRYS</h1>
                    </div>
                    <div className="space-x-4">
                        <Link to="/login">
                            <Button variant="secondary">Login</Button>
                        </Link>
                        <Link to="/signup">
                            <Button variant="primary">Get Started</Button>
                        </Link>
                    </div>
                </nav>

                {/* Hero Content */}
                <div className="relative z-10 container mx-auto px-6 py-20 text-center">
                    <div className="max-w-4xl mx-auto">
                        <h1 className="text-6xl md:text-7xl font-display font-bold mb-6 animate-fade-in">
                            Make Memories
                            <span className="block gradient-text mt-2">Immortal</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/80 mb-12 leading-relaxed animate-slide-up">
                            Preserve the essence of those you love. Create AI-powered personas that capture
                            their personality, wisdom, and spirit. Connect with them anytime, anywhere.
                        </p>
                        <Link to="/signup">
                            <Button className="text-lg px-10 py-4 glow-effect">
                                Begin Your Journey
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-6 py-20">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 gradient-text">
                    Why EMRYS?
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Feature 1 */}
                    <div className="glass-card-hover p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Heart className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-4">Emotional Connection</h3>
                        <p className="text-white/70">
                            Preserve the unique personality, speech patterns, and memories of your loved ones.
                        </p>
                    </div>

                    {/* Feature 2 */}
                    <div className="glass-card-hover p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-4">AI-Powered Wisdom</h3>
                        <p className="text-white/70">
                            Get advice and guidance in their voice, based on their values and experiences.
                        </p>
                    </div>

                    {/* Feature 3 */}
                    <div className="glass-card-hover p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-gold-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-4">Safe & Private</h3>
                        <p className="text-white/70">
                            Your data is secure. Built-in safety filters protect against harmful advice.
                        </p>
                    </div>

                    {/* Feature 4 */}
                    <div className="glass-card-hover p-8 text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <Infinity className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-4">Forever Preserved</h3>
                        <p className="text-white/70">
                            Personas learn and grow with each conversation, becoming more authentic over time.
                        </p>
                    </div>
                </div>
            </div>

            {/* How It Works */}
            <div className="container mx-auto px-6 py-20">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 gradient-text">
                    How It Works
                </h2>

                <div className="max-w-3xl mx-auto space-y-8">
                    <div className="glass-card p-8 flex items-start space-x-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-2xl font-bold">
                            1
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-semibold mb-3">Create a Persona</h3>
                            <p className="text-white/70 text-lg">
                                Share details about the person - their personality, memories, interests, and how they speak.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-8 flex items-start space-x-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center text-2xl font-bold">
                            2
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-semibold mb-3">Start Conversations</h3>
                            <p className="text-white/70 text-lg">
                                Chat naturally with the AI persona. They'll respond in character, drawing from the details you provided.
                            </p>
                        </div>
                    </div>

                    <div className="glass-card p-8 flex items-start space-x-6">
                        <div className="flex-shrink-0 w-12 h-12 bg-gold-500 rounded-full flex items-center justify-center text-2xl font-bold">
                            3
                        </div>
                        <div>
                            <h3 className="text-2xl font-display font-semibold mb-3">Watch Them Grow</h3>
                            <p className="text-white/70 text-lg">
                                The persona learns from your conversations, automatically updating their knowledge and becoming more authentic.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="container mx-auto px-6 py-20">
                <div className="glass-card p-12 text-center max-w-3xl mx-auto glow-effect">
                    <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
                        Ready to Preserve Your <span className="gradient-text">Memories</span>?
                    </h2>
                    <p className="text-xl text-white/80 mb-8">
                        Join EMRYS today and keep your loved ones' wisdom alive forever.
                    </p>
                    <Link to="/signup">
                        <Button className="text-lg px-10 py-4">
                            Create Your First Persona
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Footer */}
            <footer className="container mx-auto px-6 py-8 border-t border-white/10">
                <div className="text-center text-white/50">
                    <p>&copy; 2026 EMRYS. Making memories immortal.</p>
                </div>
            </footer>
        </div>
    )
}
