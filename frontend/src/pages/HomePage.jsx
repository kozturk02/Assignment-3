import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <main>
      <h1>AI Capsule</h1>
      <p>Save and manage useful AI prompts.</p>
      <Link to="/login">Login</Link>
    </main>
  );
}

export default HomePage;