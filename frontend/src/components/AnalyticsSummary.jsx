import React from 'react';
import { Users, UserPlus, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

const AnalyticsSummary = ({ analytics }) => {
  if (!analytics) return null;

  const { totalLeads = 0, statusCounts = {}, conversionRate = 0 } = analytics;

  const kpis = [
    {
      title: 'Total Leads',
      value: totalLeads,
      icon: <Users className="w-5 h-5 text-blue-400" />,
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'Total inquiries received'
    },
    {
      title: 'New Leads',
      value: statusCounts.NEW || 0,
      icon: <UserPlus className="w-5 h-5 text-cyan-400" />,
      bg: 'bg-cyan-500/10 border-cyan-500/20',
      text: 'Awaiting first contact'
    },
    {
      title: 'In Progress',
      value: (statusCounts.CONTACTED || 0) + (statusCounts.IN_PROGRESS || 0),
      icon: <Clock className="w-5 h-5 text-amber-400" />,
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'Contacted & negotiating'
    },
    {
      title: 'Converted Clients',
      value: statusCounts.CONVERTED || 0,
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'Successfully converted'
    },
    {
      title: 'Conversion Rate',
      value: `${conversionRate}%`,
      icon: <TrendingUp className="w-5 h-5 text-indigo-400" />,
      bg: 'bg-indigo-500/10 border-indigo-500/20',
      text: 'Lead-to-Client conversion'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {kpis.map((kpi, idx) => (
        <div
          key={idx}
          className="glass-card p-4 rounded-2xl border flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{kpi.title}</span>
            <div className={`p-2 rounded-xl border ${kpi.bg}`}>
              {kpi.icon}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">{kpi.value}</div>
            <p className="text-[11px] text-slate-400 mt-1">{kpi.text}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsSummary;
