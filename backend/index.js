require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const db = require('./db');
const { router: authRouter, requireAuth } = require('./auth');
const { FRONTEND_URL, BACKEND_PORT, production } = require('./config');

const requiredEnv = ['JWT_SECRET', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'];
const missingEnv = requiredEnv.filter(name => !process.env[name]);

if (missingEnv.length) {
  console.error(`Missing environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = BACKEND_PORT;

if (production) {
  app.set('trust proxy', 1);
}

app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use(authRouter);

// HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// CREATE
app.post('/api/capsules', requireAuth, (req, res) => {
  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO capsules (
        user_id, project_name, prompt_title, prompt_version,
        prompt_text, response_summary, category, usefulness,
        reviewed, improved, screenshot_url, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      req.user.userId,
      project_name.trim(),
      prompt_title.trim(),
      prompt_version?.trim() || '',
      prompt_text.trim(),
      response_summary?.trim() || '',
      category?.trim() || '',
      usefulness || '',
      Number(reviewed) ? 1 : 0,
      Number(improved) ? 1 : 0,
      screenshot_url || '',
      notes?.trim() || ''
    );

    const newRecord = db
      .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
      .get(result.lastInsertRowid, req.user.userId);

    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not create prompt record' });
  }
});

// READ
app.get('/api/capsules', requireAuth, (req, res) => {
  try {
    const records = db
      .prepare('SELECT * FROM capsules WHERE user_id = ? ORDER BY id DESC')
      .all(req.user.userId);

    res.json(records);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not load prompt records' });
  }
});

// UPDATE
app.put('/api/capsules/:id', requireAuth, (req, res) => {
  const {
    project_name,
    prompt_title,
    prompt_version,
    prompt_text,
    response_summary,
    category,
    usefulness,
    reviewed,
    improved,
    screenshot_url,
    notes
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  try {
    const existing = db
      .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.userId);

    if (!existing) {
      return res.status(404).json({ error: 'Capsule not found' });
    }

    const stmt = db.prepare(`
      UPDATE capsules SET
        project_name = ?, prompt_title = ?, prompt_version = ?,
        prompt_text = ?, response_summary = ?, category = ?,
        usefulness = ?, reviewed = ?, improved = ?,
        screenshot_url = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      project_name.trim(),
      prompt_title.trim(),
      prompt_version?.trim() || '',
      prompt_text.trim(),
      response_summary?.trim() || '',
      category?.trim() || '',
      usefulness || '',
      Number(reviewed) ? 1 : 0,
      Number(improved) ? 1 : 0,
      screenshot_url || '',
      notes?.trim() || '',
      req.params.id,
      req.user.userId
    );

    const updated = db
      .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.userId);

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not update prompt record' });
  }
});

// DELETE
app.delete('/api/capsules/:id', requireAuth, (req, res) => {
  try {
    const result = db
      .prepare('DELETE FROM capsules WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.userId);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Capsule not found' });
    }

    res.json({
      deleted: true,
      id: Number(req.params.id)
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not delete prompt record' });
  }
});

// REACT PRODUCTION BUILD
if (production) {
  const frontendDist = path.resolve(
    __dirname,
    process.env.FRONTEND_DIST || '../frontend/dist'
  );

  if (fs.existsSync(frontendDist)) {
    app.use(express.static(frontendDist));

    app.get('/{*splat}', (req, res) => {
      if (
        req.path.startsWith('/api/') ||
        req.path.startsWith('/auth/') ||
        req.path === '/login' ||
        req.path === '/logout'
      ) {
        return res.status(404).json({ error: 'Not found' });
      }

      res.sendFile(path.join(frontendDist, 'index.html'));
    });
  } else {
    console.warn(`Frontend build not found: ${frontendDist}`);
  }
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});