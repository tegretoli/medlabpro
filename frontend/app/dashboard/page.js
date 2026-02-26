'use client';
import { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import {
  Users, TrendingUp, Activity, Clock, FlaskConical,
  Building2, ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const COLORS = ['#0369a1', '#059669', '#8b5cf6', '#f59e0b', '#ef4444'];

function StatCard({ title, value, subtitle, icon: Icon, color, trend }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2.5 rounded-xl ${color}`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      {trend !== undefined && (
        <div className={`flex items-center gap-1 mt-3 text-xs font-medium ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend)}% vs last period
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.getStats()
      .then(r => setStats(r.data.stats))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 h-28 shimmer" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card p-5 h-64 shimmer" />
          <div className="card p-5 h-64 shimmer" />
        </div>
      </div>
    );
  }

  const chartData = stats?.chartData?.map(d => ({
    date: d._id?.slice(5),
    revenue: d.revenue,
    tests: d.count
  })) || [];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Patients" value={stats?.patients?.daily || 0}
          subtitle="Registered today" icon={Users} color="bg-primary-700" trend={5} />
        <StatCard title="Monthly Patients" value={stats?.patients?.monthly || 0}
          subtitle="This month" icon={Users} color="bg-emerald-600" trend={12} />
        <StatCard title="Daily Revenue" value={`€${(stats?.revenue?.daily || 0).toFixed(0)}`}
          subtitle="Today's earnings" icon={TrendingUp} color="bg-violet-600" />
        <StatCard title="Monthly Revenue" value={`€${(stats?.revenue?.monthly || 0).toFixed(0)}`}
          subtitle="This month" icon={TrendingUp} color="bg-amber-600" trend={8} />
      </div>

      {/* Pending Alert */}
      {stats?.pendingResults > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <Clock className="w-4 h-4 shrink-0" />
          <span className="text-sm font-medium">{stats.pendingResults} result(s) pending validation</span>
          <a href="/dashboard/results" className="ml-auto text-xs font-semibold underline">View all →</a>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="card p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue — Last 30 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0369a1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#0369a1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v) => [`€${v.toFixed(2)}`, 'Revenue']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }} />
              <Area type="monotone" dataKey="revenue" stroke="#0369a1" strokeWidth={2}
                fill="url(#colorRev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by dept */}
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Revenue by Department</h3>
          {stats?.revenueByDept?.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={stats.revenueByDept} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  dataKey="revenue" nameKey="_id">
                  {stats.revenueByDept.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => [`€${v.toFixed(0)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data yet</div>
          )}
          <div className="space-y-1 mt-2">
            {stats?.revenueByDept?.map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  <span className="text-slate-600">{d._id}</span>
                </div>
                <span className="font-semibold text-slate-700">€{d.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Analyses */}
      {stats?.topAnalyses?.length > 0 && (
        <div className="card p-5">
          <h3 className="text-sm font-semibold text-slate-700 mb-4 flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-primary-600" />
            Top Performed Analyses
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Analysis</th>
                  <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Count</th>
                  <th className="text-right pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topAnalyses.map((a, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2.5 font-medium text-slate-700">{a.analysis?.name}</td>
                    <td className="py-2.5 text-right text-slate-600">{a.count}</td>
                    <td className="py-2.5 text-right font-semibold text-emerald-700">€{a.revenue.toFixed(0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
