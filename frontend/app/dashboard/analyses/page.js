'use client';
import { useState, useEffect } from 'react';
import { analysesAPI, departmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, FlaskConical, Trash2 } from 'lucide-react';
import AnalysisModal from '@/components/forms/AnalysisModal';
import { useAuth } from '@/hooks/useAuth';

export default function AnalysesPage() {
  const [analyses, setAnalyses] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterDept, setFilterDept] = useState('');
  const { user } = useAuth();

  const fetchAnalyses = async () => {
    setLoading(true);
    try {
      const { data } = await analysesAPI.getAll({ department: filterDept });
      setAnalyses(data.analyses);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    departmentsAPI.getAll().then(r => setDepartments(r.data.departments));
  }, []);

  useEffect(() => { fetchAnalyses(); }, [filterDept]);

  const handleSaved = () => {
    setShowModal(false);
    setEditing(null);
    fetchAnalyses();
    toast.success('Analysis saved');
  };

  const handleDelete = async (id) => {
    if (!confirm('Deactivate this analysis?')) return;
    await analysesAPI.delete(id);
    toast.success('Analysis deactivated');
    fetchAnalyses();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Analysis Catalog</h2>
        {user?.role === 'admin' && (
          <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Analysis
          </button>
        )}
      </div>

      <div className="card mb-4 p-4">
        <div className="flex gap-3 items-center">
          <label className="label mb-0 whitespace-nowrap">Department:</label>
          <select className="input max-w-xs text-sm" value={filterDept}
            onChange={e => setFilterDept(e.target.value)}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => <div key={i} className="card p-5 h-40 shimmer" />)
        ) : analyses.map(a => (
          <div key={a._id} className="card p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: a.department?.color + '20' }}>
                  <FlaskConical className="w-4.5 h-4.5" style={{ color: a.department?.color }} />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 text-sm leading-tight">{a.name}</h3>
                  <span className="text-xs text-slate-500">{a.code}</span>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(a); setShowModal(true); }}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(a._id)}
                    className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-4 text-sm">
              <div>
                <div className="text-xs text-slate-500">Standard</div>
                <div className="font-bold text-slate-800">€{a.standardPrice}</div>
              </div>
              {a.collaboratorPrice && (
                <div>
                  <div className="text-xs text-slate-500">Collaborator</div>
                  <div className="font-bold text-emerald-700">€{a.collaboratorPrice}</div>
                </div>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ background: a.department?.color + '15', color: a.department?.color }}>
                {a.department?.name}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 capitalize">
                {a.requiresSample}
              </span>
              {a.isPanel && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-violet-50 text-violet-700">Panel</span>
              )}
            </div>

            {a.components?.length > 0 && (
              <div className="mt-3 text-xs text-slate-500">
                {a.components.length} component{a.components.length !== 1 ? 's' : ''}:
                <span className="text-slate-400 ml-1">
                  {a.components.slice(0, 3).map(c => c.name).join(', ')}
                  {a.components.length > 3 ? ` +${a.components.length - 3} more` : ''}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <AnalysisModal
          analysis={editing}
          departments={departments}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
