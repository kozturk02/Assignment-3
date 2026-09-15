import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import { checkLogin, loginWithGitHub, logout } from './api';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(null);

  useEffect(() => {
    checkLogin()
      .then(() => setLoggedIn(true))
      .catch(() => setLoggedIn(false));
  }, []);

  function openLoginPage() {
    window.location.href = '/login';
  }

  function openDashboard() {
    window.location.href = '/dashboard';
  }

  async function handleSignOut() {
    await logout();
    setLoggedIn(false);
  }

  if (loggedIn === null) return null;

  return (
    <Routes>
      <Route path="/" element={<HomePage loggedIn={loggedIn} openLoginPage={openLoginPage} openDashboard={openDashboard} handleSignOut={handleSignOut} />} />
      <Route path="/login" element={loggedIn ? <Navigate to="/dashboard" /> : <LoginPage loggedIn={loggedIn} loginWithGitHub={loginWithGitHub} handleSignOut={handleSignOut} openDashboard={openDashboard} />} />
      <Route path="/dashboard" element={loggedIn ? <DashboardPage handleSignOut={handleSignOut} /> : <Navigate to="/login" />} />
    </Routes>
  );
}

export default App;