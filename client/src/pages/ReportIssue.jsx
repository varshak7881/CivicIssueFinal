import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const categories = ['Road', 'Water', 'Electricity', 'Sanitation', 'Disaster', 'Other'];

export default function ReportIssue() {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'Road',
    location: '',
    lat: '',
    lng: ''
  });
  const [image, setImage]     = useState(null);
  const [msg, setMsg]         = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [gpsStatus, setGpsStatus] = useState('');
  const navigate = useNavigate();

  // Auto-capture GPS when page loads
  useEffect(() => {
    if (navigator.geolocation) {
      setGpsStatus('Capturing your location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setForm(f => ({
            ...f,
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          }));
          setGpsStatus('captured');
        },
        () => {
          setGpsStatus('unavailable');
        }
      );
    } else {
      setGpsStatus('unavailable');
    }
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMsg('');

    if (!form.title || !form.description || !form.location) {
      setError('Please fill in all required fields');
      return;
    }

    const data = new FormData();
    data.append('title',       form.title);
    data.append('description', form.description);
    data.append('category',    form.category);
    data.append('location',    form.location);

    // Send GPS if captured
    if (form.lat) data.append('lat', form.lat);
    if (form.lng) data.append('lng', form.lng);

    if (image) data.append('image', image);

    try {
      setLoading(true);
      await API.post('/issues', data);
      setMsg('Issue reported successfully! Redirecting...');
      setTimeout(() => navigate('/issues'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content">
      <div className="page-header">
        <div>
          <div className="page-title">Report a civic issue</div>
          <div className="page-sub">
            All fields are required. Your report will be sent to the relevant authority.
          </div>
        </div>
      </div>

      <div className="form-card">
        {error && <div className="error-msg">{error}</div>}
        {msg   && <div className="success-msg">{msg}</div>}

        <form onSubmit={submit}>

          {/* Category selector */}
          <div className="field">
            <label>Category</label>
            <div className="cat-grid">
              {categories.map(cat => (
                <div
                  key={cat}
                  className={`cat-opt ${form.category === cat ? 'selected' : ''}`}
                  onClick={() => setForm({ ...form, category: cat })}
                >
                  <span className="cat-icon">
                    {cat === 'Road'        && '🛣️'}
                    {cat === 'Water'       && '💧'}
                    {cat === 'Electricity' && '💡'}
                    {cat === 'Sanitation'  && '🌿'}
                    {cat === 'Disaster'    && '⚠️'}
                    {cat === 'Other'       && '📋'}
                  </span>
                  <span className="cat-name">{cat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Title */}
          <div className="field">
            <label>Issue title</label>
            <input
              type="text"
              placeholder="e.g. Large pothole near bus stop on MG Road"
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          {/* Description */}
          <div className="field">
            <label>Description</label>
            <textarea
              placeholder="Describe the issue — what you saw, how long it has been there, how it affects people..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          {/* Location + GPS */}
          <div className="field">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g. MG Road, near bus stand, Mysuru"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />

            {/* GPS status shown below location input */}
            <div style={{ fontSize: 12, marginTop: 6 }}>
              {gpsStatus === 'captured' && (
                <span style={{ color: '#065F46', fontWeight: 600 }}>
                  ✅ GPS captured: {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}
                  &nbsp;— your location will be verified by the authority
                </span>
              )}
              {gpsStatus === 'Capturing your location...' && (
                <span style={{ color: '#92400E' }}>
                  ⏳ Capturing your GPS location...
                </span>
              )}
              {gpsStatus === 'unavailable' && (
                <span style={{ color: '#9ca3af' }}>
                  ⚠️ GPS not available — please type your location accurately above
                </span>
              )}
            </div>
          </div>

          {/* Image upload */}
          <div className="field">
            <label>Photo (optional)</label>
            <div
              className="upload-box"
              onClick={() => document.getElementById('imgInput').click()}
            >
              {image ? (
                <>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                  <div className="upload-text">{image.name}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    Click to change photo
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
                  <div className="upload-text">Click to upload a photo of the issue</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 4 }}>
                    JPG, PNG up to 5MB — clear photos help authorities respond faster
                  </div>
                </>
              )}
            </div>
            {/* On mobile this opens camera directly, not gallery */}
           <input
          id="imgInput"
          type="file"
          accept="image/*"
          capture="environment"   // ← this forces rear camera on mobile
          style={{ display: 'none' }}
          onChange={e => setImage(e.target.files[0])}
        />
          </div>

          {/* Submit buttons */}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <button
              type="submit"
              className="btn-blue"
              style={{ flex: 1, justifyContent: 'center', padding: 12 }}
              disabled={loading}
            >
              {loading ? 'Submitting...' : '📤 Submit Issue Report'}
            </button>
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/issues')}
            >
              Cancel
            </button>
          </div>

          <div style={{ marginTop: 10, fontSize: 11, color: '#9ca3af', lineHeight: 1.6 }}>
            ℹ️ By submitting, you confirm this is a genuine civic issue.
            False reports may result in account suspension.
          </div>

        </form>
      </div>
    </div>
  );
}