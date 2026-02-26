'use client';
import { useState, useEffect } from 'react';
import { patientsAPI, resultsAPI, analysesAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { ArrowLeft, Plus, Download, CheckCircle, Clock, User, Calendar, FlaskConical } from 'lucide-react';
import StatusBadge from '@/components/ui/StatusBadge';
import AddResultModal from '@/components/forms/AddResultModal';

export default function PatientDetailPage({ params }) {
  const { id } = params;
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddResult, setShowAddResult] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await patientsAPI.getOne(id);
      setPatient(data.patient);
      setResults(data.results || []);
    } catch (e) {
      toast.error('Failed to load patient data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleDownloadPdf = (resultId) => {
    const token = localStorage.getItem('lms_token');
    window.open(`${resultsAPI.downloadPdf(resultId)}?token=${token}`, '_blank');
  };

  if (loading) return <div className="card p-8 text-center text-slate-400">Loading...</div>;
  if (!patient) return <div className="card p-8 text-center text-slate-400">Patient not found</div>;

  return (
    <div className="space-y-5">
      {/* Back */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/patients" className="btn-secondary py-1.5 px-3 text-xs">
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </Link>
        <h2 className="text-lg font-semibold text-slate-800">
          {patient.firstName} {patient.lastName}
        </h2>
        <span className="font-mono text-xs font-semibold text-primary-700 bg-primary-50 px-2 py-1 rounded">
          {patient.caseId}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Patient Info */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary-600" />
            Patient Information
          </h3>
          <div className="space-y-3 text-sm">
            {[
              ['Full Name', `${patient.firstName} ${patient.lastName}`],
              ['Gender', patient.gender],
              ['Date of Birth', patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString('en-GB') : '—'],
              ['Age', `${patient.age} years`],
              ['Phone', patient.phone || '—'],
              ['Email', patient.email || '—'],
              ['Address', patient.address || '—'],
              ['Visit Date', new Date(patient.visitDate).toLocaleDateString('en-GB')],
              ['Referrer', patient.referrer?.fullName || patient.referrer ? `Dr. ${patient.referrer?.firstName} ${patient.referrer?.lastName}` : 'Self-referred'],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                <span className="text-slate-500 text-xs font-medium">{k}</span>
                <span className="text-slate-800 text-xs font-medium capitalize max-w-[60%] text-right">{v}</span>
              </div>
            ))}
          </div>
          {patient.notes && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg text-xs text-amber-800">
              <strong>Notes:</strong> {patient.notes}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-primary-600" />
              Analysis Results ({results.length})
            </h3>
            <button onClick={() => setShowAddResult(true)} className="btn-primary py-1.5 px-3 text-xs">
              <Plus className="w-3.5 h-3.5" />
              Add Analysis
            </button>
          </div>

          {results.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <FlaskConical className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No analyses yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {results.map(result => (
                <div key={result._id} className="border border-slate-200 rounded-xl p-4 hover:border-primary-200 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-slate-800 text-sm">{result.analysis?.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {result.analysis?.department?.name} · {new Date(result.createdAt).toLocaleDateString('en-GB')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={result.status} />
                      <span className="text-sm font-semibold text-emerald-700">€{result.price}</span>
                    </div>
                  </div>
                  {result.components?.length > 0 && (
                    <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {result.components.slice(0, 6).map((c, i) => (
                        <div key={i} className={`text-xs px-2 py-1 rounded-lg flex justify-between ${
                          c.flag === 'high' || c.flag === 'critical_high' ? 'bg-red-50 text-red-700' :
                          c.flag === 'low' || c.flag === 'critical_low' ? 'bg-blue-50 text-blue-700' :
                          'bg-slate-50 text-slate-600'
                        }`}>
                          <span className="truncate mr-1">{c.componentName}</span>
                          <span className="font-semibold whitespace-nowrap">{c.value || '—'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {result.status === 'biochemist_validated' && (
                    <div className="mt-3 flex justify-end">
                      <button onClick={() => handleDownloadPdf(result._id)}
                        className="btn-secondary py-1 px-3 text-xs">
                        <Download className="w-3.5 h-3.5" />
                        Download PDF
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showAddResult && (
        <AddResultModal
          patientId={id}
          onClose={() => setShowAddResult(false)}
          onSaved={() => { setShowAddResult(false); fetchData(); toast.success('Analysis added'); }}
        />
      )}
    </div>
  );
}
