import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './employer/DashboardLayout';
import CandidateDashboard from './candidate/CandidateDashboard';
import AdminDashboard from './admin/AdminDashboard';
import { checkProfileCompleteness } from './services/api';

function Home() {
  return (
    <div style={{ padding: '1rem' }}>
      <h1>Welcome</h1>
      <p>Simple frontend for testing auth endpoints.</p>
    </div>
  );
}

function App() {
  const [route, setRoute] = useState('login');
  const [auth, setAuth] = useState(null);
  const [forceProfileEdit, setForceProfileEdit] = useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('auth');
      if (raw) {
        const parsed = JSON.parse(raw);
        setAuth(parsed);
        if (parsed && parsed.user && parsed.user.role === 'employer') setRoute('employer');
        else if (parsed && parsed.user && parsed.user.role === 'candidate') setRoute('candidate');
        else if (parsed && parsed.user && parsed.user.role === 'admin') setRoute('admin');
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogin = async (authObj) => {
    setAuth(authObj);
    
    // Check profile completeness for employer and candidate
    if (authObj && authObj.user) {
      const role = authObj.user.role;
      
      if (role === 'employer' || role === 'candidate') {
        const check = await checkProfileCompleteness(role);
        
        if (!check.complete) {
          // Show alert and force redirect to profile
          alert(check.message || 'Please complete your profile before proceeding.');
          setForceProfileEdit(true);
        } else {
          setForceProfileEdit(false);
        }
      }
      
      if (role === 'employer') setRoute('employer');
      else if (role === 'candidate') setRoute('candidate');
      else if (role === 'admin') setRoute('admin');
      else setRoute('login');
    } else {
      setRoute('login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setAuth(null);
    setRoute('login');
  };

  return (
    <div className="App">
      <Header onNavigate={setRoute} auth={auth} onLogout={handleLogout} />
      <main>
        {route === 'login' && <Login onLogin={handleLogin} onNavigate={setRoute} />}
        {route === 'register' && <Register onNavigate={setRoute} />}
        {route === 'employer' && <DashboardLayout onBack={() => setRoute('login')} forceProfileEdit={forceProfileEdit} />}
        {route === 'candidate' && <CandidateDashboard forceProfileEdit={forceProfileEdit} />}
        {route === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
