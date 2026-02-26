'use client';
import { useState, useEffect } from 'react';
import { referrersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { X, UserCog } from 'lucide-react';

export default function ReferrerModal({ referrer, onClose, onSaved }) {
  const [form, setForm] = useState({
    type: 'doctor', firstName: '', lastName: '', organizationName: '',
    specialty: '', phone: '', email: '', address: '',
    isCollaborator: false, pricingType: 'none', discountPercentage: '', notes: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (referrer) setForm({ ...referrer, pricingType: referrer.pricingType || 'none' });
  }, [referrer]);

  const f = (k) => ({ value: form[k] ?? '', onChange: e => setForm({ ...form, [k]: e.target.value }) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (referrer?._id) {
        await referrersAPI.update(referrer._id, form);
      } else {
        await referrersAPI.create(form);
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
              <UserCog className="w-4 h-4 text-primary-700" />
            </div>
            <h2 className="text-base font-semibold">{referrer ? 'Edit' : 'Add'} Doctor / Partner</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-slate-100 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="label">Type</label>
            <select className="input" {...f('type')}>
              <option value="doctor">Doctor</option>
              <option value="collaborator">Collaborating Lab</option>
              <option value="institution">Institution / Hospital</option>
            </select>
          </div>

          {form.type === 'institution' ? (
            <div>
              <label className="label">Organization Name *</label>
              <input className="input" {...f('organizationName')} required />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">First Name *</label>
                <input className="input" {...f('firstName')} required />
              </div>
              <div>
                <label className="label">Last Name *</label>
                <input className="input" {...f('lastName')} required />
              </div>
            </div>
          )}

          <div>
            <label className="label">Specialty</label>
            <input className="input" placeholder="e.g., Cardiology, General Practitioner" {...f('specialty')} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Phone</label><input className="input" {...f('phone')} /></div>
            <div><label className="label">Email</label><input type="email" className="input" {...f('email')} /></div>
          </div>

          <div>
            <label className="label">Address</label>
            <input className="input" {...f('address')} />
          </div>

          {/* Collaborator settings */}
          <div className="border-t border-slate-100 pt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isCollaborator}
                onChange={e => setForm({ ...form, isCollaborator: e.target.checked })}
                className="w-4 h-4 accent-primary-600" />
              <span className="text-sm font-medium text-slate-700">Is a collaborating partner (special pricing)</span>
            </label>

            {form.isCollaborator && (
              <div className="mt-3 space-y-3 pl-6">
                <div>
                  <label className="label">Pricing Type</label>
                  <select className="input" {...f('pricingType')}>
                    <option value="none">Standard collaborator prices</option>
                    <option value="percentage">Percentage discount</option>
                    <option value="fixed">Fixed custom prices per analysis</option>
                  </select>
                </div>
                {form.pricingType === 'percentage' && (
                  <div>
                    <label className="label">Discount %</label>
                    <input type="number" className="input" min="0" max="100" placeholder="e.g., 20" {...f('discountPercentage')} />
                  </div>
                )}
              </div>
            )}
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" rows={2} {...f('notes')} />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
