'use client';
import { useState, useEffect } from 'react';
import { referrersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Plus, Edit2, UserCog, Star } from 'lucide-react';
import ReferrerModal from '@/components/forms/ReferrerModal';

export default function ReferrersPage() {
  const [referrers, setReferrers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchReferrers = async () => {
    setLoading(true);
    const { data } = await referrersAPI.getAll();
    setReferrers(data.referrers);
    setLoading(false);
  };

  useEffect(() => { fetchReferrers(); }, []);

  const handleSaved = () => {
    setShowModal(false);
    setEditing(null);
    fetchReferrers();
    toast.success('Saved');
  };

  const doctors = referrers.filter(r => r.type === 'doctor');
  const collaborators = referrers.filter(r => r.isCollaborator);
  const institutions = referrers.filter(r => r.type === 'institution');

  const Card = ({ r }) => (
    <div className="card p-4 hover:shadow-card-hover transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
            r.isCollaborator ? 'bg-amber-100' : 'bg-primary-100'
          }`}>
            {r.isCollaborator ? <Star className="w-4 h-4 text-amber-600" /> : <UserCog className="w-4 h-4 text-primary-700" />}
          </div>
          <div>
            <h4 className="font-semibold text-slate-800 text-sm">{r.fullName}</h4>
            {r.specialty && <p className="text-xs text-slate-500">{r.specialty}</p>}
          </div>
        </div>
        <button onClick={() => { setEditing(r); setShowModal(true); }}
          className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400">
          <Edit2 className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="mt-3 space-y-1 text-xs">
        {r.phone && <p className="text-slate-500">📞 {r.phone}</p>}
        {r.email && <p className="text-slate-500">✉️ {r.email}</p>}
        {r.isCollaborator && (
          <p className="text-amber-700 font-medium mt-2">
            ★ Collaborator
            {r.pricingType === 'percentage' && ` — ${r.discountPercentage}% discount`}
            {r.pricingType === 'fixed' && ' — Custom pricing'}
          </p>
        )}
      </div>
    </div>
  );

  const Section = ({ title, items, emptyMsg }) => (
    <div>
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title} ({items.length})</h3>
      {loading ? (
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
          {[1, 2].map(i => <div key={i} className="card h-28 shimmer" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center text-slate-400 text-sm">
          {emptyMsg}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {items.map(r => <Card key={r._id} r={r} />)}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Doctors & Partners</h2>
        <button onClick={() => { setEditing(null); setShowModal(true); }} className="btn-primary">
          <Plus className="w-4 h-4" />
          Add New
        </button>
      </div>

      <Section title="Referring Doctors" items={doctors} emptyMsg="No referring doctors yet" />
      <Section title="Collaborating Partners" items={collaborators} emptyMsg="No collaborators yet" />
      <Section title="Institutions" items={institutions} emptyMsg="No institutions yet" />

      {showModal && (
        <ReferrerModal
          referrer={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
