import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import HITLQueue from './components/HITLQueue';
import StreamControl from './components/StreamControl';
import Analytics from './components/Analytics';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import ProductionControl from './components/ProductionControl';
import SmartDirector from './components/SmartDirector';
import TranscriptionPanel from './components/TranscriptionPanel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      // Verify token is valid
      const userData = parseJWT(token);
      setUser(userData);
    }
  }, [token]);

  const parseJWT = (token) => {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch {
      return null;
    }
  };

  const handleLogin = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('token', authToken);
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-black">
        {user && <Navigation onLogout={handleLogout} user={user} />}

        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" />}
          />

          <Route
            path="/"
            element={user ? <Dashboard user={user} token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/hitl"
            element={user ? <HITLQueue token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/stream"
            element={user ? <StreamControl token={token} user={user} /> : <Navigate to="/login" />}
          />

          <Route
            path="/analytics"
            element={user ? <Analytics token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/admin"
            element={user?.role === 'admin' ? <AdminPanel token={token} /> : <Navigate to="/" />}
          />

          <Route
            path="/production"
            element={user ? <ProductionControl token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/smart-director"
            element={user ? <SmartDirector token={token} /> : <Navigate to="/login" />}
          />

          <Route
            path="/transcription"
            element={user ? <TranscriptionPanel token={token} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  );
}

const Navigation = ({ onLogout, user }) => (
  <nav className="bg-black/30 backdrop-blur-xl border-b border-white/10">
    <div className="max-w-7xl mx-auto px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-white">SwanyThree Ultimate</h1>
          <div className="flex gap-4">
            <NavLink to="/">Dashboard</NavLink>
            <NavLink to="/production">Production</NavLink>
            <NavLink to="/smart-director">AI Director</NavLink>
            <NavLink to="/transcription">Transcription</NavLink>
            <NavLink to="/hitl">HITL</NavLink>
            <NavLink to="/analytics">Analytics</NavLink>
            {user?.role === 'admin' && <NavLink to="/admin">Admin</NavLink>}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-white/60">Welcome, {user?.username}</span>
          <button
            onClick={onLogout}
            className="bg-red-500/20 text-red-300 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-all"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  </nav>
);

const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="text-white/70 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
  >
    {children}
  </Link>
);

export default App;
