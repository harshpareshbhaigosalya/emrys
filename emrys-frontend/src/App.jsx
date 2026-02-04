import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './services/supabase'

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Chat from './pages/Chat'
import HubChat from './pages/HubChat'
import PersonaDetail from './pages/PersonaDetail'
import Profile from './pages/Profile'
import NeuralNexus from './pages/NeuralNexus'

// Components
import Loading from './components/common/Loading'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <Loading />
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Landing />} />
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/chat/:personaId"
          element={user ? <Chat user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/hub/:groupId"
          element={user ? <HubChat user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/persona/:personaId"
          element={user ? <PersonaDetail user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/nexus"
          element={user ? <NeuralNexus user={user} /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  )
}

export default App
