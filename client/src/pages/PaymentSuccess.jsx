import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, ShieldCheck, Download, BookOpen } from 'lucide-react';
import api from '../services/api';

export const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const courseId = searchParams.get('course_id');

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (courseId) {
        try {
          const res = await api.get(`/courses/${courseId}`);
          if (res.data.success) {
            setCourse(res.data.data);
          }
        } catch (err) {
          console.warn('Could not load course details:', err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
        <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 animate-bounce" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-semibold uppercase tracking-wider">
            Stripe Transaction Confirmed
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Enrollment Successful!
          </h1>
          <p className="text-xs text-slate-500">
            Your payment was securely processed through the Stripe Checkout gateway pipeline.
          </p>
        </div>

        {loading ? (
          <div className="py-4 text-xs text-slate-400">Loading enrollment payload...</div>
        ) : (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 text-left space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium">Stripe Session:</span>
              <span className="font-mono text-slate-700 truncate max-w-[180px]">{sessionId || 'cs_test_session'}</span>
            </div>
            {course && (
              <>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Course:</span>
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">{course.title}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">Amount Paid:</span>
                  <span className="font-bold text-emerald-600">${course.price.toFixed(2)} USD</span>
                </div>
              </>
            )}
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Access Status:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Lifetime Unlocked
              </span>
            </div>
          </div>
        )}

        <div className="space-y-3 pt-2">
          <Link
            to="/dashboard"
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-2"
          >
            <span>Return to Learning Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
