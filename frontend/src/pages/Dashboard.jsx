import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnalyticsSummary from '../components/AnalyticsSummary';
import LeadTable from '../components/LeadTable';
import LeadDetailDrawer from '../components/LeadDetailDrawer';
import AddLeadModal from '../components/AddLeadModal';
import ConfirmModal from '../components/ConfirmModal';
import Toast from '../components/Toast';
import PublicForm from './PublicForm';
import { leadAPI } from '../services/api';

const Dashboard = () => {
  const [activeView, setActiveView] = useState('dashboard'); // 'dashboard' or 'public-form'
  const [leads, setLeads] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sourceFilter, setSourceFilter] = useState('ALL');

  // Modals & Drawers state
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadActivities, setLeadActivities] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [deleteConfirmLead, setDeleteConfirmLead] = useState(null);

  // Toast state
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

const fetchLeads = async () => {
  try {
    const res = await leadAPI.getAll({
      search: search || undefined,
      status: statusFilter !== 'ALL' ? statusFilter : undefined,
      source: sourceFilter !== 'ALL' ? sourceFilter : undefined
    });

    setLeads(res.data);
  } catch (err) {
    showToast('Failed to load leads from server.', 'error');
  }
};

  const fetchAnalytics = async () => {
  try {
    const res = await leadAPI.getAnalytics();

    setAnalytics(res.data);
  } catch (err) {
    console.error('Failed to load analytics:', err);
  }
};

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchLeads(), fetchAnalytics()]).finally(() => setLoading(false));
  }, [search, statusFilter, sourceFilter]);

  // Open detail drawer for a lead
  const handleSelectLead = async (lead) => {
  setSelectedLead(lead);
  setIsDrawerOpen(true);

  try {
    const res = await leadAPI.getById(lead._id);

    setSelectedLead(res.data.lead);
    setLeadActivities(res.data.activities || []);
  } catch (err) {
    console.error('Failed to load lead details:', err);
    showToast('Failed to load lead details.', 'error');
  }
};

  // Status transition
 const handleUpdateStatus = async (leadId, newStatus) => {
  try {
    const res = await leadAPI.updateStatus(leadId, newStatus);

    showToast(`Status updated to ${newStatus}`);

    // Update the selected lead immediately
    setSelectedLead(res.data.lead);

    // Refresh activity timeline
    const detailsRes = await leadAPI.getById(leadId);

    if (detailsRes.data.activities) {
      setLeadActivities(detailsRes.data.activities);
    }

    // Refresh dashboard data
    fetchLeads();
    fetchAnalytics();
  } catch (err) {
    console.error('Status update error:', err);
    showToast('Failed to update status.', 'error');
  }
};

  // Add follow-up note
  const handleAddNote = async (leadId, noteText) => {
  try {
    const res = await leadAPI.addNote(leadId, noteText);

    showToast(res.data.message || 'Follow-up note saved');

    // Reload the lead activities
    const detailsRes = await leadAPI.getById(leadId);

    setSelectedLead(detailsRes.data.lead);
    setLeadActivities(detailsRes.data.activities || []);

    fetchLeads();
  } catch (err) {
    console.error('Add note error:', err);
    showToast('Failed to add note.', 'error');
  }
};

  // Add lead manually
 const handleCreateLead = async (leadData) => {
  try {
    const res = await leadAPI.create(leadData);

    showToast(res.data.message || 'Lead created successfully');

    setIsAddModalOpen(false);

    fetchLeads();
    fetchAnalytics();
  } catch (err) {
    console.error('Create lead error:', err);
    showToast('Failed to create lead.', 'error');
  }
};

  // Confirm Delete Lead
  const handleConfirmDelete = async () => {
  if (!deleteConfirmLead) return;

  try {
    const res = await leadAPI.delete(deleteConfirmLead._id);

    showToast(res.data.message || 'Lead deleted successfully');

    setDeleteConfirmLead(null);
    setIsDrawerOpen(false);
    setSelectedLead(null);

    fetchLeads();
    fetchAnalytics();
  } catch (err) {
    console.error('Delete lead error:', err);
    showToast('Failed to delete lead.', 'error');
  }
};

  // Export CSV
  const handleExportCSV = async () => {
    try {
      const res = await leadAPI.exportCSV();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'leads_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast('CSV export downloaded successfully');
    } catch (err) {
      showToast('Failed to export CSV.', 'error');
    }
  };

  if (activeView === 'public-form') {
    return <PublicForm onBackToDashboard={() => setActiveView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onExportCSV={handleExportCSV}
        onOpenAddModal={() => setIsAddModalOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Analytics */}
        <AnalyticsSummary analytics={analytics} />

        {/* Filterable Leads Table */}
        <LeadTable
          leads={leads}
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          sourceFilter={sourceFilter}
          setSourceFilter={setSourceFilter}
          onSelectLead={handleSelectLead}
          onOpenAddModal={() => setIsAddModalOpen(true)}
        />

      </main>

      {/* Slide-over Detail Drawer */}
      <LeadDetailDrawer
        lead={selectedLead}
        activities={leadActivities}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
        onDeleteClick={(lead) => setDeleteConfirmLead(lead)}
      />

      {/* Add Lead Modal */}
      <AddLeadModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateLead}
      />

      {/* Delete Lead Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteConfirmLead}
        title="Delete Lead Permanent Action"
        message={`Are you sure you want to delete lead "${deleteConfirmLead?.name}"? This will permanently remove the lead and all associated follow-up notes and activity history.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmLead(null)}
        confirmText="Delete Permanently"
      />

      {/* Toast Alert */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

    </div>
  );
};

export default Dashboard;
