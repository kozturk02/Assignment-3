import { Link } from 'react-router-dom';

export default function HeaderPanel({ loggedIn, user, loginWithGitHub, handleSignOut }) {

  let loginStatus = (loggedIn ? "Sign out" : "Sign in");

  return (
    <div>
      <Link to="/" className="header-title">AI Capsule</Link>
      <span className="login-title">
        <button className="header-button" onClick={loggedIn ? handleSignOut : loginWithGitHub}>
          {loginStatus}
        </button>
        {user?.avatarUrl && <img className="github-avatar" src={user.avatarUrl} alt="avatar" />}
      </span>
    </div>
  );
}