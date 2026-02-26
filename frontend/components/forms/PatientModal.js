'use client';
import { useState, useEffect } from 'react';
import { patientsAPI, referrersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, User } from 'lucide-react';

export default function PatientModal({ patient, onClose, onSaved }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', gender: '', dateOfBirth: '',
    phone: '', email: '', address: '', referrer: '', visitDate: new Date().toISOString().slice(0, 10), notes: ''
  });
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    referrersAPI.getAll().then(r => setReferrers(r.data.referrers));
    if (patient) {
      setForm({
        ...patient,
        dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().slice(0, 10) : '',
        visitDate: patient.visitDate ? new Date(patient.visitDate).toISOString().slice(0, 10) : '',
        referrer: patient.referrer?._id || patient.referrer || ''
      });
    }
  }, [patient]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (patient?._id) {
        await patientsAPI.update(patient._id, form);
      } else {
        await patientsAPI.create(form);
      }
      onSaved();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const f = (k) => ({ value: form[k], onChange: e => setForm({ ...form, [k]: e.target.value }) });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-primary-700" />
            </div>
            <h2 className="text-base font-semibold text-slate-800">
              {patient ? 'Edit Patient' : 'Register New Patient'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">First Name *</label>
              <input className="input" placeholder="John" {...f('firstName')} required />
            </div>
            <div>
              <label className="label">Last Name *</label>
              <input className="input" placeholder="Doe" {...f('lastName')} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Gender *</label>
              <select className="input" {...f('gender')} required>
                <option value="">Select gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Date of Birth *</label>
              <input type="date" className="input" {...f('dateOfBirth')} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input className="input" placeholder="+1 555 0000" {...f('phone')} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" placeholder="patient@email.com" {...f('email')} />
            </div>
          </div>

          <div>
            <label className="label">Address</label>
            <input className="input" placeholder="Street, City, Country" {...f('address')} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Referring Doctor / Partner</label>
              <select className="input" {...f('referrer')}>
                <option value="">— Self-referred —</option>
                {referrers.map(r => (
                  <option key={r._id} value={r._id}>
                    {r.organizationName || `Dr. ${r.firstName} ${r.lastName}`}
                    {r.isCollaborator ? ' ★' : ''}
                  </option>
                ))}
              </select>
              {form.referrer && referrers.find(r => r._id === form.referrer)?.isCollaborator && (
                <p className="text-xs text-emerald-600 mt-1">✓ Collaborator pricing will be applied</p>
              )}
            </div>
            <div>
              <label className="label">Visit Date *</label>
              <input type="date" className="input" {...f('visitDate')} required />
            </div>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} placeholder="Additional notes..." {...f('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : patient ? 'Update Patient' : 'Register Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
