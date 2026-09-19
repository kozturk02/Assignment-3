import { useState } from 'react';
import { createCapsule, updateCapsule } from '../api';

const categories = ['Coding', 'Debugging', 'Writing', 'Research', 'Study', 'Planning'];

function CapsuleForm({ capsule, onClose, onSaved }) {
  const editing = !!capsule;
  const isCustom = capsule?.category && !categories.includes(capsule.category);

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
    notes: capsule?.notes || '',
    screenshot_url: capsule?.screenshot_url || ''
  });

  const [customCategory, setCustomCategory] = useState(isCustom ? capsule.category : '');
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setForm({ ...form, screenshot_url: reader.result });
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);

    try {
      const data = {
        ...form,
        category: form.category === 'Custom' ? customCategory : form.category,
        reviewed: Number(form.reviewed),
        improved: Number(form.improved)
      };

      editing ? await updateCapsule(capsule.id, data) : await createCapsule(data);
      await onSaved();
      onClose();
    } catch (err) {
      console.error(err);
    }

    setSaving(false);
  }

  return (
    <div className="form-backdrop">
      <form className="capsule-form" onSubmit={handleSubmit}>
        <h2>{editing ? 'Edit capsule' : 'Create capsule'}</h2>
        <p>{editing ? 'Update the saved prompt record.' : 'Save a new prompt record.'}</p>

        <div className="form-row three">
          <label>Project name<input name="project_name" value={form.project_name} onChange={handleChange} required /></label>
          <label>Prompt title<input name="prompt_title" value={form.prompt_title} onChange={handleChange} required /></label>
          <label>Prompt version<input name="prompt_version" value={form.prompt_version} onChange={handleChange} placeholder="v1" /></label>
        </div>

        <div className="form-row">
          <label>Category
            <select name="category" value={form.category} onChange={handleChange}>
              {categories.map(category => <option key={category}>{category}</option>)}
              <option>Custom</option>
            </select>
          </label>

          {form.category === 'Custom' &&
            <label>Custom category<input value={customCategory} onChange={e => setCustomCategory(e.target.value)} required /></label>
          }
        </div>

        <label>Prompt text<textarea name="prompt_text" value={form.prompt_text} onChange={handleChange} required /></label>
        <label>Response summary<textarea name="response_summary" value={form.response_summary} onChange={handleChange} /></label>

        <div className="form-row three">
          <label>Rating
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map(star =>
                <button type="button" key={star} className={star <= Number(form.usefulness) ? 'selected' : ''}
                  onClick={() => setForm({ ...form, usefulness: String(star) })}>★</button>
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

        <label>Screenshot link (optional)
          <input name="screenshot_url" value={form.screenshot_url.startsWith('data:') ? '' : form.screenshot_url}
            onChange={handleChange} placeholder="https://..." />
        </label>

        <label>Or upload screenshot
          <input type="file" accept="image/*" onChange={handleUpload} />
        </label>

        <div className="form-actions">
          <button type="button" className="secondary-button" onClick={onClose}>Cancel</button>
          <button className="main-button" disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Save changes' : 'Create capsule'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CapsuleForm;