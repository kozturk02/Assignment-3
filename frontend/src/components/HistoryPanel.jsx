function HistoryPanel({ capsules, handleDelete }) {
  return (
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
  );
}

export default HistoryPanel;