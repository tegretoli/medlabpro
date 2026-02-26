'use client';
import { useState, useEffect } from 'react';
import { analysesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, Plus, Trash2, FlaskConical } from 'lucide-react';

const emptyComponent = () => ({
  name: '', unit: '', displayOrder: 0,
  referenceRanges: [{ gender: 'all', low: '', high: '', label: '' }]
});

export default function AnalysisModal({ analysis, departments, onClose, onSaved }) {
  const [form, setForm] = useState({
    name: '', code: '', department: '', standardPrice: '', collaboratorPrice: '',
    requiresSample: 'blood', isPanel: false, turnaroundTime: 24, description: '',
    components: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (analysis) setForm({ ...analysis, department: analysis.department?._id || analysis.department || '' });
  }, [analysis]);

  const f = (k) => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const addComponent = () => setForm({ ...form, components: [...form.components, emptyComponent()] });

  const removeComponent = (idx) => {
    setForm({ ...form, components: form.components.filter((_, i) => i !== idx) });
  };

  const updateComponent = (idx, key, value) => {
    const comps = [...form.components];
    comps[idx] = { ...comps[idx], [key]: value };
    setForm({ ...form, components: comps });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (analysis?._id) {
        await analysesAPI.update(analysis._id, form);
      } else {
        await analysesAPI.create(form);
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-primary-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {analysis ? 'Edit Analysis' : 'New Analysis'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Analysis Name *</label>
              <input className="input" placeholder="e.g., Blood Glucose" {...f('name')} required />
            </div>
            <div>
              <label className="label">Code *</label>
              <input className="input" placeholder="e.g., GLU" {...f('code')} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department *</label>
              <select className="input" {...f('department')} required>
                <option value="">Select department</option>
                {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Sample Type</label>
              <select className="input" {...f('requiresSample')}>
                {['blood', 'urine', 'stool', 'swab', 'csf', 'other'].map(s => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Standard Price (€) *</label>
              <input type="number" className="input" placeholder="0.00" min="0" step="0.01" {...f('standardPrice')} required />
            </div>
            <div>
              <label className="label">Collaborator Price (€)</label>
              <input type="number" className="input" placeholder="0.00" min="0" step="0.01" {...f('collaboratorPrice')} />
            </div>
            <div>
              <label className="label">Turnaround (hrs)</label>
              <input type="number" className="input" min="1" {...f('turnaroundTime')} />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.isPanel} onChange={e => setForm({ ...form, isPanel: e.target.checked })}
                className="w-4 h-4 accent-primary-600" />
              This is a panel (multiple components)
            </label>
          </div>

          {/* Dynamic Components */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="label mb-0">Components / Parameters</label>
              <button type="button" onClick={addComponent}
                className="btn-secondary py-1 px-2.5 text-xs">
                <Plus className="w-3.5 h-3.5" />
                Add Component
              </button>
            </div>

            <div className="space-y-3">
              {form.components.map((comp, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-slate-400 w-6">#{idx + 1}</span>
                    <input className="input flex-1" placeholder="Component name (e.g., HGB)" value={comp.name}
                      onChange={e => updateComponent(idx, 'name', e.target.value)} />
                    <input className="input w-24" placeholder="Unit" value={comp.unit || ''}
                      onChange={e => updateComponent(idx, 'unit', e.target.value)} />
                    <button type="button" onClick={() => removeComponent(idx)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2 pl-9">
                    <select className="input text-xs py-1.5" value={comp.referenceRanges?.[0]?.gender || 'all'}
                      onChange={e => {
                        const ranges = [...(comp.referenceRanges || [{ low: '', high: '' }])];
                        ranges[0] = { ...ranges[0], gender: e.target.value };
                        updateComponent(idx, 'referenceRanges', ranges);
                      }}>
                      <option value="all">Both</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                    <input className="input text-xs py-1.5" placeholder="Low" type="number" step="0.01"
                      value={comp.referenceRanges?.[0]?.low || ''}
                      onChange={e => {
                        const ranges = [...(comp.referenceRanges || [])];
                        if (!ranges[0]) ranges[0] = {};
                        ranges[0] = { ...ranges[0], low: e.target.value };
                        updateComponent(idx, 'referenceRanges', ranges);
                      }} />
                    <input className="input text-xs py-1.5" placeholder="High" type="number" step="0.01"
                      value={comp.referenceRanges?.[0]?.high || ''}
                      onChange={e => {
                        const ranges = [...(comp.referenceRanges || [])];
                        if (!ranges[0]) ranges[0] = {};
                        ranges[0] = { ...ranges[0], high: e.target.value };
                        updateComponent(idx, 'referenceRanges', ranges);
                      }} />
                    <input className="input text-xs py-1.5" placeholder="Label (optional)"
                      value={comp.referenceRanges?.[0]?.label || ''}
                      onChange={e => {
                        const ranges = [...(comp.referenceRanges || [])];
                        if (!ranges[0]) ranges[0] = {};
                        ranges[0] = { ...ranges[0], label: e.target.value };
                        updateComponent(idx, 'referenceRanges', ranges);
                      }} />
                  </div>
                </div>
              ))}
              {form.components.length === 0 && (
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
                  No components yet. Click "Add Component" to add parameters.
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : analysis ? 'Update Analysis' : 'Create Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
