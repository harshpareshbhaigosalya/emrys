import { useState, useRef } from 'react'
import { X, Sparkles, Heart, Brain, MessageCircle, Zap, Camera, Upload, Shield, FileText, Globe, Wand2, Activity } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { personaHelpers, storageHelpers } from '../../services/supabase'
import axios from 'axios'

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'

/**
 * ArrayInput Component - Moved outside to prevent focus loss
 */
const ArrayInput = ({ label, field, inputKey, currentInputs, setCurrentInputs, addArrayItem, removeArrayItem, formData, placeholder, icon: Icon }) => (
    <div className="space-y-2">
        <label className="block text-white/90 font-medium flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-primary-400" />}
            {label}
        </label>
        <div className="flex space-x-2">
            <input
                type="text"
                value={currentInputs[inputKey]}
                onChange={(e) => setCurrentInputs({ ...currentInputs, [inputKey]: e.target.value })}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault()
                        addArrayItem(field, inputKey)
                    }
                }}
                placeholder={placeholder}
                className="input-field flex-1"
            />
            <Button
                type="button"
                onClick={() => addArrayItem(field, inputKey)}
                variant="secondary"
                className="px-4 py-2 h-auto"
            >
                Add
            </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
            {formData[field]?.map((item, index) => (
                <span
                    key={`${field}-${index}`}
                    className="px-3 py-1 bg-white/10 border border-white/20 rounded-full text-sm flex items-center space-x-2 animate-fade-in"
                >
                    <span>{item}</span>
                    <button
                        type="button"
                        onClick={() => removeArrayItem(field, index)}
                        className="hover:text-red-400 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </span>
            ))}
        </div>
    </div>
)

