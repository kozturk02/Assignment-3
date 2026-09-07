import { loginWithGitHub } from '../api';

function LoginCard() {
  return (
    <div>
      <h2>AI Capsule</h2>
      <p>Login to manage your saved prompts.</p>
      <button onClick={loginWithGitHub}>Login with GitHub</button>
    </div>
  );
}

export default LoginCard;