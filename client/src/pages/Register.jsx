import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../api';

export default function Register() {
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'citizen', adminCode: ''
  });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setLoading(true);
      const { data } = await API.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate(data.user.role === 'admin' ? '/admin' : '/issues');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-emblem">🏛️</div>
          <div className="auth-portal-name">Civic Issue Reporter</div>
          <div className="auth-title">Create account</div>
          <div className="auth-sub">Join to report issues in your area</div>
        </div>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={submit}>
          <div className="field">
            <label>Full name</label>
            <input type="text" placeholder="e.g. Ravi Kumar"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="field">
            <label>Email address</label>
            <input type="email" placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" placeholder="Minimum 6 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} />
          </div>

          <div className="field">
            <label>Account type</label>
            <select value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value, adminCode: '' })}>
              <option value="citizen">Citizen</option>
              <option value="admin">Admin / Authority</option>
            </select>
          </div>

          {/* Only show this field if Admin is selected */}
          {form.role === 'admin' && (
            <div className="field">
              <label>Admin secret code</label>
              <input type="password" placeholder="Enter the admin authorization code"
                value={form.adminCode}
                onChange={e => setForm({ ...form, adminCode: e.target.value })} />
              <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                This code is only given to authorized government personnel
              </div>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <div className="auth-link" style={{ marginTop: 16 }}>
          Already registered? <Link to="/login">Sign in here</Link>
        </div>
      </div>
    </div>
  );
}