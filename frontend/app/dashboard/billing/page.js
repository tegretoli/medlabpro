'use client';
import { useState, useEffect } from 'react';
import { billingAPI, referrersAPI, departmentsAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Download, TrendingUp, FileText } from 'lucide-react';

export default function BillingPage() {
  const [report, setReport] = useState(null);
  const [referrers, setReferrers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    from: new Date(new Date().setDate(1)).toISOString().slice(0, 10),
    to: new Date().toISOString().slice(0, 10),
    department: '',
    referrer: ''
  });
  const [colInvoice, setColInvoice] = useState({ referrerId: '', month: new Date().getMonth() + 1, year: new Date().getFullYear(), data: null });

  useEffect(() => {
    referrersAPI.getAll().then(r => setReferrers(r.data.referrers));
    departmentsAPI.getAll().then(r => setDepartments(r.data.departments));
  }, []);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const { data } = await billingAPI.getReport(filters);
      setReport(data);
    } catch (e) {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const fetchCollaboratorInvoice = async () => {
    if (!colInvoice.referrerId) return toast.error('Select a collaborator');
    const { data } = await billingAPI.getCollaboratorInvoice(colInvoice.referrerId, {
      month: colInvoice.month, year: colInvoice.year
    });
    setColInvoice(prev => ({ ...prev, data: data.invoice }));
  };

  const collaborators = referrers.filter(r => r.isCollaborator);

  return (
    <div className="space-y-6">
      {/* Revenue Report */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary-600" />
          Revenue Report
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="label">From *</label>
            <input type="date" className="input text-sm" value={filters.from}
              onChange={e => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <label className="label">To *</label>
            <input type="date" className="input text-sm" value={filters.to}
              onChange={e => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input text-sm" value={filters.department}
              onChange={e => setFilters({ ...filters, department: e.target.value })}>
              <option value="">All</option>
              {departments.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Referrer</label>
            <select className="input text-sm" value={filters.referrer}
              onChange={e => setFilters({ ...filters, referrer: e.target.value })}>
              <option value="">All</option>
              {referrers.map(r => <option key={r._id} value={r._id}>{r.fullName}</option>)}
            </select>
          </div>
        </div>

        <button onClick={fetchReport} disabled={loading} className="btn-primary">
          {loading ? 'Loading...' : 'Generate Report'}
        </button>

        {report && (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-slate-500">{report.count} tests performed</p>
                <p className="text-2xl font-bold text-slate-800">€{report.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    {['Date', 'Patient', 'Case ID', 'Analysis', 'Department', 'Referrer', 'Price'].map(h => (
                      <th key={h} className="text-left px-3 py-2 text-xs font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {report.results.map(r => (
                    <tr key={r._id} className="hover:bg-slate-50/50">
                      <td className="px-3 py-2 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
                      <td className="px-3 py-2 font-medium text-slate-700">{r.patient?.firstName} {r.patient?.lastName}</td>
                      <td className="px-3 py-2 font-mono text-xs text-primary-700">{r.caseId}</td>
                      <td className="px-3 py-2 text-slate-600">{r.analysis?.name}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">{r.analysis?.department?.name}</td>
                      <td className="px-3 py-2 text-xs text-slate-500">
                        {r.patient?.referrer ? `${r.patient.referrer.firstName || ''} ${r.patient.referrer.lastName || ''}`.trim() || r.patient.referrer.organizationName : '—'}
                      </td>
                      <td className="px-3 py-2 font-semibold text-emerald-700">€{r.price}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td colSpan={6} className="px-3 py-2 text-sm font-semibold text-slate-700">Total</td>
                    <td className="px-3 py-2 text-base font-bold text-emerald-700">€{report.totalRevenue.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Collaborator Invoice */}
      <div className="card p-6">
        <h3 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-600" />
          Monthly Collaborator Invoice
        </h3>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div>
            <label className="label">Collaborator *</label>
            <select className="input text-sm" value={colInvoice.referrerId}
              onChange={e => setColInvoice({ ...colInvoice, referrerId: e.target.value })}>
              <option value="">Select collaborator</option>
              {collaborators.map(r => <option key={r._id} value={r._id}>{r.fullName}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Month</label>
            <select className="input text-sm" value={colInvoice.month}
              onChange={e => setColInvoice({ ...colInvoice, month: Number(e.target.value) })}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Year</label>
            <input type="number" className="input text-sm" value={colInvoice.year}
              onChange={e => setColInvoice({ ...colInvoice, year: Number(e.target.value) })} />
          </div>
        </div>

        <button onClick={fetchCollaboratorInvoice} className="btn-primary">
          Generate Invoice
        </button>

        {colInvoice.data && (
          <div className="mt-5 border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-primary-700 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{colInvoice.data.referrer?.fullName}</p>
                <p className="text-primary-200 text-xs">Period: {colInvoice.data.period?.month}/{colInvoice.data.period?.year}</p>
              </div>
              <div className="text-right">
                <p className="text-primary-200 text-xs">Total Amount</p>
                <p className="text-white text-2xl font-bold">€{colInvoice.data.subtotal?.toFixed(2)}</p>
              </div>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b">
                <tr>
                  {['Date', 'Patient', 'Case ID', 'Analysis', 'Price'].map(h => (
                    <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {colInvoice.data.results?.map(r => (
                  <tr key={r._id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(r.createdAt).toLocaleDateString('en-GB')}</td>
                    <td className="px-4 py-2.5">{r.patient?.firstName} {r.patient?.lastName}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-primary-700">{r.patient?.caseId}</td>
                    <td className="px-4 py-2.5 text-slate-600">{r.analysis?.name}</td>
                    <td className="px-4 py-2.5 font-semibold text-emerald-700">€{r.price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
