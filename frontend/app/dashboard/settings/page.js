'use client';
import { useState, useEffect } from 'react';
import { settingsAPI, usersAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { Settings, Upload, Plus, Edit2, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('lab');

  useEffect(() => {
    Promise.all([
      settingsAPI.get().then(r => setSettings(r.data.settings)),
      usersAPI.getAll().then(r => setUsers(r.data.users))
    ]).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await settingsAPI.update(settings);
      toast.success('Settings saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await settingsAPI.uploadLogo(formData);
      setSettings(prev => ({ ...prev, logo: data.logo }));
      toast.success('Logo updated');
    } catch {
      toast.error('Failed to upload logo');
    }
  };

  if (loading) return <div className="card p-8 text-center text-slate-400">Loading settings...</div>;

  const s = settings || {};
  const f = (k) => ({ value: s[k] || '', onChange: e => setSettings({ ...s, [k]: e.target.value }) });

  const tabs = ['lab', 'users', 'system'];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-slate-600" />
        </div>
        <h2 className="text-lg font-semibold text-slate-800">System Settings</h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-slate-200 pb-0">
        {['Laboratory Info', 'Users & Roles', 'System'].map((tab, i) => (
          <button key={i} onClick={() => setActiveTab(tabs[i])}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === tabs[i]
                ? 'border-primary-600 text-primary-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>{tab}
          </button>
        ))}
      </div>

      {/* Lab Info */}
      {activeTab === 'lab' && (
        <form onSubmit={handleSave}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">Laboratory Logo</h3>
              <div className="flex flex-col items-center gap-3">
                {s.logo ? (
                  <img src={`http://localhost:5000${s.logo}`} alt="Logo"
                    className="w-24 h-24 object-contain rounded-xl border border-slate-200" />
                ) : (
                  <div className="w-24 h-24 bg-primary-50 rounded-xl border-2 border-dashed border-primary-200 flex items-center justify-center text-primary-300 text-3xl font-bold">
                    ML
                  </div>
                )}
                <label className="btn-secondary cursor-pointer text-xs py-1.5">
                  <Upload className="w-3.5 h-3.5" />
                  Upload Logo
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                </label>
                <p className="text-xs text-slate-400">PNG, JPG, max 2MB</p>
              </div>
            </div>

            <div className="lg:col-span-2 card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-700">Laboratory Details</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Laboratory Name</label>
                  <input className="input" {...f('labName')} />
                </div>
                <div>
                  <label className="label">License Number</label>
                  <input className="input" {...f('labLicense')} />
                </div>
              </div>
              <div>
                <label className="label">Address</label>
                <input className="input" {...f('labAddress')} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Phone</label>
                  <input className="input" {...f('labPhone')} />
                </div>
                <div>
                  <label className="label">Email</label>
                  <input type="email" className="input" {...f('labEmail')} />
                </div>
              </div>
              <div>
                <label className="label">PDF Footer Text</label>
                <textarea className="input resize-none" rows={2} {...f('footerText')} />
              </div>
              <div>
                <label className="label">Currency Symbol</label>
                <input className="input w-24" {...f('currency')} />
              </div>

              <button type="submit" disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">System Users</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                {['Name', 'Email', 'Role', 'License', 'Status', 'Last Login'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50">
                  <td className="px-4 py-3 font-medium text-slate-800">{u.firstName} {u.lastName}</td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 text-primary-700 font-medium capitalize">
                      {u.role?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">{u.licenseNumber || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 text-xs">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB') : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* System */}
      {activeTab === 'system' && (
        <div className="card p-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">System Configuration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Date Format</label>
              <select className="input" value={s.dateFormat || 'DD/MM/YYYY'}
                onChange={e => setSettings({ ...s, dateFormat: e.target.value })}>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
            <div>
              <label className="label">Result Validation Levels</label>
              <select className="input" value={s.resultValidationLevels || 2}
                onChange={e => setSettings({ ...s, resultValidationLevels: Number(e.target.value) })}>
                <option value={1}>1 Level (Biochemist only)</option>
                <option value={2}>2 Levels (Tech + Biochemist)</option>
              </select>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? 'Saving...' : 'Save System Settings'}
          </button>
        </div>
      )}
    </div>
  );
}
