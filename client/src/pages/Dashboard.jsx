import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  GraduationCap,
  LogOut,
  ShieldCheck,
  Key,
  Database,
  CheckCircle,
  Clock,
  BookOpen,
  Award,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Fetch verified profile from the cryptographically protected backend endpoint
  useEffect(() => {
    const fetchProtectedProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        if (res.data.success) {
          setProfileData(res.data.user);
        }
      } catch (err) {
        console.error('Failed to load protected profile:', err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProtectedProfile();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">EduCore</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                Protected Route Active
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role} Portal</div>
            </div>
            <button
              onClick={logoutUser}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-red-600 hover:bg-red-50 border border-slate-200 rounded-lg transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-medium border border-indigo-500/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cryptographic Session Verified via JWT</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-300 text-sm">
              Your authentication token is valid and actively verified against the Node.js Express protected middleware.
            </p>
          </div>
        </div>

        {/* Security & Verification Status Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Bcrypt Salt & Hash</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Your password was salted with 10 rounds and hashed before database commit. Plain-text strings are never persisted.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <CheckCircle className="w-4 h-4" />
              <span>Phase 1 Architecture Complete</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Key className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">JWT Sign & Verification</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              The server signed a cryptographic token carrying your claims. Stored securely in client <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">localStorage</code>.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
              <CheckCircle className="w-4 h-4" />
              <span>Phase 2 Integration Complete</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Express Middleware Guard</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Protected routes intercept requests via <code className="bg-slate-100 px-1 py-0.5 rounded text-purple-700">Authorization: Bearer</code> headers. Expired tokens auto-redirect to login.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-purple-600">
              <CheckCircle className="w-4 h-4" />
              <span>Phase 3 Advanced Optimization</span>
            </div>
          </div>
        </div>

        {/* Live Authenticated Profile Card */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Active Session Telemetry</h2>
              <p className="text-xs text-slate-500">Live data returned from protected endpoint <code className="text-indigo-600">GET /api/auth/me</code></p>
            </div>
            <span className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700">
              Role: {user?.role}
            </span>
          </div>

          {loadingProfile ? (
            <div className="py-6 text-center text-sm text-slate-500">Loading protected payload...</div>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">User ID</span>
                <p className="text-sm font-mono font-medium text-slate-800 truncate mt-0.5">{profileData?._id || user?.id}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Name</span>
                <p className="text-sm font-medium text-slate-800 mt-0.5">{profileData?.name || user?.name}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Verified Email</span>
                <p className="text-sm font-medium text-slate-800 mt-0.5 truncate">{profileData?.email || user?.email}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Session Status</span>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Authorized & Active</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
