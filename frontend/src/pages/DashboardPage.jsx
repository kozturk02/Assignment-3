import HeaderPanel from '../components/HeaderPanel';
import HistoryPanel from '../components/HistoryPanel';
import { useEffect, useState } from 'react';
import { getCapsules, deleteCapsule } from '../api';

function DashboardPage({ loggedIn, user, loginWithGitHub, handleSignOut }) {
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
        <HeaderPanel
          loggedIn={loggedIn}
          user={user}
          loginWithGitHub={loginWithGitHub}
          handleSignOut={handleSignOut}
        />
      </section>

      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <h1>Your prompts</h1>
          </div>

          <button className="main-button">+ Prompt</button>
        </div>
        <HistoryPanel
          capsules={capsules}
          handleDelete={handleDelete}
        />
      </section>
    </main>
  );
}

export default DashboardPage;