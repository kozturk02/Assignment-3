import { useEffect, useState } from 'react';

const emptyForm = {
  project_name: '',
  prompt_title: '',
  prompt_version: '',
  prompt_text: '',
  response_summary: '',
  category: '',
  usefulness: '',
  reviewed: false,
  improved: false,
  screenshot_url: '',
  notes: '',
};

function CapsuleForm({ capsule, onSave, onCancel }) {
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    setForm(capsule ? { ...emptyForm, ...capsule } : emptyForm);
  }, [capsule]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await onSave(form);

    if (!capsule) {
      setForm(emptyForm);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>{capsule ? 'Edit Capsule' : 'Add Capsule'}</h2>

      <input name="project_name" value={form.project_name} onChange={handleChange} placeholder="Project name" required />
      <input name="prompt_title" value={form.prompt_title} onChange={handleChange} placeholder="Prompt title" required />
      <input name="prompt_version" value={form.prompt_version} onChange={handleChange} placeholder="Version" />
      <textarea name="prompt_text" value={form.prompt_text} onChange={handleChange} placeholder="Prompt text" required />
      <textarea name="response_summary" value={form.response_summary} onChange={handleChange} placeholder="Response summary" />
      <input name="category" value={form.category} onChange={handleChange} placeholder="Category" />
      <input name="usefulness" value={form.usefulness} onChange={handleChange} placeholder="Usefulness" />

      <label>
        Reviewed
        <input type="checkbox" name="reviewed" checked={form.reviewed} onChange={handleChange} />
      </label>

      <label>
        Improved
        <input type="checkbox" name="improved" checked={form.improved} onChange={handleChange} />
      </label>

      <input name="screenshot_url" value={form.screenshot_url} onChange={handleChange} placeholder="Screenshot URL" />
      <textarea name="notes" value={form.notes} onChange={handleChange} placeholder="Notes" />

      <button type="submit">{capsule ? 'Update' : 'Add'}</button>

      {capsule && (
        <button type="button" onClick={onCancel}>Cancel</button>
      )}
    </form>
  );
}

export default CapsuleForm;