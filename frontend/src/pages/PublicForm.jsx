import React, { useState } from 'react';
import { publicAPI } from '../services/api';
import { Send, CheckCircle2, AlertCircle, Sparkles, Building, Mail, Phone, MessageSquare, ArrowLeft } from 'lucide-react';

const PublicForm = ({ onBackToDashboard }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await publicAPI.submitContactForm({ ...formData, source: 'Website Form' });
      if (res.data.success) {
        setSuccessMsg(res.data.message || 'Thank you! Your lead has been submitted to the CRM.');
        setFormData({ name: '', email: '', phone: '', company: '', message: '' });
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrorMsg(err.response.data.errors.join(' '));
      } else if (err.response?.data?.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg('Failed to submit form. Please check network connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      
      {/* Background glow graphics */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto z-10 relative">
        
        {/* Navigation back button */}
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white mb-6 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Admin Dashboard
          </button>
        )}

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Live Client Website Contact Form
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
            Get In Touch With Our Team
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto">
            Fill out the form below. Submitting will automatically insert a new lead into the CRM pipeline in real-time.
          </p>
        </div>

        {/* Contact Form Card */}
        <div className="glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl">

          {successMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-xs">

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Your Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="rahul@example.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Company / Organization</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="ABC Technologies Ltd."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Project Details / Message *</label>
              <textarea
                rows="4"
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Tell us about your project requirements, budget, or timeline..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {loading ? 'Submitting Inquiry...' : 'Submit Contact Inquiry'}
            </button>

          </form>

          <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
            Protected by API Rate Limiter (Max 5 submissions per 15 mins per IP).
          </div>

        </div>

      </div>
    </div>
  );
};

export default PublicForm;
