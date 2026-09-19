import HeaderPanel from '../components/HeaderPanel';

function HomePage({ loggedIn, user, loginWithGitHub, openDashboard, handleSignOut }) {
  let loginButton = (loggedIn ? "Continue to Dashboard" : "Continue to Sign In");

  return (
    <main>
      <section className="header">
        <HeaderPanel
          loggedIn={loggedIn}
          user={user}
          loginWithGitHub={loginWithGitHub}
          handleSignOut={handleSignOut}
        />
      </section>

      <section className="home">
        <h1>Your AI prompts, in one place.</h1>
        <p>Save, review and improve the prompts you want to keep.</p>

        <button className="main-button" onClick={loggedIn ? openDashboard : loginWithGitHub}>
          {loginButton}
        </button>
      </section>

      <section className="features">
        <div className="feature">
          <h2>Save prompts</h2>
          <p>Keep your best ideas organised and easy to find.</p>
        </div>
        <div className="feature">
          <h2>Track versions</h2>
          <p>See how your prompts evolve over time.</p>
        </div>
        <div className="feature">
          <h2>Review what works</h2>
          <p>Learn from past results and make them better.</p>
        </div>
      </section>
    </main>
  );
}

export default HomePage;