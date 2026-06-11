import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Login() {
  const [form, setForm]   = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await API.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.role === 'admin' ? '/admin' : '/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
  <div className="auth-wrap">   {/* ← this centers the card */}
    <div className="auth-card">
      <div className="auth-header">
        <div className="auth-emblem">🏛️</div>
        <div className="auth-portal-name">Civic Issue Reporter</div>
        <div className="auth-title">Welcome back</div>
        <div className="auth-sub">Sign in to your account to continue</div>
      </div>

      {error && <div className="error-msg">{error}</div>}

      <form onSubmit={submit}>
        <div className="field">
          <label>Email address</label>
          <input type="email" placeholder="you@example.com"
            value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" placeholder="Enter your password"
            value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
        </div>
        <button type="submit" className="btn-primary">Sign in</button>
      </form>

      <div className="auth-link" style={{ marginTop: 16 }}>
        No account? <Link to="/register">Register here</Link>
        &nbsp;·&nbsp; <Link to="/">Back to home</Link>
      </div>
    </div>
  </div>
);
}