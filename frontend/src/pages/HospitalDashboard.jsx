import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import {
  createBloodRequest,
  getMyRequests,
  getHospitalStock,
  getDrives,
  createDrive,
} from '../services/api';
import MapView from '../components/MapView';
import { BLOOD_GROUPS, formatDate } from '../utils/helpers';
import './Dashboard.css';

export default function HospitalDashboard() {
  const { profile } = useAuth();
  const [requests, setRequests] = useState([]);
  const [stock, setStock] = useState([]);
  const [drives, setDrives] = useState([]);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showDriveModal, setShowDriveModal] = useState(false);

  // Blood request form
  const [reqBloodGroup, setReqBloodGroup] = useState('O+');
  const [reqUnits, setReqUnits] = useState(1);
  const [reqUrgency, setReqUrgency] = useState('normal');
  const [reqLoading, setReqLoading] = useState(false);
  const [reqMessage, setReqMessage] = useState('');

  // Drive form
  const [driveLocation, setDriveLocation] = useState('');
  const [driveLat, setDriveLat] = useState('');
  const [driveLng, setDriveLng] = useState('');
  const [driveDate, setDriveDate] = useState('');
  const [driveDesc, setDriveDesc] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [reqRes, stockRes, driveRes] = await Promise.all([
        getMyRequests(),
        getHospitalStock(),
        getDrives(),
      ]);
      setRequests(reqRes.data.requests);
      setStock(stockRes.data.stock);
      setDrives(driveRes.data.drives);
    } catch (err) {
      console.error('Error loading data:', err);
    }
  };

  const handleCreateRequest = async (e) => {
    e.preventDefault();
    setReqLoading(true);
    setReqMessage('');
    try {
      const res = await createBloodRequest({
        bloodGroupNeeded: reqBloodGroup,
        unitsRequired: reqUnits,
        urgencyLevel: reqUrgency,
      });
      setReqMessage(`✅ ${res.data.message}`);
      setShowRequestModal(false);
      loadData();
    } catch (err) {
      setReqMessage(err.response?.data?.message || 'Error creating request');
    } finally {
      setReqLoading(false);
    }
  };

  const handleCreateDrive = async (e) => {
    e.preventDefault();
    try {
      await createDrive({
        location: driveLocation,
        latitude: driveLat,
        longitude: driveLng,
        date: driveDate,
        description: driveDesc,
      });
      setShowDriveModal(false);
      setDriveLocation('');
      setDriveLat('');
      setDriveLng('');
      setDriveDate('');
      setDriveDesc('');
      loadData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating drive');
    }
  };

  return (
    <div className="dashboard-container">
      <h1>🏥 Hospital Dashboard</h1>

      {/* REQUEST BLOOD BUTTON */}
      <button
        className="btn-request-blood"
        onClick={() => setShowRequestModal(true)}
      >
        🩸 Request Blood
      </button>

      {reqMessage && <div className="status-message">{reqMessage}</div>}

      {/* My Requests */}
      <div className="card">
        <h2>My Blood Requests</h2>
        {requests.length === 0 ? (
          <p className="empty-state">No requests yet.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Urgency</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r._id}>
                  <td><span className="badge badge-blood">{r.bloodGroupNeeded}</span></td>
                  <td>{r.unitsRequired}</td>
                  <td><span className={`badge badge-${r.urgencyLevel}`}>{r.urgencyLevel}</span></td>
                  <td><span className={`badge badge-status-${r.status}`}>{r.status}</span></td>
                  <td>{formatDate(r.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Hospital Stock */}
      <div className="card">
        <h2>Hospital Blood Stock</h2>
        {stock.length === 0 ? (
          <p className="empty-state">No stock data available.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Blood Group</th>
                <th>Units Available</th>
                <th>Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {stock.map((s) => (
                <tr key={s._id}>
                  <td>{s.hospitalId?.name || 'N/A'}</td>
                  <td><span className="badge badge-blood">{s.bloodGroup}</span></td>
                  <td>{s.unitsAvailable}</td>
                  <td>{formatDate(s.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Blood Drives */}
      <div className="card">
        <div className="card-header">
          <h2>Blood Drives</h2>
          <button className="btn-secondary" onClick={() => setShowDriveModal(true)}>
            + Create Drive
          </button>
        </div>
        {drives.length === 0 ? (
          <p className="empty-state">No upcoming drives.</p>
        ) : (
          <>
            <div className="drives-list">
              {drives.map((d) => (
                <div key={d._id} className="drive-card">
                  <strong>{d.location}</strong>
                  <span>{formatDate(d.date)}</span>
                  <span className="drive-hospital">by {d.hospitalId?.name}</span>
                  {d.description && <p>{d.description}</p>}
                </div>
              ))}
            </div>
            <div style={{ marginTop: '1rem' }}>
              <MapView
                center={[profile?.latitude || 19.076, profile?.longitude || 72.8777]}
                zoom={11}
                hospitals={drives.map((d) => ({
                  _id: d._id,
                  name: `📌 ${d.location}`,
                  latitude: d.latitude,
                  longitude: d.longitude,
                  address: formatDate(d.date),
                  contactNumber: d.hospitalId?.contactNumber || '',
                }))}
              />
            </div>
          </>
        )}
      </div>

      {/* Request Blood Modal */}
      {showRequestModal && (
        <div className="modal-overlay" onClick={() => setShowRequestModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>🩸 Request Blood</h2>
            <form onSubmit={handleCreateRequest}>
              <div className="form-group">
                <label>Blood Group Needed</label>
                <select value={reqBloodGroup} onChange={(e) => setReqBloodGroup(e.target.value)}>
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Units Required</label>
                <input
                  type="number"
                  min="1"
                  value={reqUnits}
                  onChange={(e) => setReqUnits(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Urgency Level</label>
                <select value={reqUrgency} onChange={(e) => setReqUrgency(e.target.value)}>
                  <option value="normal">Normal</option>
                  <option value="urgent">Urgent</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary" disabled={reqLoading}>
                  {reqLoading ? 'Sending...' : 'Send Request'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setShowRequestModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Drive Modal */}
      {showDriveModal && (
        <div className="modal-overlay" onClick={() => setShowDriveModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>📌 Create Blood Drive</h2>
            <form onSubmit={handleCreateDrive}>
              <div className="form-group">
                <label>Location Name</label>
                <input
                  type="text"
                  value={driveLocation}
                  onChange={(e) => setDriveLocation(e.target.value)}
                  required
                  placeholder="e.g. Community Hall, Bandra"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={driveLat}
                    onChange={(e) => setDriveLat(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={driveLng}
                    onChange={(e) => setDriveLng(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={driveDate}
                  onChange={(e) => setDriveDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description (optional)</label>
                <textarea
                  value={driveDesc}
                  onChange={(e) => setDriveDesc(e.target.value)}
                  rows="3"
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="btn-primary">Create Drive</button>
                <button type="button" className="btn-secondary" onClick={() => setShowDriveModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
