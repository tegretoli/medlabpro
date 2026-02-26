'use client';
import { useState, useEffect } from 'react';
import { auditAPI } from '@/lib/api';
import { FileText, LogIn, LogOut, Edit2, Plus, Trash2, CheckCircle, Printer } from 'lucide-react';

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const limit = 30;

  useEffect(() => {
    setLoading(true);
    auditAPI.getAll({ page, limit })
      .then(r => { setLogs(r.data.logs); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  }, [page]);

  const actionIcons = {
    login: <LogIn className="w-3.5 h-3.5 text-emerald-600" />,
    logout: <LogOut className="w-3.5 h-3.5 text-slate-400" />,
    create: <Plus className="w-3.5 h-3.5 text-primary-600" />,
    update: <Edit2 className="w-3.5 h-3.5 text-amber-600" />,
    delete: <Trash2 className="w-3.5 h-3.5 text-red-500" />,
    validate: <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />,
    print: <Printer className="w-3.5 h-3.5 text-slate-500" />,
  };

  const actionColors = {
    login: 'bg-emerald-50 text-emerald-700',
    logout: 'bg-slate-50 text-slate-500',
    create: 'bg-primary-50 text-primary-700',
    update: 'bg-amber-50 text-amber-700',
    delete: 'bg-red-50 text-red-700',
    validate: 'bg-emerald-50 text-emerald-700',
    print: 'bg-slate-50 text-slate-600'
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-slate-800 mb-6">Audit Log ({total})</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Time', 'User', 'Action', 'Resource', 'IP'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 shimmer rounded" /></td>
                  ))}</tr>
                ))
              ) : logs.map(log => (
                <tr key={log._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 text-xs text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString('en-GB')}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                    {log.user?.firstName} {log.user?.lastName}
                    <div className="text-xs text-slate-400 capitalize">{log.user?.role?.replace('_', ' ')}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${actionColors[log.action] || 'bg-slate-50 text-slate-500'}`}>
                      {actionIcons[log.action]}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 text-xs capitalize">{log.resource}</td>
                  <td className="px-4 py-3 text-slate-400 text-xs font-mono">{log.ip || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
    </div>
  );
}
