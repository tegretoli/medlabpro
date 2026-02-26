'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import {
  LayoutDashboard, Users, FlaskConical, Building2,
  UserCog, DollarSign, Settings, LogOut, Microscope,
  ChevronRight, Activity, FileText
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'biochemist', 'lab_technician', 'reception'] },
  { href: '/dashboard/patients', icon: Users, label: 'Patients', roles: ['admin', 'biochemist', 'lab_technician', 'reception'] },
  { href: '/dashboard/results', icon: Activity, label: 'Results', roles: ['admin', 'biochemist', 'lab_technician'] },
  { href: '/dashboard/analyses', icon: FlaskConical, label: 'Analyses', roles: ['admin', 'biochemist', 'lab_technician'] },
  { href: '/dashboard/departments', icon: Building2, label: 'Departments', roles: ['admin', 'biochemist'] },
  { href: '/dashboard/referrers', icon: UserCog, label: 'Doctors & Partners', roles: ['admin', 'reception'] },
  { href: '/dashboard/billing', icon: DollarSign, label: 'Billing', roles: ['admin'] },
  { href: '/dashboard/audit', icon: FileText, label: 'Audit Log', roles: ['admin'] },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings', roles: ['admin'] },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const allowed = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <aside className="w-60 bg-primary-900 flex flex-col shrink-0 h-full">
      {/* Logo */}
      <div className="px-5 py-5 flex items-center gap-3 border-b border-white/10">
        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
          <Microscope className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-white font-bold text-sm leading-tight">MedLab Pro</div>
          <div className="text-primary-300 text-xs">LMS v1.0</div>
        </div>
      </div>

      {/* User role badge */}
      <div className="px-4 py-3 mx-3 mt-4 bg-white/5 rounded-lg">
        <div className="text-white text-xs font-medium">{user?.firstName} {user?.lastName}</div>
        <div className="text-primary-300 text-xs capitalize mt-0.5">{user?.role?.replace('_', ' ')}</div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5 overflow-y-auto">
        {allowed.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`sidebar-link ${active ? 'active' : ''}`}>
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-4 border-t border-white/10 pt-3">
        <button onClick={logout}
          className="sidebar-link w-full text-red-300 hover:bg-red-500/20 hover:text-red-200">
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
