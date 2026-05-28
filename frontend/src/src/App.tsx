import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

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

      {/* STUDENT */}
      <Route
        path="/dashboard/student/"
        element={<StudentDashboard />}
      />

      <Route
        path="/dashboard/student/history/"
        element={<History />}
      />

      <Route
        path="/dashboard/student/assignment/"
        element={<AssignmentStudent />}
      />

      {/* TEACHER */}
      <Route
        path="/dashboard/teacher/"
        element={<TeacherDashboard />}
      />

      <Route
        path="/dashboard/teacher/assignment/"
        element={<TeacherAssignment />}
      />

      <Route
        path="/dashboard/teacher/submission/"
        element={<TeacherSubmission />}
      />

      <Route
        path="/dashboard/teacher/history/"
        element={<TeacherHistory />}
      />

      <Route
        path="/dashboard/teacher/reports/"
        element={<TeacherReports />}
      />

      {/* ADMIN */}
      <Route
        path="/dashboard/admin/"
        element={<AdminDashboard />}
      />

      <Route
        path="/dashboard/admin/school/"
        element={<SchoolsPage />}
      />

      <Route
        path="/dashboard/admin/users/"
        element={<UsersPage />}
      />

      <Route
        path="/dashboard/admin/audit-log/"
        element={<AuditLogPage />}
      />

    </Routes>

  )
}

export default App