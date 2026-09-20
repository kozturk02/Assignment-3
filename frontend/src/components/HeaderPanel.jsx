import { Link } from 'react-router-dom';

export default function HeaderPanel({ loggedIn, user, handleSignOut }) {
  return (
    <section className="header">
      <Link to="/" className="header-title">AI Capsule</Link>

      {loggedIn && user &&
        <div className="profile-menu">
          <button className="profile-button">
            {user.avatarUrl &&
              <img className="github-avatar" src={user.avatarUrl} alt="Profile" />
            }
          </button>

          <div className="profile-dropdown">
            <div className="profile-info">
              {user.avatarUrl &&
                <img className="profile-dropdown-avatar" src={user.avatarUrl} alt="Profile" />
              }

              <div>
                <strong>{user.name || user.username}</strong>
                <span>{user.email || `@${user.username}`}</span>
              </div>
            </div>

            <button className="profile-logout" onClick={handleSignOut}>
              Log out
            </button>
          </div>
        </div>
      }
    </section>
  );
}