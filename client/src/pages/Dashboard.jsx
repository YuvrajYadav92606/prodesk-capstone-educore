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
  Sparkles,
  Clock,
  Layers,
  ChevronRight,
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
      setErrorBanner('Failed to load courses from server');
    } finally {
      setLoadingCourses(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleModalSubmit = async (formData) => {
    setIsSubmitting(true);
    setErrorBanner('');
    try {
      if (editingCourse) {
        const res = await api.put(`/courses/${editingCourse._id}`, formData);
        if (res.data.success) {
          setCourses((prev) =>
            prev.map((c) => (c._id === editingCourse._id ? res.data.data : c))
          );
          setSuccessBanner('Course updated successfully');
        }
      } else {
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
        err.response?.data?.message || 'Action failed. Please check permissions.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCourse = async (courseId, courseTitle) => {
    const previousCourses = [...courses];
    setCourses((prev) => prev.filter((c) => c._id !== courseId));

    try {
      await api.delete(`/courses/${courseId}`);
      setSuccessBanner(`Course "${courseTitle}" removed.`);
    } catch (err) {
      setCourses(previousCourses);
      setErrorBanner(
        err.response?.data?.message ||
          'Only the course author or administrator can delete this course.'
      );
    }
  };

  const handleBuyCourse = async (courseId) => {
    setCheckoutLoading(courseId);
    setErrorBanner('');
    try {
      const res = await api.post('/payment/create-checkout-session', { courseId });
      if (res.data.success && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      }
    } catch (err) {
      setErrorBanner(err.response?.data?.message || 'Unable to initialize checkout.');
      setCheckoutLoading(null);
    }
  };

  const isInstructor = user?.role === 'instructor' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* SaaS App Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-lg shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-lg">EduCore</span>
              <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-600 rounded-full">
                Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">{user?.name}</div>
              <div className="text-xs text-slate-500 capitalize">{user?.role}</div>
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

      {/* Main SaaS App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Dynamic Alerts */}
        {errorBanner && (
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-medium animate-fadeIn">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <div className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">
              Course Catalog
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Welcome back, {user?.name?.split(' ')[0] || 'Learner'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Explore enterprise learning tracks, enroll in certified modules, or manage your published curricula.
            </p>
          </div>

          {isInstructor && (
            <button
              onClick={() => {
                setEditingCourse(null);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>New Course</span>
            </button>
          )}
        </div>

        {/* Course Grid */}
        {loadingCourses ? (
          <div className="py-16 text-center text-slate-500 text-sm">Loading course catalog...</div>
        ) : courses.length === 0 ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-semibold text-slate-700 text-base">No courses published yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Get started by creating your first course syllabus or check back shortly for published modules.
            </p>
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
                  className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition-all hover:border-slate-300"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium">
                        {course.category}
                      </span>
                      <span className="text-xs font-medium text-slate-500 capitalize">
                        {course.level}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">
                        {course.title}
                      </h3>
                      {course.summary ? (
                        <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                          {course.summary}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                          {course.description}
                        </p>
                      )}
                    </div>

                    {/* Semantic Keyword Tags */}
                    {course.tags && course.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {course.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-3 flex items-center justify-between border-t border-slate-100 text-xs">
                      <div className="text-slate-500">
                        By <span className="font-semibold text-slate-700">{course.instructor?.name || 'Faculty Member'}</span>
                      </div>
                      <div className="font-bold text-slate-900 text-base">
                        ${course.price?.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleBuyCourse(course._id)}
                      disabled={checkoutLoading === course._id}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-all disabled:opacity-50"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{checkoutLoading === course._id ? 'Connecting...' : 'Enroll Now'}</span>
                    </button>

                    {isOwner && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingCourse(course);
                            setIsModalOpen(true);
                          }}
                          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Course"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course._id, course.title)}
                          className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
