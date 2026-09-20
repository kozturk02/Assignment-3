const production = process.env.NODE_ENV === 'production';

const FRONTEND_HOST = process.env.FRONTEND_HOST || 'localhost';
const BACKEND_HOST = process.env.BACKEND_HOST || 'localhost';

const FRONTEND_PORT = process.env.FRONTEND_PORT || '5173';
const BACKEND_PORT = process.env.PORT || process.env.BACKEND_PORT || '3001';

const PROTOCOL = production ? 'https' : 'http';

function makeUrl(host, port) {
  return `${PROTOCOL}://${host}${port && !production ? `:${port}` : ''}`;
}

const FRONTEND_URL = makeUrl(FRONTEND_HOST, FRONTEND_PORT);
const BACKEND_URL = makeUrl(BACKEND_HOST, BACKEND_PORT);
const GITHUB_CALLBACK = `${BACKEND_URL}/auth/github/callback`;

const CROSS_SITE = FRONTEND_HOST !== BACKEND_HOST;

module.exports = {
  FRONTEND_URL,
  BACKEND_URL,
  GITHUB_CALLBACK,
  BACKEND_PORT,
  CROSS_SITE,
  production
};