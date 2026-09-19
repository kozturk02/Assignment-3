import HeaderPanel from '../components/HeaderPanel';
import HistoryPanel from '../components/HistoryPanel';
import CapsuleForm from '../components/CapsuleForm';
import { useEffect, useState } from 'react';
import { getCapsules, deleteCapsule } from '../api';

function DashboardPage({ loggedIn, user, loginWithGitHub, handleSignOut }) {

  const [capsules, setCapsules] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCapsule, setEditingCapsule] = useState(null);

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

  function openCreate() {
    setEditingCapsule(null);
    setFormOpen(true);
  }

  function openEdit(capsule) {
    setEditingCapsule(capsule);
    setFormOpen(true);
  }

  function closeForm() {
    setEditingCapsule(null);
    setFormOpen(false);
  }

  return (
    <main>
      <HeaderPanel
        loggedIn={loggedIn}
        user={user}
        loginWithGitHub={loginWithGitHub}
        handleSignOut={handleSignOut}
      />

      <section className="dashboard">
        <div className="dashboard-heading">
          <div>
            <h1>Your prompts</h1>
            <p>Keep useful prompts and improve them over time.</p>
          </div>

          <button className="main-button" onClick={openCreate}>New prompt</button>
        </div>

        <HistoryPanel
          capsules={capsules}
          handleDelete={handleDelete}
          handleEdit={openEdit}
        />
      </section>

      {formOpen &&
        <CapsuleForm
          capsule={editingCapsule}
          onClose={closeForm}
          onSaved={loadCapsules}
        />
      }
    </main>
  );
}

export default DashboardPage;