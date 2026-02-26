'use client';
import { useState, useEffect } from 'react';
import { departmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Building2, FlaskConical } from 'lucide-react';

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    departmentsAPI.getAll()
      .then(r => setDepartments(r.data.departments))
      .finally(() => setLoading(false));
  }, []);

  const deptIcons = {
    'Biochemistry': '🧪',
    'Microbiology': '🦠',
    'PCR': '🧬',
    'Hematology': '🩸',
    'Immunology': '🛡️',
    'Urinalysis': '💧'
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-6">Departments</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="card h-36 shimmer" />)
        ) : departments.map(d => (
          <div key={d._id} className="card p-5 hover:shadow-card-hover transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: d.color + '15' }}>
                {deptIcons[d.name] || '🔬'}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">{d.name}</h3>
                <p className="text-xs text-slate-500 font-mono">{d.code}</p>
              </div>
            </div>
            {d.description && (
              <p className="mt-3 text-xs text-slate-500">{d.description}</p>
            )}
            <div className="mt-3 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
              <span className="text-xs text-slate-500">Active</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
