import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="nav-brand">
        <span style={{ fontSize: 22 }}>🏛️</span>
        Civic Issue Reporter
      </Link>

      {user ? (
        <>
          {user.role === 'citizen' && (
            <>
              <Link to="/issues" className="nav-link">My Issues</Link>
              <Link to="/report" className="nav-link">Report Issue</Link>
            </>
          )}
          {user.role === 'admin' && (
            <Link to="/admin" className="nav-link">Dashboard</Link>
          )}
          <div className="nav-user">
            <div className="avatar">
              {user.name.slice(0, 2).toUpperCase()}
            </div>
            {user.name}
          </div>
          <button onClick={logout} className="btn-outline"
            style={{ fontSize: 12, padding: '6px 14px' }}>
            Logout
          </button>
        </>
      ) : (
        <>
          <Link to="/login"    className="nav-link">Login</Link>
          <Link to="/register" className="nav-link">Register</Link>
        </>
      )}
    </nav>
  );
}