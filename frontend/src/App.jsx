import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
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

  function openDashboard() {
    window.location.href = '/dashboard';
  }

  async function handleSignOut() {
    await logout();
    setLoggedIn(false);
    window.location.href = '/';
  }

  if (loggedIn === null) return null;

  return (
    <Routes>
      <Route path="/" element={
        <HomePage
          loggedIn={loggedIn}
          loginWithGitHub={loginWithGitHub}
          openDashboard={openDashboard}
          handleSignOut={handleSignOut}
        />
      } />
      <Route path="/dashboard" element={
        loggedIn
          ? <DashboardPage handleSignOut={handleSignOut} />
          : <Navigate to="/" replace />
      } />
    </Routes>
  );
}

export default App;