export default function EnhancedPersonaForm({ userId, persona = null, onSuccess, onCancel }) {
    const isEditing = !!persona
    const [currentStep, setCurrentStep] = useState(1)
    const totalSteps = 6
    const fileInputRef = useRef(null)
    const avatarInputRef = useRef(null)

    const [formData, setFormData] = useState({
        // Basic Info
        name: persona?.name || '',
        relationship: persona?.relationship || '',
        occupation: persona?.occupation || '',
        age: persona?.age || '',
        location: persona?.location || '',
        avatar_url: persona?.avatar_url || '',

        // Communication Style
        calls_user_by: persona?.calls_user_by || '',
        speech_patterns: persona?.speech_patterns || '',
        typical_greeting: persona?.typical_greeting || '',
        catchphrases: persona?.catchphrases || [],
        response_style: persona?.response_style || 'balanced',
        formality_level: persona?.formality_level || 'casual',
        emoji_usage: persona?.emoji_usage || 'moderate',
        humor_level: persona?.humor_level || 'moderate',
        voice_tone: persona?.voice_tone || '',

        // Personality & Character
        personality_traits: persona?.personality_traits || [],
        qualities: persona?.qualities || [],
        values: persona?.values || [],
        strengths: persona?.strengths || [],
        weaknesses: persona?.weaknesses || [],
        pet_peeves: persona?.pet_peeves || [],
        emotional_baseline: persona?.emotional_baseline || 'neutral',

        // Interests & Knowledge
        interests: persona?.interests || [],
        favorite_topics: persona?.favorite_topics || [],
        goals: persona?.goals || [],
        fears: persona?.fears || [],

        // Memories & Context
        memories: persona?.memories || '',
        shared_experiences: persona?.shared_experiences || '',
        achievements: persona?.achievements || '',
        background_story: persona?.background_story || '',
        current_life_situation: persona?.current_life_situation || '',

        // Advanced Data
        data_dump: persona?.data_dump || '',
        life_data: persona?.life_data || '',
        uploaded_files: persona?.uploaded_files || [],
        social_media_links: persona?.social_media_links || [],

        // Conversation Settings
        conversation_starters: persona?.conversation_starters || [],
        communication_frequency: persona?.communication_frequency || 'moderate',

        // Library Settings
        is_public: persona?.is_public || false,
        category: persona?.category || 'General',
    })

    const [currentInputs, setCurrentInputs] = useState({
        trait: '',
        quality: '',
        interest: '',
        value: '',
        strength: '',
        weakness: '',
        petPeeve: '',
        goal: '',
        fear: '',
        topic: '',
        catchphrase: '',
        starter: '',
        socialLink: ''
    })

    const [loading, setLoading] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [isSynthesizing, setIsSynthesizing] = useState(false)
    const [error, setError] = useState('')

    const addArrayItem = (field, inputKey) => {
        const value = currentInputs[inputKey].trim()
        if (value) {
            setFormData(prev => ({
                ...prev,
                [field]: [...(prev[field] || []), value]
            }))
            setCurrentInputs(prev => ({ ...prev, [inputKey]: '' }))
        }
    }

    const removeArrayItem = (field, index) => {
        setFormData(prev => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index)
        }))
    }

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        try {
            setUploading(true)
            // Note: We need a persona ID to upload. If creating, we might need to upload after creation.
            // For now, let's assume update case or use a temp path.
            // Actually, let's just use a base64 for preview and upload on submit if possible, 
            // but Supabase storage is better. Let's try to upload with a random ID if isEditing is false.
            const targetId = persona?.id || `temp-${userId}-${Date.now()}`
            const url = await storageHelpers.uploadPersonaAvatar(targetId, file)
            setFormData(prev => ({ ...prev, avatar_url: url }))
        } catch (err) {
            setError('Failed to upload avatar: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const handleFileUpload = async (e) => {
        const files = Array.from(e.target.files)
        if (files.length === 0) return

        try {
            setUploading(true)
            const targetId = persona?.id || `temp-${userId}-${Date.now()}`
            const uploadedItems = []

            for (const file of files) {
                const item = await storageHelpers.uploadPersonaFile(targetId, file)
                uploadedItems.push(item)
            }

            setFormData(prev => ({
                ...prev,
                uploaded_files: [...(prev.uploaded_files || []), ...uploadedItems]
            }))
        } catch (err) {
            setError('Failed to upload files: ' + err.message)
        } finally {
            setUploading(false)
        }
    }

    const validateForm = () => {
        if (!formData.name || formData.name.trim() === '') {
            setError('Name is required')
            setCurrentStep(1)
            return false
        }
        return true
    }

    const handleSynthesize = async () => {
        if (!formData.name.trim()) {
            setError('Please enter a name to synthesize an identity.')
            return
        }

        setIsSynthesizing(true)
        setError('')
        const apiKey = localStorage.getItem('openrouter_api_key')

        try {
            const response = await axios.post(`${BACKEND_URL}/api/persona/synthesize`, {
                name: formData.name,
                api_key: apiKey
            })

            const data = response.data
            setFormData(prev => ({
                ...prev,
                ...data,
                personality_traits: Array.isArray(data.personality_traits) ? data.personality_traits : [],
                values: Array.isArray(data.values) ? data.values : [],
                catchphrases: Array.isArray(data.catchphrases) ? data.catchphrases : [],
                interests: Array.isArray(data.interests) ? data.interests : [],
                is_public: prev.is_public // Keep current privacy setting
            }))

            // Move to communication step to show progress
            setCurrentStep(2)
        } catch (err) {
            console.error('Synthesis failed:', err)
            setError('AI Synthesis failed. Please check your API key in the chat settings.')
        } finally {
            setIsSynthesizing(false)
        }
    }

    const handleSubmit = async (e) => {
        if (e) e.preventDefault()

        if (!validateForm()) return

        const confirmMessage = isEditing
            ? `Are you sure you want to update ${formData.name}?`
            : `Are you sure you want to create ${formData.name}?`

        if (!window.confirm(confirmMessage)) return

        setError('')
        setLoading(true)

        try {
            const personaData = {
                ...formData,
                user_id: userId,
                age: formData.age ? parseInt(formData.age) : null,
            }

            if (isEditing) {
                await personaHelpers.update(persona.id, personaData)
            } else {
                await personaHelpers.create(personaData)
            }

            onSuccess()
        } catch (err) {
            setError(err.message || 'Failed to save persona')
        } finally {
            setLoading(false)
        }
    }

    const handleNextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1)
        }
    }

    const handlePreviousStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1)
        }
    }

    const handleFormKeyDown = (e) => {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault()
        }
    }

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-6 h-6 text-primary-400" />
                            <h3 className="text-2xl font-display font-semibold text-primary-300">Identity & Media</h3>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center justify-center p-6 glass-card border-dashed border-2 border-white/20">
                            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-primary-900/30 flex items-center justify-center border-2 border-primary-500/50 group-hover:border-primary-400 transition-all">
                                    {formData.avatar_url ? (
                                        <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera className="w-12 h-12 text-white/30 group-hover:text-white/50 transition-colors" />
                                    )}
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 rounded-full transition-opacity">
                                    <span className="text-xs font-bold text-white uppercase tracking-wider">Change Photo</span>
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                onChange={handleAvatarUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            <p className="mt-4 text-sm text-white/50">Upload a photo to bring the persona to life</p>
                        </div>

                        <div className="space-y-6">
                            {/* Premium Synthesis Header */}
                            {!formData.name && (
                                <div className="p-4 bg-primary-500/5 border border-primary-500/10 rounded-2xl animate-fade-in text-center">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400/60">Ready to synthesize a new identity?</p>
                                </div>
                            )}

                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <Input
                                            label="Core Identity (Name) *"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            placeholder="e.g. Nikola Tesla or Marcus Aurelius"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleSynthesize}
                                        disabled={isSynthesizing || !formData.name}
                                        className={`flex items-center justify-center gap-3 px-8 py-3.5 rounded-xl font-black uppercase tracking-[0.15em] text-[11px] transition-all duration-500 group relative overflow-hidden h-[54px] min-w-[200px] w-full md:w-auto ${isSynthesizing
                                            ? 'bg-primary-500/10 text-primary-400 border border-primary-5100/30'
                                            : 'bg-primary-500 text-white shadow-[0_10px_30px_rgba(168,85,247,0.4)] hover:shadow-[0_15px_40px_rgba(168,85,247,0.6)] hover:-translate-y-1'
                                            }`}
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                        {isSynthesizing ? <Activity className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4 group-hover:rotate-12 transition-transform" />}
                                        <span>{isSynthesizing ? 'Establishing Neural Link...' : 'AI Quick Launch'}</span>
                                    </button>
                                </div>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-white/20 pl-1">
                                    {isSynthesizing ? 'Awaiting AI persona synthesis...' : 'Enter a name above and use Quick Launch to auto-generate a complete psychological profile.'}
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                <Input
                                    label="Desired Relationship"
                                    value={formData.relationship}
                                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                                    placeholder="e.g. Historical Mentor / Advisor"
                                />
                                <Input
                                    label="Occupation / Title"
                                    value={formData.occupation}
                                    onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                                    placeholder="e.g. Inventor / Polymath"
                                />
                                <Input
                                    label="Chronological/Physical Location"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g. 19th Century / Earth"
                                />
                                <Input
                                    label="Instance Age"
                                    value={formData.age}
                                    type="number"
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    placeholder="e.g. 86"
                                />
                            </div>
                        </div>

                        {/* Library Settings (Admin/Specialized) */}
                        <div className="p-6 glass-card border border-primary-500/30 bg-primary-500/5 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                <Globe className="w-16 h-16" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest text-primary-400 mb-4">Neural Nexus Publication</h4>
                            <div className="flex flex-col md:flex-row gap-6">
                                <div className="flex-1">
                                    <label className="block text-white/90 font-medium mb-2">Library Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="input-field"
                                    >
                                        <option value="General">General</option>
                                        <option value="Famous People">Famous People</option>
                                        <option value="Specialized Models">Specialized Models</option>
                                        <option value="Fictional Characters">Fictional Characters</option>
                                        <option value="Historical Figures">Historical Figures</option>
                                        <option value="Professional Agents">Professional Agents</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 py-4 px-6 rounded-xl bg-white/5 border border-white/10">
                                    <div className="flex-1">
                                        <p className="text-sm font-black uppercase tracking-tight">Make Publicly Available</p>
                                        <p className="text-[10px] text-white/40 uppercase font-bold tracking-widest">Visible to all Pulse users in the Library</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={formData.is_public}
                                            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-white/90 font-medium mb-2 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary-400" />
                                General Data Dump (Paste anything here)
                            </label>
                            <textarea
                                value={formData.data_dump}
                                onChange={(e) => setFormData({ ...formData, data_dump: e.target.value })}
                                placeholder="Paste chat logs, bio excerpts, or any raw text info about this person. AI will use this to understand them better."
                                rows="6"
                                className="textarea-field font-mono text-sm"
                            />
                        </div>
                    </div>
                )

            case 2:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <MessageCircle className="w-6 h-6 text-cyan-400" />
                            <h3 className="text-2xl font-display font-semibold text-cyan-300">Communication Style</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-white/90 font-medium mb-2">Response Depth</label>
                                <select
                                    value={formData.response_style}
                                    onChange={(e) => setFormData({ ...formData, response_style: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="brief">Brief & Direct</option>
                                    <option value="balanced">Natural / Balanced</option>
                                    <option value="detailed">Thorough & Detailed</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/90 font-medium mb-2">Social Dynamic</label>
                                <select
                                    value={formData.formality_level}
                                    onChange={(e) => setFormData({ ...formData, formality_level: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="very_casual">Very Casual / Slang</option>
                                    <option value="casual">Casual / Friendly</option>
                                    <option value="professional">Professional / Polite</option>
                                    <option value="formal">Formal / Elegant</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-white/90 font-medium mb-2">Emoji Personality</label>
                                <select
                                    value={formData.emoji_usage}
                                    onChange={(e) => setFormData({ ...formData, emoji_usage: e.target.value })}
                                    className="input-field"
                                >
                                    <option value="none">Strictly Text (No Emojis)</option>
                                    <option value="rare">Minimal (Rarely)</option>
                                    <option value="moderate">Average (Sometimes)</option>
                                    <option value="frequent">Expressive (Often)</option>
                                </select>
                            </div>

                            <Input
                                label="Voice Tone & Accent"
                                value={formData.voice_tone}
                                onChange={(e) => setFormData({ ...formData, voice_tone: e.target.value })}
                                placeholder="e.g. Calm, British accent, authoritative"
                            />
                        </div>

                        <Input
                            label="Signature Greeting"
                            value={formData.typical_greeting}
                            onChange={(e) => setFormData({ ...formData, typical_greeting: e.target.value })}
                            placeholder="e.g. 'Greetings, how may I assist you today?'"
                        />

                        <div>
                            <label className="block text-white/90 font-medium mb-2">Linguistic Quirks</label>
                            <textarea
                                value={formData.speech_patterns}
                                onChange={(e) => setFormData({ ...formData, speech_patterns: e.target.value })}
                                placeholder="Describe their unique way of speaking. Do they use specific jargon? Do they use ellipsis points? Do they speak in short sentences?"
                                rows="3"
                                className="textarea-field"
                            />
                        </div>

                        <ArrayInput
                            label="Unique Catchphrases"
                            field="catchphrases"
                            inputKey="catchphrase"
                            currentInputs={currentInputs}
                            setCurrentInputs={setCurrentInputs}
                            addArrayItem={addArrayItem}
                            removeArrayItem={removeArrayItem}
                            formData={formData}
                            placeholder="Add a phrase they use often..."
                            icon={Zap}
                        />
                    </div>
                )

            case 3:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Brain className="w-6 h-6 text-gold-400" />
                            <h3 className="text-2xl font-display font-semibold text-gold-300">Personality & Character</h3>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <ArrayInput
                                label="Personality Traits"
                                field="personality_traits"
                                inputKey="trait"
                                currentInputs={currentInputs}
                                setCurrentInputs={setCurrentInputs}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                formData={formData}
                                placeholder="e.g. Introverted, Logical"
                                icon={Sparkles}
                            />

                            <ArrayInput
                                label="Core Values"
                                field="values"
                                inputKey="value"
                                currentInputs={currentInputs}
                                setCurrentInputs={setCurrentInputs}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                formData={formData}
                                placeholder="e.g. Loyalty, Innovation"
                                icon={Heart}
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <ArrayInput
                                label="Strengths"
                                field="strengths"
                                inputKey="strength"
                                currentInputs={currentInputs}
                                setCurrentInputs={setCurrentInputs}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                formData={formData}
                                placeholder="e.g. Strategic Thinking"
                            />

                            <ArrayInput
                                label="Weaknesses / Flaws"
                                field="weaknesses"
                                inputKey="weakness"
                                currentInputs={currentInputs}
                                setCurrentInputs={setCurrentInputs}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                formData={formData}
                                placeholder="e.g. Perfectionism"
                            />
                        </div>

                        <ArrayInput
                            label="Pet Peeves"
                            field="pet_peeves"
                            inputKey="petPeeve"
                            currentInputs={currentInputs}
                            setCurrentInputs={setCurrentInputs}
                            addArrayItem={addArrayItem}
                            removeArrayItem={removeArrayItem}
                            formData={formData}
                            placeholder="Things that annoy them..."
                        />
                    </div>
                )

            case 4:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Globe className="w-6 h-6 text-purple-400" />
                            <h3 className="text-2xl font-display font-semibold text-purple-300">Background & Achievements</h3>
                        </div>

                        <div>
                            <label className="block text-white/90 font-medium mb-2">Life Story / Biography</label>
                            <textarea
                                value={formData.background_story}
                                onChange={(e) => setFormData({ ...formData, background_story: e.target.value })}
                                placeholder="The origin story of this persona..."
                                rows="5"
                                className="textarea-field"
                            />
                        </div>

                        <div>
                            <label className="block text-white/90 font-medium mb-2">Major Achievements & Milestones</label>
                            <textarea
                                value={formData.achievements}
                                onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                                placeholder="What are they most proud of?"
                                rows="3"
                                className="textarea-field"
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            <ArrayInput
                                label="Key Interests"
                                field="interests"
                                inputKey="interest"
                                currentInputs={currentInputs}
                                setCurrentInputs={setCurrentInputs}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                formData={formData}
                                placeholder="e.g. Quantum Physics"
                            />

                            <ArrayInput
                                label="Favorite Topics"
                                field="favorite_topics"
                                inputKey="topic"
                                currentInputs={currentInputs}
                                setCurrentInputs={setCurrentInputs}
                                addArrayItem={addArrayItem}
                                removeArrayItem={removeArrayItem}
                                formData={formData}
                                placeholder="e.g. Space Travel"
                            />
                        </div>
                    </div>
                )

            case 5:
                return (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Heart className="w-6 h-6 text-red-400" />
                            <h3 className="text-2xl font-display font-semibold text-red-300">Shared History</h3>
                        </div>

                        <div>
                            <label className="block text-white/90 font-medium mb-2">Privately Shared Memories</label>
                            <textarea
                                value={formData.memories}
                                onChange={(e) => setFormData({ ...formData, memories: e.target.value })}
                                placeholder="Memories only you and this person share..."
                                rows="4"
                                className="textarea-field"
                            />
                        </div>

                        <div>
                            <label className="block text-white/90 font-medium mb-2">Shared Experiences / Core Events</label>
                            <textarea
                                value={formData.shared_experiences}
                                onChange={(e) => setFormData({ ...formData, shared_experiences: e.target.value })}
                                placeholder="Key events that shaped your bond..."
                                rows="4"
                                className="textarea-field"
                            />
                        </div>

                        <ArrayInput
                            label="Inside Joke Starters"
                            field="conversation_starters"
                            inputKey="starter"
                            currentInputs={currentInputs}
                            setCurrentInputs={setCurrentInputs}
                            addArrayItem={addArrayItem}
                            removeArrayItem={removeArrayItem}
                            formData={formData}
                            placeholder="Things they say to kick off a chat..."
                        />
                    </div>
                )

            case 6:
                return (
                    <div className="space-y-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Upload className="w-6 h-6 text-orange-400" />
                            <h3 className="text-2xl font-display font-semibold text-orange-300">Advanced Data & Knowledge</h3>
                        </div>

                        {/* File Upload Section */}
                        <div className="p-8 glass-card border-dashed border-2 border-white/20 text-center">
                            <div
                                className="cursor-pointer group"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-500/20 transition-all">
                                    <Upload className="w-8 h-8 text-white/50 group-hover:text-primary-400 transition-colors" />
                                </div>
                                <h4 className="text-lg font-bold mb-2">Upload Data Files</h4>
                                <p className="text-sm text-white/50 max-w-xs mx-auto">
                                    Upload PDFs, TXT, or DOCX files to give the AI more background context about this person.
                                </p>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                multiple
                                className="hidden"
                            />

                            {formData.uploaded_files?.length > 0 && (
                                <div className="mt-6 text-left space-y-2">
                                    <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Uploaded Files</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {formData.uploaded_files.map((file, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <FileText className="w-4 h-4 text-primary-400 shrink-0" />
                                                    <span className="text-sm truncate">{file.name}</span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeArrayItem('uploaded_files', idx)}
                                                    className="text-white/30 hover:text-red-400"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <ArrayInput
                            label="Social Media / Web Links"
                            field="social_media_links"
                            inputKey="socialLink"
                            currentInputs={currentInputs}
                            setCurrentInputs={setCurrentInputs}
                            addArrayItem={addArrayItem}
                            removeArrayItem={removeArrayItem}
                            formData={formData}
                            placeholder="e.g. https://twitter.com/nolan"
                            icon={Globe}
                        />

                        <div>
                            <label className="block text-white/90 font-medium mb-2">Raw Life Data (JSON or unstructured)</label>
                            <textarea
                                value={formData.life_data}
                                onChange={(e) => setFormData({ ...formData, life_data: e.target.value })}
                                placeholder="Any other unstructured data you want to dump..."
                                rows="4"
                                className="textarea-field font-mono text-sm"
                            />
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <form
            onSubmit={(e) => e.preventDefault()}
            onKeyDown={handleFormKeyDown}
            className="flex flex-col h-full max-h-[85vh]"
        >
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-4 animate-slide-up">
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            )}

            {/* Progress Header */}
            <div className="mb-8 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold uppercase tracking-widest text-primary-400">Step {currentStep} of {totalSteps}</span>
                    <span className="text-sm text-white/50">{
                        currentStep === 1 ? 'Identity & Media' :
                            currentStep === 2 ? 'Communication' :
                                currentStep === 3 ? 'Personality' :
                                    currentStep === 4 ? 'Background' :
                                        currentStep === 5 ? 'Shared History' :
                                            'Files & Advanced'
                    }</span>
                </div>
                <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5, 6].map(step => (
                        <div
                            key={step}
                            className={`flex-1 rounded-full transition-all duration-500 ${step <= currentStep ? 'bg-primary-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]' : 'bg-white/10'
                                }`}
                        />
                    ))}
                </div>
            </div>

            {/* Scrollable Content */}
            <div className={`flex-1 overflow-y-auto custom-scrollbar pr-2 mb-8 ${isSynthesizing ? 'neural-pulse-slow neural-grain' : ''}`}>
                {renderStep()}
            </div>

            {/* Navigation Footer */}
            <div className="flex space-x-4 pt-6 border-t border-white/10 shrink-0">
                {currentStep > 1 && (
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handlePreviousStep}
                        className="flex-1 py-3"
                    >
                        Back
                    </Button>
                )}

                {currentStep < totalSteps ? (
                    <Button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3"
                    >
                        {currentStep === 1 ? 'Start Designing' : 'Continue'}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || uploading}
                        className="flex-1 py-3 glow-effect"
                    >
                        {loading ? 'Creating Life...' : isEditing ? 'Update Persona' : 'Breathe Life Into Persona'}
                    </Button>
                )}

                <Button type="button" variant="secondary" onClick={onCancel} className="px-6 py-3">
                    Cancel
                </Button>
            </div>
        </form>
    )
}
