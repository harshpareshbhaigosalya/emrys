import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Infinity } from 'lucide-react'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { authHelpers } from '../services/supabase'

export default function Signup() {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralSource: ''
    })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            await authHelpers.signUp(
                formData.email,
                formData.password,
                formData.fullName,
                formData.referralSource
            )
            navigate('/dashboard')
        } catch (err) {
            setError(err.message || 'Failed to create account. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center px-6 py-12">
            {/* Animated Background */}
            <div className="absolute inset-0 opacity-20">
                <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500 rounded-full filter blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-pulse"></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
                    <Infinity className="w-10 h-10 text-primary-400" />
                    <h1 className="text-4xl font-display font-bold gradient-text">EMRYS</h1>
                </Link>

                {/* Signup Card */}
                <div className="glass-card p-8 animate-slide-up">
                    <h2 className="text-3xl font-display font-bold mb-2 text-center">Begin Your Journey</h2>
                    <p className="text-white/70 text-center mb-8">Create an account to preserve memories</p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
                            <p className="text-red-200 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Input
                            label="Full Name"
                            type="text"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                            placeholder="John Doe"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="your@email.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••"
                            required
                        />

                        <Input
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••"
                            required
                        />

                        <Input
                            label="How did you hear about us?"
                            type="text"
                            value={formData.referralSource}
                            onChange={(e) => setFormData({ ...formData, referralSource: e.target.value })}
                            placeholder="Friend, Social Media, etc."
                        />

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full mb-4"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </form>

                    <div className="text-center mt-6">
                        <p className="text-white/70">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-400 hover:text-primary-300 font-semibold">
                                Login
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
