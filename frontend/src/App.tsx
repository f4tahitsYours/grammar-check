import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLogin from './pages/auth/AdminLogin'

import StudentDashboard from './pages/dashboard/student/StudentDashboard'
import History from './pages/dashboard/student/history/History'
import AssignmentStudent from './pages/dashboard/student/assignments/AssignmentsStudent'

import TeacherDashboard from './pages/dashboard/teacher/TeacherDashboard'
import TeacherHistory from './pages/dashboard/teacher/history/TeacherHistory'

import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import TeacherAssignment from './pages/dashboard/teacher/assignment/TeacherAssignment'
import TeacherSubmission from './pages/dashboard/teacher/submission/TeacherSubmission'
import TeacherReports from './pages/dashboard/teacher/TeacherReport'
import SchoolsPage from './pages/dashboard/admin/SchoolsPage'
import UsersPage from './pages/dashboard/admin/UsersPage'
import AuditLogPage from './pages/dashboard/admin/AuditLogPage'

import ProtectedRoute from './components/auth/ProtectedRoute'

function App() {

  return (

    <Routes>

      {/* ROOT */}
      <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      {/* AUTH */}
      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route 
        path="/admin-portal" 
        element={<AdminLogin />} />

      {/* STUDENT */}
      <Route
        path="/dashboard/student/"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/student/history/"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <History />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/student/assignment/"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <AssignmentStudent />
          </ProtectedRoute>
        }
      />

      {/* TEACHER */}
      <Route
        path="/dashboard/teacher/"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/teacher/assignment/"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherAssignment />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/teacher/submission/"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherSubmission />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/teacher/history/"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherHistory />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/teacher/reports/"
        element={
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherReports />
          </ProtectedRoute>
        }
      />

      {/* ADMIN */}
      <Route
        path="/dashboard/admin/"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin/school/"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <SchoolsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin/users/"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <UsersPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/admin/audit-log/"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AuditLogPage />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/login" replace />} />

    </Routes>

  )
}

export default App