import { Link } from 'react-router-dom';

function LoginPage({ loggedIn, handleSignOut, loginWithGitHub, openDashboard }) {
  let loginStatus = (loggedIn ? "Sign out" : "Sign in");
  let loginTitle = (loggedIn ? "Already logged in" : "Sign in to AI Capsule");
  let loginText = (loggedIn ? "You're already signed in to your AI Capsule account." : "Use GitHub to access your private prompt library.");
  let loginButton = (loggedIn ? "Continue to Dashboard" : "Continue with GitHub");

  function refreshPage() {
    window.location.reload();
  }

  return (
    <main>
      <section className="header">
        <Link to="/" className="header-title">AI Capsule</Link>
        <span className="login-title">
          <button className="header-button" onClick={loggedIn ? handleSignOut : refreshPage}>
            {loginStatus}
          </button>
        </span>
      </section>

      <section className="login">
        <div className="login-card">
          <p className="login-welcome">{loggedIn ? "Welcome back" : "Welcome"}</p>
          <h1>{loginTitle}</h1>
          <p className="login-text">{loginText}</p>

          <button className="main-button login-button" onClick={loggedIn ? openDashboard : loginWithGitHub}>
            {loginButton}
          </button>

          {!loggedIn && (
            <p className="login-security">
              Your session is stored securely with a protected cookie.
            </p>
          )}
        </div>
      </section>
    </main>
  );
}

export default LoginPage;