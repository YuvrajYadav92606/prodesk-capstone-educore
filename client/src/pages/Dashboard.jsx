import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { CourseModal } from '../components/CourseModal';
import {
  GraduationCap,
  LogOut,
  Plus,
  Trash2,
  Edit,
  CreditCard,
  BookOpen,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, logoutUser } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [errorBanner, setErrorBanner] = useState('');
  const [successBanner, setSuccessBanner] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null);

  // Fetch courses from server
  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      if (res.data.success) {
        setCourses(res.data.data);
      }
    } catch (err) {
      setErrorBanner('Failed to load courses from API');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Phase 1 & 2: Create / Update Course Mutation
  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorBanner('');
    try {
      if (editingCourse) {
        // PUT /api/courses/:id (Protected with Data Ownership validation)
        const res = await api.put(`/courses/${editingCourse._id}`, formData);
        if (res.data.success) {
          setCourses((prev) =>
            prev.map((c) => (c._id === editingCourse._id ? res.data.data : c))
          );
          setSuccessBanner('Course updated successfully');
        }
      } else {
        // POST /api/courses (Binds instructor to decoded JWT user)
        const res = await api.post('/courses', formData);
        if (res.data.success) {
          setCourses((prev) => [res.data.data, ...prev]);
          setSuccessBanner('Course published successfully');
        }
      }
      setIsModalOpen(false);
      setEditingCourse(null);
    } catch (err) {
      setErrorBanner(
        err.response?.data?.message || 'Action failed. Ownership permission denied.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phase 2: OPTIMISTIC UI DELETION
  // Instantly filter out of the DOM, then invoke API. Rollback if server rejects (403 Forbidden).
  const handleDeleteCourse = async (courseId, courseTitle) => {
    const previousCourses = [...courses];

    // Optimistically update the state setter immediately
    setCourses((prev) => prev.filter((c) => c._id !== courseId));
    setSuccessBanner(`Optimistically removed "${courseTitle}" from DOM...`);

    try {
      // Async API call in the background
      await api.delete(`/courses/${courseId}`);
      setSuccessBanner(`Successfully confirmed deletion of "${courseTitle}".`);
    } catch (err) {
      // Rollback on rejection (e.g. 403 Forbidden / Not Owner)
      console.error('Delete rejected by server:', err);
      setCourses(previousCourses);
      setErrorBanner(
        err.response?.data?.message ||
          'Ownership Security: You can only delete courses that you authored.'
      );
    }
  };

  // Phase 3: Stripe Checkout Trigger
  const handleBuyCourse = async (courseId) => {
    setCheckoutLoading(courseId);
    setErrorBanner('');
    try {
      const res = await api.post('/payment/create-checkout-session', { courseId });
      if (res.data.success && res.data.checkoutUrl) {
        // Redirect to Stripe Checkout
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err) {
      setErrorBanner(err.response?.data?.message || 'Failed to initiate Stripe Checkout session');
      setCheckoutLoading(null);
    }
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight">EduCore</span>
              <span className="ml-2 px-2 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                Track B: CRUD & Gateway
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

      {/* Main Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Alerts */}
        {errorBanner && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorBanner}</span>
            </div>
            <button onClick={() => setErrorBanner('')} className="underline text-red-800">Dismiss</button>
          </div>
        )}

        {successBanner && (
          <div className="flex items-center justify-between p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successBanner}</span>
            </div>
            <button onClick={() => setSuccessBanner('')} className="underline text-emerald-900">Dismiss</button>
          </div>
        )}

        {/* Dashboard Title & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Course Resource Management</h1>
            <p className="text-xs text-slate-500 mt-1">
              JWT-protected CRUD, Ownership Validation (<code className="text-indigo-600">authorId === req.user.id</code>), Optimistic UI, and Stripe Gateway.
            </p>
          </div>

          {isInstructor && (
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Course</span>
            </button>
          )}
        </div>

        {/* Course Grid */}
        {loadingCourses ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading course catalog...</div>
        ) : courses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-sm">No courses available yet</h3>
            <p className="text-xs text-slate-400">Click "Create New Course" above to publish your first enterprise module.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => {
              const isOwner =
                user &&
                (course.instructor?._id === user.id ||
                  course.instructor === user.id ||
                  user.role === 'admin');

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-[11px] font-semibold">
                        {course.category}
                      </span>
                      <span className="text-xs font-medium text-slate-400 capitalize">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <div className="text-slate-500">
                        Instructor: <span className="font-semibold text-slate-700">{course.instructor?.name || 'Faculty Member'}</span>
                      </div>
                      <div className="font-extrabold text-slate-900 text-sm">
                        ${course.price?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                    {/* Buyer Trigger: Stripe Checkout */}
                    <button
                      onClick={() => handleBuyCourse(course._id)}
                      disabled={checkoutLoading === course._id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{checkoutLoading === course._id ? 'Connecting...' : 'Enroll with Stripe'}</span>
                    </button>

                    {/* Owner / Admin Management Buttons */}
                    {isOwner ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Course (Owner)"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id, course.title)}
                          className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Optimistic Delete (Owner)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic px-2">Read-Only</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal for Create / Edit */}
      <CourseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCourse(null);
        }}
        onSubmit={handleModalSubmit}
        initialData={editingCourse}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
