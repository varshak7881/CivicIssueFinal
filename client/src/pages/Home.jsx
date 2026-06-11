import { useNavigate } from 'react-router-dom';

const categories = [
  { icon: '🛣️', name: 'Road & Infrastructure', desc: 'Potholes, broken roads, damaged bridges' },
  { icon: '💧', name: 'Water Supply',           desc: 'Pipe leaks, no supply, contamination' },
  { icon: '💡', name: 'Electricity',            desc: 'Power cuts, broken street lights' },
  { icon: '🌿', name: 'Sanitation',             desc: 'Garbage, sewage, drainage issues' },
  { icon: '⚠️', name: 'Disaster Alert',         desc: 'Floods, landslides, fire incidents' },
  { icon: '📋', name: 'Other Issues',           desc: 'Any other civic complaint' },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <>
      {/* Hero — NO <Navbar /> here */}
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Civic Portal</div>
          <h1 className="hero-title">Report Civic Issues &<br />Disaster Incidents</h1>
          <p className="hero-sub">
            Empowering citizens to report local issues — road damage, water supply
            problems, power outages, sanitation failures, and disaster alerts —
            directly to authorities.
          </p>
          <div className="hero-btns">
            <button className="btn-gold" onClick={() => navigate('/register')}>Get Started</button>
            <button className="btn-ghost" onClick={() => navigate('/login')}>Track My Report</button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-strip">
        <div className="stat-item"><div className="stat-n">12,480</div><div className="stat-l">Issues reported</div></div>
        <div className="stat-item"><div className="stat-n">9,312</div><div className="stat-l">Resolved</div></div>
        <div className="stat-item"><div className="stat-n">1,840</div><div className="stat-l">In progress</div></div>
        <div className="stat-item"><div className="stat-n">48 hrs</div><div className="stat-l">Avg resolution</div></div>
      </div>

      {/* Categories */}
      <div className="home-section">
        <div className="home-section-title">Report by category</div>
        <div className="home-section-bar"></div>
        <div className="services-grid">
          {categories.map(c => (
            <div className="service-card" key={c.name} onClick={() => navigate('/report')}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>{c.icon}</div>
              <div className="service-name">{c.name}</div>
              <div className="service-desc">{c.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it works */}
      <div className="steps-section">
        <div className="home-section-title">How it works</div>
        <div className="home-section-bar"></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div className="step-circle-blue">1</div>
            <div style={{ fontWeight: 700, color: '#1a3c6e', marginBottom: 6 }}>Register & Login</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Create your account with your email or mobile number</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div className="step-circle-gold">2</div>
            <div style={{ fontWeight: 700, color: '#1a3c6e', marginBottom: 6 }}>Submit your issue</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Add a photo, location, and description of the problem</div>
          </div>
          <div style={{ textAlign: 'center', padding: 16 }}>
            <div className="step-circle-green">3</div>
            <div style={{ fontWeight: 700, color: '#1a3c6e', marginBottom: 6 }}>Track resolution</div>
            <div style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6 }}>Get status updates until the issue is fully resolved</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="gov-footer">
        <strong>Civic Issue Reporter</strong><br />
        Empowering citizens · Improving governance<br />
        <a href="#">Privacy Policy</a> &nbsp;|&nbsp;
        <a href="#">Terms of Use</a> &nbsp;|&nbsp;
        <a href="#">Contact Us</a>
      </div>
    </>
  );
}