import React, { useState } from 'react';
import { X, Mail, Phone, Building2, Calendar, Globe, Trash2, Send, Clock, CheckCircle2, User, MessageSquare, AlertCircle } from 'lucide-react';

const pipeline = ['NEW', 'CONTACTED', 'IN_PROGRESS', 'CONVERTED'];

const statusConfig = {
  NEW: { label: 'New', color: 'blue' },
  CONTACTED: { label: 'Contacted', color: 'purple' },
  IN_PROGRESS: { label: 'In Progress', color: 'amber' },
  CONVERTED: { label: 'Converted', color: 'emerald' },
  LOST: { label: 'Lost', color: 'rose' }
};

const LeadDetailDrawer = ({
  lead,
  activities = [],
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
  onDeleteClick
}) => {
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  if (!isOpen || !lead) return null;

  const handleNoteSubmit = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    await onAddNote(lead.id, noteText);
    setNoteText('');
    setAddingNote(false);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'CREATED':
        return <User className="w-4 h-4 text-blue-400" />;
      case 'STATUS_CHANGE':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'NOTE_ADDED':
        return <MessageSquare className="w-4 h-4 text-indigo-400" />;
      default:
        return <Clock className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-end">
      
      <div className="w-full max-w-2xl bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl relative animate-slide-left">
        
        {/* Drawer Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-white">{lead.name}</h2>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase border ${
                lead.status === 'CONVERTED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                lead.status === 'LOST' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                lead.status === 'IN_PROGRESS' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                lead.status === 'CONTACTED' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                'bg-blue-500/10 text-blue-400 border-blue-500/30'
              }`}>
                {lead.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Lead ID: #{lead.id} • Source: {lead.source || 'Website'}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onDeleteClick(lead)}
              className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Delete Lead"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Contact Details Card */}
          <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Email Address</span>
              <a href={`mailto:${lead.email}`} className="text-blue-400 hover:underline flex items-center gap-1.5 font-medium">
                <Mail className="w-3.5 h-3.5" />
                {lead.email}
              </a>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Phone</span>
              <span className="text-slate-200 flex items-center gap-1.5 font-medium">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {lead.phone || 'Not provided'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Company</span>
              <span className="text-slate-200 flex items-center gap-1.5 font-medium">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {lead.company || 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 font-semibold block mb-1">Received Date</span>
              <span className="text-slate-200 flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {formatDate(lead.created_at)}
              </span>
            </div>

            {lead.message && (
              <div className="col-span-1 sm:col-span-2 pt-2 border-t border-slate-800/80">
                <span className="text-slate-500 font-semibold block mb-1">Initial Contact Message</span>
                <p className="text-slate-300 italic bg-slate-900/80 p-3 rounded-lg border border-slate-800/60 text-xs leading-relaxed">
                  "{lead.message}"
                </p>
              </div>
            )}
          </div>

          {/* Status Pipeline Lifecycle */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Status Pipeline Transition</h3>
            
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {pipeline.map((st) => {
                const isCurrent = lead.status === st;
                return (
                  <button
                    key={st}
                    onClick={() => onUpdateStatus(lead.id, st)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {statusConfig[st].label}
                  </button>
                );
              })}

              <button
                onClick={() => onUpdateStatus(lead.id, 'LOST')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all border text-center ${
                  lead.status === 'LOST'
                    ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-rose-400 hover:border-rose-900/50'
                }`}
              >
                Lost
              </button>
            </div>
          </div>

          {/* Add Follow-up Note Form */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Add Follow-up Note</h3>
            <form onSubmit={handleNoteSubmit} className="space-y-2">
              <textarea
                rows="3"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Log a call outcome, meeting summary, or next action steps..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              ></textarea>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={addingNote || !noteText.trim()}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md shadow-blue-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  {addingNote ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </form>
          </div>

          {/* Activity & Notes Timeline */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" />
              Activity & Follow-Up Timeline
            </h3>

            {activities.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No activity recorded yet.</p>
            ) : (
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                {activities.map((act) => (
                  <div key={act.id} className="relative group">
                    {/* Circle marker */}
                    <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                      {getActivityIcon(act.activity_type)}
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-300">{act.created_by || 'System'}</span>
                        <span>{formatDate(act.created_at)}</span>
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-medium">
                        {act.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};

export default LeadDetailDrawer;
