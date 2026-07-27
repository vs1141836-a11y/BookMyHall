import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { ShieldCheck, Users, Landmark, FileText, CheckCircle, ShieldAlert, BarChart3, AlertCircle, Trash2, Ban } from 'lucide-react';
import axios from 'axios';

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Admin stats
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Resolution text
  const [resolutionNotes, setResolutionNotes] = useState({});

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const res = await axios.get('/dashboard/admin');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOwner = async (ownerId) => {
    try {
      await axios.put(`/dashboard/admin/verify-owner/${ownerId}`);
      fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveHall = async (hallId) => {
    try {
      await axios.put(`/dashboard/admin/approve-hall/${hallId}`);
      fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveReport = async (reportId, status) => {
    try {
      const notes = resolutionNotes[reportId] || 'Reviewed and resolved by administrator.';
      await axios.put(`/reports/${reportId}/resolve`, { status, resolutionNotes: notes });
      fetchAdminStats();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotesChange = (id, val) => {
    setResolutionNotes(prev => ({ ...prev, [id]: val }));
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-brand-500"></div>
      </div>
    );
  }

  const { totalUsers, totalOwners, totalHalls, totalRevenue, pendingHalls, pendingOwners, pendingReportsCount, recentReports, revenueTrends } = stats || {};

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Top Banner */}
      <div className="flex items-center space-x-3 bg-slate-900 text-white rounded-3xl p-6 shadow-md">
        <div className="h-12 w-12 bg-brand-500 text-white rounded-2xl flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin Console</h1>
          <p className="text-xs text-slate-400">Perform user audits, verify venue owners, and approve hall catalog listings</p>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Platform Revenue</span>
            <span className="block text-xl font-extrabold text-slate-800">₹{totalRevenue?.toLocaleString()}</span>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
            <Landmark className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Customers</span>
            <span className="block text-xl font-extrabold text-slate-800">{totalUsers} users</span>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Owners</span>
            <span className="block text-xl font-extrabold text-slate-800">{totalOwners} accounts</span>
          </div>
          <div className="h-10 w-10 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Listings</span>
            <span className="block text-xl font-extrabold text-slate-800">{totalHalls} halls</span>
          </div>
          <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Verification lists grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Owner Approvals Queue */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Users className="h-4.5 w-4.5 text-purple-500" />
            <span>Owner Verification Desk ({pendingOwners?.length})</span>
          </h3>

          {pendingOwners?.length === 0 ? (
            <div className="py-6 text-xs text-slate-400 text-center italic">No owners awaiting verification checks.</div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto pr-1">
              {pendingOwners?.map((owner) => (
                <div key={owner._id} className="py-3.5 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-slate-800">{owner.name}</span>
                    <span className="block text-[10px] text-slate-400">{owner.email} &bull; {owner.phone}</span>
                  </div>
                  <button
                    onClick={() => handleVerifyOwner(owner._id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-lg py-1.5 px-3.5 shadow-sm"
                  >
                    Verify Account
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hall Approvals Queue */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
            <Landmark className="h-4.5 w-4.5 text-brand-500" />
            <span>Venue Listings Desk ({pendingHalls?.length})</span>
          </h3>

          {pendingHalls?.length === 0 ? (
            <div className="py-6 text-xs text-slate-400 text-center italic">No new venue listings to approve.</div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-80 overflow-y-auto pr-1">
              {pendingHalls?.map((hall) => (
                <div key={hall._id} className="py-3.5 flex justify-between items-center">
                  <div className="space-y-0.5">
                    <span className="block text-xs font-bold text-slate-800">{hall.name}</span>
                    <span className="block text-[10px] text-slate-400">{hall.area}, {hall.city} &bull; Owner: {hall.owner?.name}</span>
                  </div>
                  <button
                    onClick={() => handleApproveHall(hall._id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-lg py-1.5 px-3.5 shadow-sm"
                  >
                    Approve Hall
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Complaints log */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-2">
          <ShieldAlert className="h-4.5 w-4.5 text-red-500" />
          <span>Complaints & Abuse Reports Desk ({pendingReportsCount})</span>
        </h3>

        {recentReports?.length === 0 ? (
          <div className="py-6 text-xs text-slate-400 text-center italic">All complaints are resolved. Platform safe.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {recentReports?.map((rep) => (
              <div key={rep._id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                  <div className="space-y-0.5">
                    <span className="bg-red-50 border border-red-100 text-red-600 font-bold px-2 py-0.5 rounded-md uppercase text-[9px]">{rep.issueType}</span>
                    <span className="block font-bold text-slate-800 mt-1">Reporter: {rep.reporter?.name} ({rep.reporter?.email})</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-semibold">Filed: {new Date(rep.createdAt).toLocaleString()}</span>
                </div>
                <p className="text-xs text-slate-500 leading-normal bg-slate-50 border border-slate-100 rounded-xl p-3">
                  {rep.description}
                </p>

                {/* Resolution action desk */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1 items-end sm:items-center">
                  <input
                    type="text"
                    placeholder="Enter resolution notes..."
                    value={resolutionNotes[rep._id] || ''}
                    onChange={(e) => handleNotesChange(rep._id, e.target.value)}
                    className="flex-1 bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleResolveReport(rep._id, 'Ignored')}
                      className="bg-slate-100 text-slate-600 hover:bg-slate-200 text-[10px] font-bold uppercase rounded-lg py-2 px-4 shadow-sm"
                    >
                      Ignore
                    </button>
                    <button
                      onClick={() => handleResolveReport(rep._id, 'Resolved')}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold uppercase rounded-lg py-2 px-4 shadow-sm"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
