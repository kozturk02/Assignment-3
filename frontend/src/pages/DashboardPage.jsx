import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCapsules, deleteCapsule } from '../api';

function DashboardPage({ handleSignOut, user }) {
  const [capsules, setCapsules] = useState([]);

  async function loadCapsules() {
    try {
      setCapsules(await getCapsules());
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    loadCapsules();
  }, []);

  async function handleDelete(id) {
    try {
      await deleteCapsule(id);
      loadCapsules();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <main>
      <section className="header">
        <Link to="/" className="header-title">AI Capsule</Link>

        <span className="login-title">
          <button className="header-button" onClick={handleSignOut}>Sign out</button>
          {user?.avatarUrl && <img className="github-avatar" src={user.avatarUrl} alt="GitHub profile" />}
        </span>
      </section>

      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <h1>Your prompts</h1>
            <p>Keep useful prompts and improve them over time.</p>
          </div>

          <button className="main-button">New prompt</button>
        </div>

        <div className="capsules">
          {capsules.length === 0 ? (
            <div className="empty-capsules">
              <h2>No prompts yet</h2>
              <p>Your saved prompts will appear here.</p>
            </div>
          ) : (
            capsules.map(capsule => (
              <div className="capsule" key={capsule.id}>
                <div className="capsule-heading">
                  <div>
                    <h2>{capsule.prompt_title}</h2>
                    <p>{capsule.project_name} · {capsule.prompt_version || 'v1'} · {capsule.category || 'General'}</p>
                  </div>
                </div>

                <div className="capsule-content">
                  <div className="capsule-section">
                    <span className="capsule-label">Prompt</span>
                    <p>{capsule.prompt_text}</p>
                  </div>

                  <div className="capsule-section">
                    <span className="capsule-label">Response summary</span>
                    <p>{capsule.response_summary || 'No response summary added.'}</p>
                  </div>
                </div>

                <div className="capsule-status">
                  {capsule.usefulness && <span>{capsule.usefulness}</span>}
                  {capsule.reviewed === 1 && <span>Reviewed</span>}
                  {capsule.improved === 1 && <span>Improved</span>}
                </div>

                <div className="capsule-footer">
                  <span>{capsule.created_at}</span>

                  <div className="capsule-actions">
                    <button>Edit</button>
                    <button onClick={() => handleDelete(capsule.id)}>Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}

export default DashboardPage;