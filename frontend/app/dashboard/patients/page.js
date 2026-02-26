'use client';
import { useState, useEffect, useCallback } from 'react';
import { patientsAPI } from '@/lib/api';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Plus, Search, Eye, Edit2, User, Calendar } from 'lucide-react';
import PatientModal from '@/components/forms/PatientModal';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const limit = 15;

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await patientsAPI.getAll({ search, page, limit });
      setPatients(data.patients);
      setTotal(data.total);
    } catch (e) {
      toast.error('Failed to load patients');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { fetchPatients(); }, [fetchPatients]);

  const handleSaved = () => {
    setShowModal(false);
    setEditing(null);
    fetchPatients();
    toast.success(editing ? 'Patient updated' : 'Patient registered');
  };

  const statusColor = (gender) => gender === 'male' ? 'text-blue-600 bg-blue-50' : 'text-pink-600 bg-pink-50';

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Patient Registry</h2>
          <p className="text-sm text-slate-500">{total} total patients</p>
        </div>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          New Patient
        </button>
      </div>

      {/* Search */}
      <div className="card mb-4 p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" className="input pl-9" placeholder="Search by name or case ID..."
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Case ID', 'Patient', 'Gender', 'Age', 'Visit Date', 'Referrer', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-4 shimmer rounded" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                    <User className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p>No patients found</p>
                  </td>
                </tr>
              ) : patients.map(p => (
                <tr key={p._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {p.caseId}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {p.firstName} {p.lastName}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusColor(p.gender)}`}>
                      {p.gender}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.age} yrs</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.visitDate).toLocaleDateString('en-GB')}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {p.referrer?.fullName || p.referrer ? `Dr. ${p.referrer.firstName} ${p.referrer.lastName}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/patients/${p._id}`}
                        className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button onClick={() => { setEditing(p); setShowModal(true); }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > limit && (
          <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Showing {(page - 1) * limit + 1}–{Math.min(page * limit, total)} of {total}
            </p>
            <div className="flex gap-1">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
                className="btn-secondary py-1 px-2 text-xs disabled:opacity-40">← Prev</button>
              <button disabled={page * limit >= total} onClick={() => setPage(p => p + 1)}
                className="btn-secondary py-1 px-2 text-xs disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <PatientModal
          patient={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
