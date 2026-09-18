import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Send, Download, LogOut, User, Sparkles } from 'lucide-react';

const Navbar = ({ activeView, setActiveView, onExportCSV, onOpenAddModal }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('dashboard')}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white leading-tight flex items-center gap-2">
              Mini CRM <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">Task 2</span>
            </h1>
            <p className="text-xs text-slate-400">Client Lead Management System</p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Admin Dashboard
          </button>
          
          <button
            onClick={() => setActiveView('public-form')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeView === 'public-form'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            <Send className="w-4 h-4 text-emerald-400" />
            Website Contact Form Demo
          </button>
        </div>

        {/* Actions & Admin User Info */}
        <div className="flex items-center gap-3">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Export Leads to CSV"
          >
            <Download className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {user && (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-800">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-200">{user.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">{user.role}</span>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/60 hover:bg-rose-950/40 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
