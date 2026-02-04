import { useState } from 'react'
import { X } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import { personaHelpers } from '../../services/supabase'

export default function PersonaForm({ userId, persona = null, onSuccess, onCancel }) {
    const isEditing = !!persona

    const [formData, setFormData] = useState({
        name: persona?.name || '',
        relationship: persona?.relationship || '',
        occupation: persona?.occupation || '',
        age: persona?.age || '',
        location: persona?.location || '',
        calls_user_by: persona?.calls_user_by || '',
        speech_patterns: persona?.speech_patterns || '',
        memories: persona?.memories || '',
        shared_experiences: persona?.shared_experiences || '',
        achievements: persona?.achievements || '',
        personality_traits: persona?.personality_traits || [],
        qualities: persona?.qualities || [],
        interests: persona?.interests || [],
    })

    const [currentTrait, setCurrentTrait] = useState('')
    const [currentQuality, setCurrentQuality] = useState('')
    const [currentInterest, setCurrentInterest] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const addItem = (field, value, setter) => {
        if (value.trim()) {
            setFormData({
                ...formData,
                [field]: [...formData[field], value.trim()]
            })
            setter('')
        }
    }

    const removeItem = (field, index) => {
        setFormData({
            ...formData,
            [field]: formData[field].filter((_, i) => i !== index)
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                    <p className="text-red-200 text-sm">{error}</p>
                </div>
            )}

            {/* Basic Information */}
            <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-primary-300">Basic Information</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <Input
                        label="Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        required
                    />
                    <Input
                        label="Relationship"
                        value={formData.relationship}
                        onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                        placeholder="Father, Friend, Mentor, etc."
                    />
                    <Input
                        label="Occupation"
                        value={formData.occupation}
                        onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                        placeholder="Software Engineer"
                    />
                    <Input
                        label="Age"
                        type="number"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="45"
                    />
                    <Input
                        label="Location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="New York, USA"
                    />
                    <Input
                        label="What they call you"
                        value={formData.calls_user_by}
                        onChange={(e) => setFormData({ ...formData, calls_user_by: e.target.value })}
                        placeholder="Buddy, Son, etc."
                    />
                </div>
            </div>

            {/* Personality Traits */}
            <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-primary-300">Personality Traits</h3>
                <div className="flex space-x-2 mb-3">
                    <input
                        type="text"
                        value={currentTrait}
                        onChange={(e) => setCurrentTrait(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addItem('personality_traits', currentTrait, setCurrentTrait)
                            }
                        }}
                        placeholder="Add a trait (e.g., Kind, Funny, Wise)"
                        className="input-field flex-1"
                    />
                    <Button
                        type="button"
                        onClick={() => addItem('personality_traits', currentTrait, setCurrentTrait)}
                        variant="secondary"
                    >
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.personality_traits.map((trait, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-primary-500/20 border border-primary-500/30 rounded-full text-sm flex items-center space-x-2"
                        >
                            <span>{trait}</span>
                            <button
                                type="button"
                                onClick={() => removeItem('personality_traits', index)}
                                className="hover:text-red-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Qualities */}
            <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-primary-300">Qualities</h3>
                <div className="flex space-x-2 mb-3">
                    <input
                        type="text"
                        value={currentQuality}
                        onChange={(e) => setCurrentQuality(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addItem('qualities', currentQuality, setCurrentQuality)
                            }
                        }}
                        placeholder="Add a quality (e.g., Patient, Generous)"
                        className="input-field flex-1"
                    />
                    <Button
                        type="button"
                        onClick={() => addItem('qualities', currentQuality, setCurrentQuality)}
                        variant="secondary"
                    >
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.qualities.map((quality, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-sm flex items-center space-x-2"
                        >
                            <span>{quality}</span>
                            <button
                                type="button"
                                onClick={() => removeItem('qualities', index)}
                                className="hover:text-red-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Interests */}
            <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-primary-300">Interests & Hobbies</h3>
                <div className="flex space-x-2 mb-3">
                    <input
                        type="text"
                        value={currentInterest}
                        onChange={(e) => setCurrentInterest(e.target.value)}
                        onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                addItem('interests', currentInterest, setCurrentInterest)
                            }
                        }}
                        placeholder="Add an interest (e.g., Reading, Hiking)"
                        className="input-field flex-1"
                    />
                    <Button
                        type="button"
                        onClick={() => addItem('interests', currentInterest, setCurrentInterest)}
                        variant="secondary"
                    >
                        Add
                    </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                        <span
                            key={index}
                            className="px-3 py-1 bg-gold-500/20 border border-gold-500/30 rounded-full text-sm flex items-center space-x-2"
                        >
                            <span>{interest}</span>
                            <button
                                type="button"
                                onClick={() => removeItem('interests', index)}
                                className="hover:text-red-400"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Memories & Experiences */}
            <div>
                <h3 className="text-xl font-display font-semibold mb-4 text-primary-300">Memories & Context</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-white/90 font-medium mb-2">
                            Important Memories
                        </label>
                        <textarea
                            value={formData.memories}
                            onChange={(e) => setFormData({ ...formData, memories: e.target.value })}
                            placeholder="Describe important memories, life events, or stories..."
                            rows="3"
                            className="textarea-field"
                        />
                    </div>
                    <div>
                        <label className="block text-white/90 font-medium mb-2">
                            Shared Experiences
                        </label>
                        <textarea
                            value={formData.shared_experiences}
                            onChange={(e) => setFormData({ ...formData, shared_experiences: e.target.value })}
                            placeholder="Describe experiences you shared together..."
                            rows="3"
                            className="textarea-field"
                        />
                    </div>
                    <div>
                        <label className="block text-white/90 font-medium mb-2">
                            Achievements
                        </label>
                        <textarea
                            value={formData.achievements}
                            onChange={(e) => setFormData({ ...formData, achievements: e.target.value })}
                            placeholder="Notable achievements or accomplishments..."
                            rows="2"
                            className="textarea-field"
                        />
                    </div>
                    <div>
                        <label className="block text-white/90 font-medium mb-2">
                            Speech Patterns
                        </label>
                        <textarea
                            value={formData.speech_patterns}
                            onChange={(e) => setFormData({ ...formData, speech_patterns: e.target.value })}
                            placeholder="How do they speak? Common phrases, tone, style..."
                            rows="2"
                            className="textarea-field"
                        />
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4 pt-4 border-t border-white/10">
                <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Saving...' : isEditing ? 'Update Persona' : 'Create Persona'}
                </Button>
                <Button type="button" variant="secondary" onClick={onCancel} className="flex-1">
                    Cancel
                </Button>
            </div>
        </form>
    )
}
