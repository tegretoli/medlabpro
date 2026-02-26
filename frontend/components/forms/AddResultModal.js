'use client';
import { useState, useEffect } from 'react';
import { analysesAPI, resultsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, FlaskConical } from 'lucide-react';

export default function AddResultModal({ patientId, onClose, onSaved }) {
  const [analyses, setAnalyses] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    analysesAPI.getAll().then(r => setAnalyses(r.data.analyses));
  }, []);

  const handleSelectAnalysis = async (id) => {
    const analysis = analyses.find(a => a._id === id);
    setSelectedAnalysis(analysis);
    setComponents(analysis?.components?.map(c => ({
      componentName: c.name,
      value: '',
      unit: c.unit || '',
      referenceRange: c.referenceRanges?.[0] ? `${c.referenceRanges[0].low || ''} – ${c.referenceRanges[0].high || ''}` : '',
      flag: 'normal'
    })) || []);
  };

  const updateComponent = (idx, field, value) => {
    setComponents(prev => prev.map((c, i) => i === idx ? { ...c, [field]: value } : c));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await resultsAPI.create({
        patientId,
        analysisId: selectedAnalysis._id,
        components
      });
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add result');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <FlaskConical className="w-4 h-4 text-primary-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">Add Analysis Result</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Select analysis */}
          <div>
            <label className="label">Select Analysis *</label>
            <select className="input" onChange={e => handleSelectAnalysis(e.target.value)} required>
              <option value="">— Choose analysis —</option>
              {analyses.map(a => (
                <option key={a._id} value={a._id}>
                  {a.name} — €{a.standardPrice} ({a.department?.name})
                </option>
              ))}
            </select>
          </div>

          {/* Components form */}
          {selectedAnalysis && components.length > 0 && (
            <form onSubmit={handleSubmit}>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2.5 border-b border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                    {selectedAnalysis.name} — Enter Results
                  </h4>
                </div>
                <div className="divide-y divide-slate-100">
                  {components.map((comp, idx) => (
                    <div key={idx} className="px-4 py-3 grid grid-cols-12 gap-3 items-center">
                      <div className="col-span-4">
                        <span className="text-sm font-medium text-slate-700">{comp.componentName}</span>
                        {comp.referenceRange && (
                          <div className="text-xs text-slate-400 mt-0.5">Ref: {comp.referenceRange}</div>
                        )}
                      </div>
                      <div className="col-span-3">
                        <input type="text" className="input text-sm py-1.5" placeholder="Value"
                          value={comp.value}
                          onChange={e => updateComponent(idx, 'value', e.target.value)} />
                      </div>
                      <div className="col-span-2">
                        <input type="text" className="input text-sm py-1.5" placeholder="Unit"
                          value={comp.unit}
                          onChange={e => updateComponent(idx, 'unit', e.target.value)} />
                      </div>
                      <div className="col-span-3">
                        <select className="input text-sm py-1.5"
                          value={comp.flag}
                          onChange={e => updateComponent(idx, 'flag', e.target.value)}>
                          <option value="normal">Normal</option>
                          <option value="low">Low ↓</option>
                          <option value="high">High ↑</option>
                          <option value="critical_low">Critical Low</option>
                          <option value="critical_high">Critical High</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                  {loading ? 'Saving...' : 'Save Result'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
