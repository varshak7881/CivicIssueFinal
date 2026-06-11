import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const statusColor = {
  'Pending':     { bg: '#FCEBEB', color: '#791F1F' },
  'In Progress': { bg: '#FEF3C7', color: '#92400E' },
  'Resolved':    { bg: '#D1FAE5', color: '#065F46' },
};

const categoryIcon = {
  Road: '🛣️', Water: '💧', Electricity: '💡',
  Sanitation: '🌿', Disaster: '⚠️', Other: '📋'
};

export default function MyIssues() {
  const [issues, setIssues] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/issues').then(r => setIssues(r.data));
  }, []);

  const deleteIssue = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    await API.delete(`/issues/${id}`);
    setIssues(issues.filter(i => i._id !== id));
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <div className="page-title">My reported issues</div>
          <div className="page-sub">{issues.length} issue{issues.length !== 1 ? 's' : ''} submitted</div>
        </div>
        <button className="btn-blue" onClick={() => navigate('/report')}>
          + Report new issue
        </button>
      </div>

      {issues.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>No issues reported yet</div>
          <div style={{ fontSize: 13 }}>Click "Report new issue" to get started</div>
        </div>
      )}

      {issues.map(issue => (
        <div className="issue-card" key={issue._id}>
          <div className="issue-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 24 }}>{categoryIcon[issue.category] || '📋'}</span>
              <div className="issue-title">{issue.title}</div>
            </div>
            <span style={{
              ...statusColor[issue.status],
              padding: '3px 12px', borderRadius: 20,
              fontSize: 11, fontWeight: 700
            }}>
              {issue.status}
            </span>
          </div>

          <div className="issue-meta">
            <span className="badge badge-cat">{issue.category}</span>
            {issue.department && (
              <span style={{ fontSize: 11, color: '#6b7280' }}>
                🏢 {issue.department}
              </span>
            )}
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              Ref# CIR-{issue._id.slice(-6).toUpperCase()}
            </span>
          </div>

          <div className="issue-desc">{issue.description}</div>

          {/* Admin note — only show if exists */}
          {issue.adminNote && (
            <div style={{
              background: '#EBF3FB', border: '1px solid #B5D4F4',
              borderRadius: 8, padding: '10px 14px',
              fontSize: 13, color: '#0C447C', marginBottom: 12
            }}>
              <strong>Authority update:</strong> {issue.adminNote}
            </div>
          )}

          {issue.imageUrl && (
  <div style={{ marginBottom: 12 }}>
    <img src={issue.imageUrl} alt="issue"
      style={{ width: '100%', maxWidth: 300, borderRadius: 8, marginBottom: 6 }} />
    {issue.verified && (
      <div style={{ fontSize: 12, color: '#065F46', fontWeight: 600 }}>
        ✅ Image verified by authority
      </div>
    )}
    {issue.flagged && (
      <div style={{ fontSize: 12, color: '#791F1F', fontWeight: 600 }}>
        🚩 This report has been flagged: {issue.flagReason}
      </div>
    )}
  </div>
)}

          <div className="issue-footer">
            <span className="issue-loc">
              📍 {issue.location} &nbsp;·&nbsp;
              {new Date(issue.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric', month: 'short', year: 'numeric'
              })}
            </span>
            {issue.status !== 'Resolved' && (
              <button className="btn-danger" onClick={() => deleteIssue(issue._id)}>
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}