function HistoryPanel({ capsules, handleDelete, handleEdit }) {

  function formatDate(date) {
    return date ? new Date(date).toLocaleDateString('en-AU', {
      day: 'numeric', month: 'long', year: 'numeric'
    }) : '';
  }

  function Rating({ value }) {
    return (
      <span className="history-stars">
        {[1, 2, 3, 4, 5].map(star =>
          <span key={star} className={star <= Number(value) ? 'selected' : ''}>★</span>
        )}
      </span>
    );
  }

  return (
    <div className="capsules">
      {capsules.length === 0 ? (
        <div className="empty-capsules">
          <h2>No prompts yet</h2>
          <p>Your saved prompts will appear here.</p>
        </div>
      ) : capsules.map(capsule => (
        <div className="capsule" key={capsule.id}>

          <div className="capsule-main">
            <div className="capsule-left">
              <div className="capsule-heading">
                <h2>{capsule.prompt_title}</h2>
                <p>{capsule.project_name} · {capsule.prompt_version || 'No version'} · {capsule.category || 'General'}</p>
              </div>

              <div className="capsule-section">
                <span className="capsule-label">Prompt</span>
                <p>{capsule.prompt_text}</p>
              </div>

              <div className="capsule-section">
                <span className="capsule-label">Response summary</span>
                <p>{capsule.response_summary || 'No response summary added.'}</p>
              </div>
            </div>

            <div className="capsule-right">
              <div className="capsule-facts">
                <div>
                  <span className="capsule-label">Rating</span>
                  <p><Rating value={capsule.usefulness} /></p>
                </div>

                <div>
                  <span className="capsule-label">Response checked</span>
                  <p>{Number(capsule.reviewed) ? 'Yes' : 'No'}</p>
                </div>

                <div>
                  <span className="capsule-label">Output improved</span>
                  <p>{Number(capsule.improved) ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="capsule-section">
                <span className="capsule-label">Additional notes</span>
                <p>{capsule.notes || 'No additional notes.'}</p>
              </div>

              <div className="capsule-section">
                <span className="capsule-label">Screenshots</span>
                <p>
                  {capsule.screenshot_url
                    ? <a href={capsule.screenshot_url} target="_blank" rel="noreferrer">View screenshot</a>
                    : 'No additional screenshots provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="capsule-footer">
            <span>{formatDate(capsule.created_at)}</span>

            <div className="capsule-actions">
              <button onClick={() => handleEdit(capsule)}>Edit</button>
              <button className="delete-button" onClick={() => handleDelete(capsule.id)}>Delete</button>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}

export default HistoryPanel;