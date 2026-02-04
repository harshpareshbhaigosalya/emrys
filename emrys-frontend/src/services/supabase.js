import { createClient } from '@supabase/supabase-js'

// These will be replaced with your actual Supabase credentials
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Debug: Log what we're using (remove in production)
console.log('🔍 Supabase URL:', supabaseUrl)
console.log('🔍 Supabase Key (first 20 chars):', supabaseAnonKey?.substring(0, 20) + '...')
console.log('🔍 Using env vars:', {
    hasUrl: !!import.meta.env.VITE_SUPABASE_URL,
    hasKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
})

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing Supabase credentials! Check your .env file')
    console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Auth helpers
export const authHelpers = {
    signUp: async (email, password, fullName, referralSource) => {
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    referral_source: referralSource,
                }
            }
        })

        if (authError) throw authError

        // The database trigger will automatically create the user profile
        // No need to manually insert into users table

        return authData
    },

    signIn: async (email, password) => {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) throw error
        return data
    },

    signOut: async () => {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    getCurrentUser: async () => {
        const { data: { user } } = await supabase.auth.getUser()
        return user
    },

    getUserProfile: async (userId) => {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single()

        if (error) throw error
        return data
    },
}

// Persona helpers
export const personaHelpers = {
    create: async (personaData) => {
        const { data, error } = await supabase
            .from('personas')
            .insert([personaData])
            .select()
            .single()

        if (error) throw error
        return data
    },

    getAll: async (userId) => {
        const { data, error } = await supabase
            .from('personas')
            .select('*')
            .eq('user_id', userId)
            // Removed .eq('is_public', false) to show both private and public ones to the owner
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    getPublic: async () => {
        const { data, error } = await supabase
            .from('personas')
            .select('*')
            .eq('is_public', true)
            .order('use_count', { ascending: false })

        if (error) throw error
        return data
    },

    getById: async (personaId) => {
        const { data, error } = await supabase
            .from('personas')
            .select('*')
            .eq('id', personaId)
            .single()

        if (error) throw error
        return data
    },

    update: async (personaId, updates) => {
        const { data, error } = await supabase
            .from('personas')
            .update(updates)
            .eq('id', personaId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    delete: async (personaId) => {
        const { error } = await supabase
            .from('personas')
            .delete()
            .eq('id', personaId)

        if (error) throw error
    },

    incrementUseCount: async (personaId) => {
        const { data, error } = await supabase.rpc('increment_persona_use', { persona_id: personaId })
        if (error) {
            // Fallback if RPC doesn't exist
            const { data: p } = await supabase.from('personas').select('use_count').eq('id', personaId).single()
            await supabase.from('personas').update({ use_count: (p?.use_count || 0) + 1 }).eq('id', personaId)
        }
    },

    getPosts: async (userId) => {
        const { data, error } = await supabase
            .from('persona_posts')
            .select(`
                *,
                personas (name, avatar_url, occupation)
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20)

        if (error) throw error
        return data
    }
}

// Group helpers
export const groupHelpers = {
    create: async (groupData, personaIds) => {
        // 1. Create the group
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .insert([groupData])
            .select()
            .single()

        if (groupError) throw groupError

        // 2. Add members
        const members = personaIds.map(personaId => ({
            group_id: group.id,
            persona_id: personaId
        }))

        const { error: memberError } = await supabase
            .from('group_members')
            .insert(members)

        if (memberError) throw memberError

        return group
    },

    getAll: async (userId) => {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                group_members (
                    persona_id,
                    personas (*)
                )
            `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })

        if (error) throw error
        return data
    },

    getById: async (groupId) => {
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                group_members (
                    persona_id,
                    personas (*)
                )
            `)
            .eq('id', groupId)
            .single()

        if (error) throw error
        return data
    },

    update: async (groupId, updates) => {
        const { data, error } = await supabase
            .from('groups')
            .update(updates)
            .eq('id', groupId)
            .select()
            .single()

        if (error) throw error
        return data
    },

    delete: async (groupId) => {
        const { error } = await supabase
            .from('groups')
            .delete()
            .eq('id', groupId)

        if (error) throw error
    },

    addMembers: async (groupId, personaIds) => {
        const members = personaIds.map(personaId => ({
            group_id: groupId,
            persona_id: personaId
        }))

        const { error } = await supabase
            .from('group_members')
            .insert(members)

        if (error) throw error
    },

    removeMember: async (groupId, personaId) => {
        const { error } = await supabase
            .from('group_members')
            .delete()
            .eq('group_id', groupId)
            .eq('persona_id', personaId)

        if (error) throw error
    }
}

// Chat helpers
export const chatHelpers = {
    getOrCreateConversation: async (userId, personaId) => {
        // Check if conversation exists
        let { data: existing, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .eq('persona_id', personaId)
            .single()

        if (existing) return existing

        // Create new conversation
        const { data, error } = await supabase
            .from('conversations')
            .insert([{ user_id: userId, persona_id: personaId }])
            .select()
            .single()

        if (error) throw error
        return data
    },

    getMessages: async (conversationId) => {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true })

        if (error) throw error
        return data
    },

    addMessage: async (conversationId, senderType, content) => {
        const { data, error } = await supabase
            .from('messages')
            .insert([
                {
                    conversation_id: conversationId,
                    sender_type: senderType,
                    content,
                },
            ])
            .select()
            .single()

        if (error) throw error
        return data
    },

    getOrCreateGroupConversation: async (userId, groupId) => {
        // Check if exists
        const { data: convs, error: fetchError } = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .eq('group_id', groupId)
            .limit(1)

        const existing = convs && convs.length > 0 ? convs[0] : null
        if (existing) return { id: existing.id, data: existing }

        // Create new
        const { data, error } = await supabase
            .from('conversations')
            .insert([{ user_id: userId, group_id: groupId }])
            .select()
            .single()

        if (error) throw error
        return { id: data.id, data: data }
    },

    clearHistory: async (conversationId) => {
        const { error } = await supabase
            .from('messages')
            .delete()
            .eq('conversation_id', conversationId)

        if (error) throw error
        return true
    },
}

// Knowledge helpers
export const knowledgeHelpers = {
    add: async (personaId, category, key, value, source = 'conversation') => {
        const { data, error } = await supabase
            .from('persona_knowledge')
            .insert([
                {
                    persona_id: personaId,
                    category,
                    key,
                    value,
                    source,
                },
            ])
            .select()
            .single()

        if (error) throw error
        return data
    },

    getAll: async (personaId) => {
        const { data, error } = await supabase
            .from('persona_knowledge')
            .select('*')
            .eq('persona_id', personaId)
            .order('learned_at', { ascending: false })

        if (error) throw error
        return data
    },
}

// Storage helpers
export const storageHelpers = {
    uploadPersonaAvatar: async (personaId, file) => {
        const fileExt = file.name.split('.').pop()
        const fileName = `${personaId}/avatar.${fileExt}`
        const filePath = `avatars/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('personas')
            .upload(filePath, file, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('personas')
            .getPublicUrl(filePath)

        return publicUrl
    },

    uploadPersonaFile: async (personaId, file) => {
        const fileName = `${personaId}/${Date.now()}_${file.name}`
        const filePath = `files/${fileName}`

        const { error: uploadError } = await supabase.storage
            .from('personas')
            .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
            .from('personas')
            .getPublicUrl(filePath)

        return { name: file.name, url: publicUrl, uploaded_at: new Date().toISOString() }
    }
}
