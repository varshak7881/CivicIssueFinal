import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import MyIssues from './pages/MyIssues';
import ReportIssue from './pages/ReportIssue';
import AdminDashboard from './pages/AdminDashboard';

function HomeRoute() {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/issues'} replace />;
  }
  return <Home />;
}

function PrivateRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/issues" replace />;
  return children;
}

function PublicRoute({ children }) {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/issues'} replace />;
  }
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomeRoute />} />

        <Route path="/login" element={
          <PublicRoute><Login /></PublicRoute>
        } />

        <Route path="/register" element={
          <PublicRoute><Register /></PublicRoute>
        } />

        <Route path="/issues" element={
          <PrivateRoute><MyIssues /></PrivateRoute>
        } />

        <Route path="/report" element={
          <PrivateRoute><ReportIssue /></PrivateRoute>
        } />

        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;