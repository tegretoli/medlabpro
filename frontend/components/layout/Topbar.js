'use client';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Search } from 'lucide-react';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/dashboard/patients': 'Patients',
  '/dashboard/results': 'Results',
  '/dashboard/analyses': 'Analyses',
  '/dashboard/departments': 'Departments',
  '/dashboard/referrers': 'Doctors & Partners',
  '/dashboard/billing': 'Billing & Reports',
  '/dashboard/audit': 'Audit Log',
  '/dashboard/settings': 'Settings',
};

export default function Topbar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const title = Object.entries(pageTitles).sort((a, b) => b[0].length - a[0].length)
    .find(([path]) => pathname.startsWith(path))?.[1] || 'MedLab Pro';

  const now = new Date();
  const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6 shrink-0">
      <div className="flex-1">
        <h1 className="text-base font-semibold text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400">{dateStr}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg text-xs text-slate-500">
          <Search className="w-3.5 h-3.5" />
          Quick search...
        </div>
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
          <Bell className="w-4.5 h-4.5 text-slate-500" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 bg-primary-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-slate-700">{user?.firstName} {user?.lastName}</div>
            <div className="text-xs text-slate-400 capitalize">{user?.role?.replace('_', ' ')}</div>
          </div>
        </div>
      </div>
    </header>
  );
}
