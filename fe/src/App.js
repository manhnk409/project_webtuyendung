import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import DashboardLayout from './employer/DashboardLayout';
import CandidateDashboard from './candidate/CandidateDashboard';
import AdminDashboard from './admin/AdminDashboard';

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

  const handleLogin = (authObj) => {
    setAuth(authObj);
    if (authObj && authObj.user && authObj.user.role === 'employer') setRoute('employer');
    else if (authObj && authObj.user && authObj.user.role === 'candidate') setRoute('candidate');
    else if (authObj && authObj.user && authObj.user.role === 'admin') setRoute('admin');
    else setRoute('login');
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
        {route === 'login' && <Login onLogin={handleLogin} />}
        {route === 'register' && <Register />}
        {route === 'employer' && <DashboardLayout onBack={() => setRoute('login')} />}
        {route === 'candidate' && <CandidateDashboard />}
        {route === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
}

export default App;
