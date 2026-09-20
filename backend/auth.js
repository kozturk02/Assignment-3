const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { FRONTEND_URL, GITHUB_CALLBACK, CROSS_SITE, production } = require('./config');

const router = express.Router();

function cookieOptions() {
  return {
    httpOnly: true,
    secure: production || CROSS_SITE,
    sameSite: CROSS_SITE ? 'none' : 'lax',
    path: '/'
  };
}

function validState(state, expectedState) {
  if (!state || !expectedState) return false;

  const a = Buffer.from(state);
  const b = Buffer.from(expectedState);

  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function requireAuth(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);

    if (!user?.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

router.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

router.get('/login', (req, res) => {
  const state = crypto.randomBytes(32).toString('hex');

  res.cookie('oauth_state', state, {
    ...cookieOptions(),
    maxAge: 10 * 60 * 1000
  });

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    redirect_uri: GITHUB_CALLBACK,
    scope: 'read:user user:email',
    state,
    prompt: 'select_account'
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
});

router.get('/auth/github/callback', async (req, res) => {
  const { code, state } = req.query;
  const expectedState = req.cookies.oauth_state;

  res.clearCookie('oauth_state', cookieOptions());

  if (!code || !validState(state, expectedState)) {
    return res.redirect(`${FRONTEND_URL}/?auth=failed`);
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: GITHUB_CALLBACK
      })
    });

    if (!tokenResponse.ok) {
      throw new Error(`GitHub token request failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    if (!tokenData?.access_token) {
      throw new Error('GitHub did not return an access token');
    }

    const githubHeaders = {
      Authorization: `Bearer ${tokenData.access_token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'AI-Capsule',
      'X-GitHub-Api-Version': '2022-11-28'
    };

    const userResponse = await fetch('https://api.github.com/user', {
      headers: githubHeaders
    });

    if (!userResponse.ok) {
      throw new Error(`GitHub user request failed: ${userResponse.status}`);
    }

    const githubUser = await userResponse.json();

    if (!githubUser?.id || !githubUser?.login) {
      throw new Error('GitHub user data is invalid');
    }

    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: githubHeaders
    });

    if (!emailResponse.ok) {
      throw new Error(`GitHub email request failed: ${emailResponse.status}`);
    }

    const emails = await emailResponse.json();

    if (!Array.isArray(emails)) {
      throw new Error('GitHub email data is invalid');
    }

    const primaryEmail =
      emails.find(email => email.primary && email.verified)?.email ||
      emails.find(email => email.verified)?.email ||
      githubUser.email ||
      '';

    const token = jwt.sign({
      userId: String(githubUser.id),
      username: githubUser.login,
      name: githubUser.name || githubUser.login,
      email: primaryEmail,
      avatarUrl: githubUser.avatar_url || null
    }, process.env.JWT_SECRET, { expiresIn: '2h' });

    res.cookie('token', token, {
      ...cookieOptions(),
      maxAge: 2 * 60 * 60 * 1000
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  } catch (err) {
    console.error('OAuth error:', err.message);
    res.redirect(`${FRONTEND_URL}/?auth=failed`);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', cookieOptions());
  res.json({ loggedOut: true });
});

module.exports = { router, requireAuth };