import { useEffect, useState } from 'react';
import CapsuleForm from '../components/CapsuleForm';
import ViewCard from '../components/ViewCard';
import { getCapsules, createCapsule, updateCapsule, deleteCapsule } from '../api';

function DashboardPage() {
  const [capsules, setCapsules] = useState([]);
  const [editing, setEditing] = useState(null);

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

  async function handleSave(data) {
    try {
      if (editing) {
        await updateCapsule(editing.id, data);
        setEditing(null);
      } else {
        await createCapsule(data);
      }

      loadCapsules();
    } catch (err) {
      console.error(err);
    }
  }

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
      <CapsuleForm
        capsule={editing}
        onSave={handleSave}
        onCancel={() => setEditing(null)}
      />

      <ViewCard
        capsules={capsules}
        onEdit={setEditing}
        onDelete={handleDelete}
      />
    </main>
  );
}

export default DashboardPage;