export default function StatusPanel({ health, user, capsules, error }) {
  return (
    <section className="panel">
      <h2>System Status</h2>

      {error && <p className="message error">{error}</p>}

      <div className="status-grid">
        <div>
          <span className="label">Backend</span>
          <strong>{health?.status === 'ok' ? 'Running' : 'Checking...'}</strong>
        </div>

        <div>
          <span className="label">Session</span>
          <strong>{user ? 'Signed in' : 'Not signed in'}</strong>
        </div>

        <div>
          <span className="label">Capsules</span>
          <strong>{capsules.length}</strong>
        </div>
      </div>
    </section>
  );
}