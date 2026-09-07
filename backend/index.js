require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const db = require('./db');
const { router: authRouter, requireAuth } = require('./auth');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
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
    notes,
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
      project_name,
      prompt_title,
      prompt_version || '',
      prompt_text,
      response_summary || '',
      category || '',
      usefulness || '',
      reviewed ? 1 : 0,
      improved ? 1 : 0,
      screenshot_url || '',
      notes || ''
    );

    const newRecord = db
      .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
      .get(result.lastInsertRowid, req.user.userId);

    res.status(201).json(newRecord);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
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
    res.status(500).json({ error: 'Internal server error' });
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
    notes,
  } = req.body;

  if (!project_name || !prompt_title || !prompt_text) {
    return res.status(400).json({ error: 'Required fields are missing' });
  }

  const existing = db
    .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
    .get(req.params.id, req.user.userId);

  if (!existing) {
    return res.status(404).json({ error: 'Capsule not found' });
  }

  try {
    const stmt = db.prepare(`
      UPDATE capsules SET
        project_name = ?, prompt_title = ?, prompt_version = ?,
        prompt_text = ?, response_summary = ?, category = ?,
        usefulness = ?, reviewed = ?, improved = ?,
        screenshot_url = ?, notes = ?
      WHERE id = ? AND user_id = ?
    `);

    stmt.run(
      project_name,
      prompt_title,
      prompt_version || '',
      prompt_text,
      response_summary || '',
      category || '',
      usefulness || '',
      reviewed ? 1 : 0,
      improved ? 1 : 0,
      screenshot_url || '',
      notes || '',
      req.params.id,
      req.user.userId
    );

    const updated = db
      .prepare('SELECT * FROM capsules WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.userId);

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
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

    res.status(200).json({
      deleted: true,
      id: Number(req.params.id),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});