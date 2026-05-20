import { Routes, Route, Navigate } from 'react-router-dom'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

import StudentDashboard from './pages/dashboard/student/StudentDashboard'
import History from './pages/dashboard/student/history/History'
import SubmissionDetail from './pages/dashboard/student/submission/SubmissionDetail'
import AssignmentStudent from './pages/dashboard/student/assignments/AssignmentsStudent'

import TeacherDashboard from './pages/dashboard/teacher/TeacherDashboard'
import TeacherHistory from './pages/dashboard/teacher/history/TeacherHistory'

import AdminDashboard from './pages/dashboard/admin/AdminDashboard'
import TeacherAssignment from './pages/dashboard/teacher/assignment/TeacherAssignment'
import StudentSubmission from './pages/dashboard/student/submission/StudentSubmission'
import TeacherSubmission from './pages/dashboard/teacher/submission/TeacherSubmission'
import TeacherReports from './pages/dashboard/teacher/TeacherReport'

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
        path="/dashboard/student/submission/:id"
        element={<SubmissionDetail />}
      />

      <Route
        path="/dashboard/student/assignment/"
        element={<AssignmentStudent />}
      />

      <Route
        path="/dashboard/student/submission/"
        element={<StudentSubmission />}
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

    </Routes>

  )
}

export default App