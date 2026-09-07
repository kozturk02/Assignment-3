function ViewCard({ capsules, onEdit, onDelete }) {
  return (
    <div>
      <h2>My Capsules</h2>

      {capsules.length === 0 && <p>No capsules saved.</p>}

      {capsules.map(capsule => (
        <div key={capsule.id}>
          <h3>{capsule.prompt_title}</h3>
          <p>{capsule.project_name}</p>
          <p>{capsule.prompt_version}</p>
          <p>{capsule.category}</p>

          <button onClick={() => onEdit(capsule)}>Edit</button>
          <button onClick={() => onDelete(capsule.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default ViewCard;