import React from 'react';
import { Search, Filter, Plus, ChevronRight, Mail, Phone, Building2, Calendar, Sparkles } from 'lucide-react';

const statusBadges = {
  NEW: { label: 'New', bg: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  CONTACTED: { label: 'Contacted', bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  IN_PROGRESS: { label: 'In Progress', bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  CONVERTED: { label: 'Converted', bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  LOST: { label: 'Lost', bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

const LeadTable = ({
  leads = [],
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  sourceFilter,
  setSourceFilter,
  onSelectLead,
  onOpenAddModal
}) => {
  const statuses = [
    { id: 'ALL', label: 'All Leads' },
    { id: 'NEW', label: 'New' },
    { id: 'CONTACTED', label: 'Contacted' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'CONVERTED', label: 'Converted' },
    { id: 'LOST', label: 'Lost' }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="glass-card rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
      
      {/* Table Controls Header */}
      <div className="p-5 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-slate-900/50">
        
        {/* Search Bar */}
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, or company..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Filters & Add Lead Button */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          
          {/* Source Filter Dropdown */}
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-medium focus:outline-none cursor-pointer"
            >
              <option value="ALL" className="bg-slate-900 text-slate-200">All Sources</option>
              <option value="Website Form" className="bg-slate-900 text-slate-200">Website Form</option>
              <option value="Referral" className="bg-slate-900 text-slate-200">Referral</option>
              <option value="LinkedIn" className="bg-slate-900 text-slate-200">LinkedIn</option>
              <option value="Direct" className="bg-slate-900 text-slate-200">Direct</option>
            </select>
          </div>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

      </div>

      {/* Status Pipeline Filter Tabs */}
      <div className="px-5 py-3 border-b border-slate-800/80 bg-slate-950/40 flex items-center gap-2 overflow-x-auto">
        {statuses.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-slate-800 text-white border border-slate-700 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-300 border-collapse">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-semibold text-[10px] tracking-wider border-b border-slate-800">
            <tr>
              <th className="py-3.5 px-5">Lead / Contact</th>
              <th className="py-3.5 px-4">Company</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Created Date</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {leads.length === 0 ? (
              <tr>
                <td colSpan="6" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 text-slate-600 mb-1" />
                    <p className="font-semibold text-slate-400 text-sm">No leads found</p>
                    <p className="text-xs text-slate-500">Try adjusting your search query or filter options.</p>
                  </div>
                </td>
              </tr>
            ) : (
              leads.map((lead) => {
                const badge = statusBadges[lead.status] || statusBadges.NEW;
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onSelectLead(lead)}
                    className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                  >
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-100 text-sm group-hover:text-blue-400 transition-colors">
                        {lead.name}
                      </div>
                      <div className="flex items-center gap-3 text-slate-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {lead.email}
                        </span>
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-4 text-slate-300 font-medium">
                      {lead.company ? (
                        <span className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-500" />
                          {lead.company}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-slate-900 text-slate-400 border border-slate-800 text-[11px] font-medium">
                        {lead.source || 'Website'}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full border text-[11px] font-semibold ${badge.bg}`}>
                        ● {badge.label}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(lead.created_at)}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <div className="inline-flex items-center gap-1 text-slate-400 group-hover:text-blue-400 font-semibold text-xs">
                        View Details
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default LeadTable;
