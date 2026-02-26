'use client';
import { useState, useEffect, useCallback } from 'react';
import { resultsAPI, departmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import StatusBadge from '@/components/ui/StatusBadge';
import { CheckCircle, Download, Eye, Filter } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';

export default function ResultsPage() {
  const [results, setResults] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', department: '', from: '', to: '' });
  const { user } = useAuth();

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await resultsAPI.getAll(filters);
      setResults(data.results);
    } catch (e) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    departmentsAPI.getAll().then(r => setDepartments(r.data.departments));
  }, []);

  useEffect(() => { fetchResults(); }, [fetchResults]);

  const handleValidate = async (id, level) => {
    try {
      await resultsAPI.validate(id, level);
      toast.success(`Result ${level} validated`);
      fetchResults();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Validation failed');
    }
  };

  const canTechValidate = ['lab_technician', 'biochemist', 'admin'].includes(user?.role);
  const canBioValidate = ['biochemist', 'admin'].includes(user?.role);

  const handleDownloadPdf = (resultId) => {
    const token = localStorage.getItem('lms_token');
    window.open(`${resultsAPI.downloadPdf(resultId)}?token=${token}`, '_blank');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">Results Management</h2>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Filter className="w-3.5 h-3.5" />
          {results.length} result(s)
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4 p-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="label">Status</label>
            <select className="input text-sm" value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="tech_validated">Tech Validated</option>
              <option value="biochemist_validated">Biochemist Validated</option>
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input text-sm" value={filters.department}
              onChange={e => setFilters({ ...filters, department: e.target.value })}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">From Date</label>
            <input type="date" className="input text-sm" value={filters.from}
              onChange={e => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <label className="label">To Date</label>
            <input type="date" className="input text-sm" value={filters.to}
              onChange={e => setFilters({ ...filters, to: e.target.value })} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                {['Case ID', 'Patient', 'Analysis', 'Department', 'Date', 'Price', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i}>{[...Array(8)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>
                  ))}</tr>
                ))
              ) : results.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-slate-400">No results found</td></tr>
              ) : results.map(r => (
                <tr key={r._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                      {r.caseId}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                    {r.patient?.firstName} {r.patient?.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{r.analysis?.name}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {r.analysis?.department?.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleDateString('en-GB')}
                  </td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">€{r.price}</td>
                  <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={`/dashboard/results/${r._id}`}
                        className="p-1.5 hover:bg-primary-50 rounded-lg text-primary-600 transition-colors" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      {canTechValidate && r.status === 'pending' && (
                        <button onClick={() => handleValidate(r._id, 'tech')}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-600 transition-colors" title="Tech Validate">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {canBioValidate && r.status === 'tech_validated' && (
                        <button onClick={() => handleValidate(r._id, 'biochemist')}
                          className="p-1.5 hover:bg-emerald-50 rounded-lg text-emerald-700 transition-colors" title="Biochemist Validate">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {r.status === 'biochemist_validated' && (
                        <button onClick={() => handleDownloadPdf(r._id)}
                          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors" title="Download PDF">
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
