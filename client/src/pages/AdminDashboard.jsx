import { useEffect, useState } from 'react';
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

export default function AdminDashboard() {
  const [issues, setIssues]     = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filter, setFilter]     = useState('All');
  const [notes, setNotes]       = useState({});

  useEffect(() => {
    API.get('/issues').then(r => {
      setIssues(r.data);
      setFiltered(r.data);
    });
  }, []);

  useEffect(() => {
    if (filter === 'All') setFiltered(issues);
    else setFiltered(issues.filter(i => i.status === filter));
  }, [filter, issues]);

  const updateStatus = async (id, status) => {
    const { data } = await API.patch(`/issues/${id}/status`, {
      status,
      adminNote: notes[id] || ''
    });
    setIssues(issues.map(i => i._id === id ? data : i));
  };

  const deleteIssue = async (id) => {
    if (!window.confirm('Delete this issue?')) return;
    await API.delete(`/issues/${id}`);
    setIssues(issues.filter(i => i._id !== id));
  };

  const verifyIssue = async (id) => {
    const note = prompt('Add verification note (optional):') || 'Verified by authority';
    const { data } = await API.patch(`/issues/${id}/verify`, { verificationNote: note });
    setIssues(issues.map(i => i._id === id ? data : i));
  };

  const flagIssue = async (id) => {
    const reason = prompt('Why are you flagging this? (fake/duplicate/spam):');
    if (!reason) return;
    const { data } = await API.patch(`/issues/${id}/flag`, { flagReason: reason });
    setIssues(issues.map(i => i._id === id ? data : i));
  };

  const counts = {
    total:      issues.length,
    pending:    issues.filter(i => i.status === 'Pending').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved:   issues.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <div className="page-title">Admin dashboard</div>
          <div className="page-sub">Manage all citizen-reported issues</div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
        <div className="stat-card" onClick={() => setFilter('All')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Total</div>
          <div className="stat-value stat-blue">{counts.total}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('Pending')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: '#791F1F' }}>{counts.pending}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('In Progress')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">In Progress</div>
          <div className="stat-value stat-amber">{counts.inProgress}</div>
        </div>
        <div className="stat-card" onClick={() => setFilter('Resolved')} style={{ cursor: 'pointer' }}>
          <div className="stat-label">Resolved</div>
          <div className="stat-value stat-green">{counts.resolved}</div>
        </div>
      </div>

      {/* Filter buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', 'Pending', 'In Progress', 'Resolved'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{
              padding: '6px 16px', borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: 'pointer', border: '1px solid #e0e7ef',
              background: filter === s ? '#1a3c6e' : '#fff',
              color: filter === s ? '#fff' : '#374151'
            }}>
            {s}
          </button>
        ))}
      </div>

      {/* Issue list */}
      {filtered.map(issue => (
        <div className="issue-card" key={issue._id}>

          {/* Title row */}
          <div className="issue-top">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22 }}>{categoryIcon[issue.category]}</span>
              <div>
                <div className="issue-title">{issue.title}</div>
                <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                  By {issue.reportedBy?.name} &nbsp;·&nbsp; {issue.reportedBy?.email}
                  {/* Credibility score */}
                  {issue.reportedBy?.credibilityScore !== undefined && (
                    <span style={{
                      marginLeft: 8, padding: '1px 8px', borderRadius: 10,
                      fontSize: 11, fontWeight: 700,
                      background: issue.reportedBy.credibilityScore > 70 ? '#D1FAE5'
                                : issue.reportedBy.credibilityScore > 40 ? '#FEF3C7'
                                : '#FCEBEB',
                      color:      issue.reportedBy.credibilityScore > 70 ? '#065F46'
                                : issue.reportedBy.credibilityScore > 40 ? '#92400E'
                                : '#791F1F',
                    }}>
                      Trust: {issue.reportedBy.credibilityScore}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            <span style={{
              background: statusColor[issue.status]?.bg,
              color:      statusColor[issue.status]?.color,
              padding: '3px 12px', borderRadius: 20,
              fontSize: 11, fontWeight: 700
            }}>
              {issue.status}
            </span>
          </div>

          {/* Badges */}
          <div className="issue-meta">
            <span className="badge badge-cat">{issue.category}</span>
            <span style={{ fontSize: 11, color: '#6b7280' }}>🏢 {issue.department}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>
              Ref# CIR-{issue._id.slice(-6).toUpperCase()}
            </span>
          </div>

          {/* Description */}
          <div className="issue-desc">{issue.description}</div>

          {/* Location + date */}
          <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 12 }}>
            📍 {issue.location} &nbsp;·&nbsp;
            {new Date(issue.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric'
            })}
          </div>

          {/* Image + verification section */}
          {issue.imageUrl && (
            <div style={{ marginBottom: 12 }}>
              <img
                src={issue.imageUrl}
                alt="issue"
                style={{ width: '100%', maxWidth: 320, borderRadius: 8, marginBottom: 10 }}
              />

              {/* Upload metadata panel */}
              <div style={{
                background: '#f9fafb', border: '1px solid #e0e7ef',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 12, color: '#6b7280', marginBottom: 10
              }}>
                <div style={{ fontWeight: 700, color: '#374151', marginBottom: 6 }}>
                  📋 Upload details
                </div>
                <div>
                  📅 Uploaded: {issue.uploadedAt
                    ? new Date(issue.uploadedAt).toLocaleString('en-IN')
                    : new Date(issue.createdAt).toLocaleString('en-IN')}
                </div>
                <div>📍 Location: {issue.location}</div>

                {/* GPS link — only show if lat/lng exist */}
                {issue.lat && issue.lng ? (
                  <div>
                    🗺️ GPS: {Number(issue.lat).toFixed(4)}, {Number(issue.lng).toFixed(4)}
                    &nbsp;
                    <a
                      href={`https://www.google.com/maps?q=${issue.lat},${issue.lng}`}
                      target="_blank"
                      rel="noreferrer"
                      style={{ color: '#185FA5', fontWeight: 600 }}
                    >
                      View on Google Maps →
                    </a>
                  </div>
                ) : (
                  <div style={{ color: '#F59E0B' }}>
                    ⚠️ No GPS data — citizen did not share location
                  </div>
                )}

                <div>
                  👤 Reported by: {issue.reportedBy?.name} ({issue.reportedBy?.email})
                </div>
                <div>
                  📱 Device: {issue.uploadDevice?.toLowerCase().includes('mobile')
                    ? 'Mobile' : 'Desktop'}
                </div>
              </div>

              {/* Verification status */}
              {issue.verified && (
                <div style={{
                  background: '#D1FAE5', color: '#065F46',
                  padding: '6px 12px', borderRadius: 6,
                  fontSize: 12, fontWeight: 600, marginBottom: 8
                }}>
                  ✅ Verified — {issue.verificationNote}
                </div>
              )}
              {issue.flagged && (
                <div style={{
                  background: '#FCEBEB', color: '#791F1F',
                  padding: '6px 12px', borderRadius: 6,
                  fontSize: 12, fontWeight: 600, marginBottom: 8
                }}>
                  🚩 Flagged — {issue.flagReason}
                </div>
              )}

              {/* Verify / Flag buttons — only show if not yet actioned */}
              {!issue.verified && !issue.flagged && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => verifyIssue(issue._id)}
                    style={{
                      padding: '5px 14px', background: '#D1FAE5', color: '#065F46',
                      border: '1px solid #6EE7B7', borderRadius: 6,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}>
                    ✅ Verify image
                  </button>
                  <button
                    onClick={() => flagIssue(issue._id)}
                    style={{
                      padding: '5px 14px', background: '#FCEBEB', color: '#791F1F',
                      border: '1px solid #F09595', borderRadius: 6,
                      fontSize: 12, fontWeight: 600, cursor: 'pointer'
                    }}>
                    🚩 Flag as fake
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Admin note */}
          <div style={{ marginBottom: 12 }}>
            <input
              type="text"
              placeholder="Add a note for the citizen (optional)..."
              value={notes[issue._id] !== undefined ? notes[issue._id] : (issue.adminNote || '')}
              onChange={e => setNotes({ ...notes, [issue._id]: e.target.value })}
              style={{
                width: '100%', padding: '8px 12px',
                border: '1px solid #e0e7ef', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', outline: 'none'
              }}
            />
          </div>

          {/* Status + Delete */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select
              value={issue.status}
              onChange={e => updateStatus(issue._id, e.target.value)}
              style={{
                padding: '7px 12px', border: '1px solid #e0e7ef',
                borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
                background: '#f9fafb', cursor: 'pointer', outline: 'none'
              }}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Resolved</option>
            </select>
            <button className="btn-danger" onClick={() => deleteIssue(issue._id)}>
              Delete
            </button>
          </div>

        </div>
      ))}

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>📋</div>
          No issues found for this filter.
        </div>
      )}
    </div>
  );
}