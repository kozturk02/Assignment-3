import { useState } from 'react';
import { createCapsule, updateCapsule } from '../api';

const categories = ['Coding', 'Debugging', 'Writing', 'Research', 'Study', 'Planning'];

function CapsuleForm({ capsule, onClose, onSaved }) {
  const editing = !!capsule;
  const isCustom = capsule?.category && !categories.includes(capsule.category);

  function getScreenshots(value) {
    if (!value) return [];

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [value];
    }
  }

  function validUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  const [form, setForm] = useState({
    project_name: capsule?.project_name || '',
    prompt_title: capsule?.prompt_title || '',
    prompt_version: capsule?.prompt_version || '',
    prompt_text: capsule?.prompt_text || '',
    response_summary: capsule?.response_summary || '',
    category: isCustom ? 'Custom' : capsule?.category || 'Coding',
    usefulness: capsule?.usefulness || '',
    reviewed: Number(capsule?.reviewed || 0),
    improved: Number(capsule?.improved || 0),
    notes: capsule?.notes || ''
  });

  const [customCategory, setCustomCategory] = useState(isCustom ? capsule.category : '');
  const [screenshots, setScreenshots] = useState(getScreenshots(capsule?.screenshot_url));
  const [screenshotText, setScreenshotText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addScreenshot() {
    const screenshot = screenshotText.trim();

    if (!screenshot) return;

    if (!validUrl(screenshot)) {
      return setError('Enter a valid screenshot URL.');
    }

    if (!screenshots.includes(screenshot)) {
      setScreenshots([...screenshots, screenshot]);
    }

    setScreenshotText('');
    setError('');
  }

  function deleteScreenshot(index) {
    setScreenshots(screenshots.filter((_, i) => i !== index));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const pendingScreenshot = screenshotText.trim();
    const finalScreenshots = [...screenshots];

    if (pendingScreenshot) {
      if (!validUrl(pendingScreenshot)) {
        return setError('Enter a valid screenshot URL.');
      }

      if (!finalScreenshots.includes(pendingScreenshot)) {
        finalScreenshots.push(pendingScreenshot);
      }
    }

    setSaving(true);

    try {
      const data = {
        ...form,
        category: form.category === 'Custom' ? customCategory.trim() : form.category,
        reviewed: Number(form.reviewed),
        improved: Number(form.improved),
        screenshot_url: finalScreenshots.length ? JSON.stringify(finalScreenshots) : ''
      };

      editing
        ? await updateCapsule(capsule.id, data)
        : await createCapsule(data);

      await onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save prompt.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="form-backdrop" onClick={onClose}>
      <form className="capsule-form" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
        <h2>{editing ? 'Edit capsule' : 'Create capsule'}</h2>
        <p>{editing ? 'Update the saved prompt record.' : 'Save a new prompt record.'}</p>

        <div className="form-row three">
          <label>Project name
            <input name="project_name" value={form.project_name} onChange={handleChange} required />
          </label>

          <label>Prompt title
            <input name="prompt_title" value={form.prompt_title} onChange={handleChange} required />
          </label>

          <label>Prompt version
            <input name="prompt_version" value={form.prompt_version} onChange={handleChange} />
          </label>
        </div>

        <div className="form-row">
          <label>Category
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map(category =>
                <option key={category}>{category}</option>
              )}
              <option>Custom</option>
            </select>
          </label>

          <label>Custom category
            <input
              value={customCategory}
              onChange={e => setCustomCategory(e.target.value)}
              disabled={form.category !== 'Custom'}
              required={form.category === 'Custom'}
            />
          </label>
        </div>

        <label>Prompt text
          <textarea name="prompt_text" value={form.prompt_text} onChange={handleChange} required />
        </label>

        <label>Response summary
          <textarea name="response_summary" value={form.response_summary} onChange={handleChange} />
        </label>

        <div className="form-row three">
          <label>Usefulness Rating
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star =>
                <button
                  type="button"
                  key={star}
                  className={star <= Number(form.usefulness) ? 'selected' : ''}
                  onClick={() => setForm({ ...form, usefulness: String(star) })}
                >
                  ★
                </button>
              )}
            </div>
          </label>

          <label>Response checked?
            <select name="reviewed" value={form.reviewed} onChange={handleChange}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </label>

          <label>Output improved?
            <select name="improved" value={form.improved} onChange={handleChange}>
              <option value="1">Yes</option>
              <option value="0">No</option>
            </select>
          </label>
        </div>

        <label>Additional notes (optional)
          <textarea name="notes" value={form.notes} onChange={handleChange} />
        </label>

        <label>Screenshot evidence (optional)</label>

        <div className="screenshot-add">
          <input
            type="url"
            value={screenshotText}
            onChange={e => setScreenshotText(e.target.value)}
            placeholder="https://example.com/screenshot.png"
          />

          <button type="button" className="add-button" onClick={addScreenshot}>Add</button>
        </div>

        <div className="screenshot-list">
          {screenshots.map((screenshot, index) =>
            <div className="screenshot-item" key={`${screenshot}-${index}`}>
              <a href={screenshot} target="_blank" rel="noreferrer">
                Screenshot {index + 1}
              </a>

              <button type="button" onClick={() => deleteScreenshot(index)}>Delete</button>
            </div>
          )}
        </div>

        <div className="form-actions">
          <span className="form-error" role="alert">{error}</span>

          <div className="form-action-buttons">
            <button type="button" className="secondary-button" onClick={onClose} disabled={saving}>
              Cancel
            </button>

            <button className="main-button" disabled={saving}>
              {saving ? 'Saving...' : editing ? 'Save changes' : 'Create capsule'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default CapsuleForm;