import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '../services/firebase';
import { registerDonor, registerHospital, verifyUser } from '../services/api';
import VerificationPending from '../components/VerificationPending';
import { BLOOD_GROUPS } from '../utils/helpers';
import './Auth.css';

export default function SignupPage() {
  const [tab, setTab] = useState('donor'); // 'donor' or 'hospital'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const navigate = useNavigate();

  // Shared fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Donor fields
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [donorLat, setDonorLat] = useState('');
  const [donorLng, setDonorLng] = useState('');
  const [donorDoc, setDonorDoc] = useState(null);

  // Hospital fields
  const [hospitalName, setHospitalName] = useState('');
  const [hospitalAddress, setHospitalAddress] = useState('');
  const [hospitalPhone, setHospitalPhone] = useState('');
  const [hospitalLat, setHospitalLat] = useState('');
  const [hospitalLng, setHospitalLng] = useState('');
  const [hospitalDoc, setHospitalDoc] = useState(null);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (tab === 'donor') {
          setDonorLat(pos.coords.latitude.toFixed(6));
          setDonorLng(pos.coords.longitude.toFixed(6));
        } else {
          setHospitalLat(pos.coords.latitude.toFixed(6));
          setHospitalLng(pos.coords.longitude.toFixed(6));
        }
      },
      () => setError('Unable to get your location')
    );
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Create Firebase user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Send email verification
      await sendEmailVerification(userCred.user);

      // 3. Register in our backend
      const formData = new FormData();

      if (tab === 'donor') {
        formData.append('name', donorName);
        formData.append('phone', donorPhone);
        formData.append('bloodGroup', bloodGroup);
        formData.append('latitude', donorLat);
        formData.append('longitude', donorLng);
        if (donorDoc) formData.append('document', donorDoc);
        await registerDonor(formData);
      } else {
        formData.append('name', hospitalName);
        formData.append('address', hospitalAddress);
        formData.append('contactNumber', hospitalPhone);
        formData.append('latitude', hospitalLat);
        formData.append('longitude', hospitalLng);
        if (hospitalDoc) formData.append('license', hospitalDoc);
        await registerHospital(formData);
      }

      // 4. Show verification modal
      setShowVerification(true);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationDone = async () => {
    try {
      await verifyUser();
    } catch {
      // May fail if not actually verified yet — that's okay
    }
    setShowVerification(false);
    navigate('/');
  };

  return (
    <div className="auth-container">
      <div className="auth-card auth-card-wide">
        <h1 className="auth-title">
          <span className="auth-icon">🩸</span> Join RedPint
        </h1>

        <div className="auth-tabs">
          <button
            className={`tab ${tab === 'donor' ? 'active' : ''}`}
            onClick={() => setTab('donor')}
          >
            I'm a Donor
          </button>
          <button
            className={`tab ${tab === 'hospital' ? 'active' : ''}`}
            onClick={() => setTab('hospital')}
          >
            I'm a Hospital
          </button>
        </div>

        {error && <div className="auth-error">{error}</div>}

        <form onSubmit={handleSignup}>
          {/* Shared email/password */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="signup-email">Email</label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
          </div>

          {tab === 'donor' ? (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="donor-name">Full Name</label>
                  <input
                    id="donor-name"
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="donor-phone">Phone</label>
                  <input
                    id="donor-phone"
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    required
                    placeholder="+91XXXXXXXXXX"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="donor-blood">Blood Group</label>
                  <select
                    id="donor-blood"
                    value={bloodGroup}
                    onChange={(e) => setBloodGroup(e.target.value)}
                  >
                    {BLOOD_GROUPS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Location</label>
                  <div className="location-row">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={donorLat}
                      onChange={(e) => setDonorLat(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={donorLng}
                      onChange={(e) => setDonorLng(e.target.value)}
                      required
                    />
                    <button type="button" className="btn-secondary btn-sm" onClick={handleGetLocation}>
                      📍
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="donor-doc">ID / Donation Proof (optional)</label>
                <input
                  id="donor-doc"
                  type="file"
                  onChange={(e) => setDonorDoc(e.target.files[0])}
                  accept="image/*,.pdf"
                />
              </div>
            </>
          ) : (
            <>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="hospital-name">Hospital Name</label>
                  <input
                    id="hospital-name"
                    type="text"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="hospital-phone">Contact Number</label>
                  <input
                    id="hospital-phone"
                    type="tel"
                    value={hospitalPhone}
                    onChange={(e) => setHospitalPhone(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hospital-address">Address</label>
                <input
                  id="hospital-address"
                  type="text"
                  value={hospitalAddress}
                  onChange={(e) => setHospitalAddress(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <div className="location-row">
                    <input
                      type="number"
                      step="any"
                      placeholder="Latitude"
                      value={hospitalLat}
                      onChange={(e) => setHospitalLat(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      step="any"
                      placeholder="Longitude"
                      value={hospitalLng}
                      onChange={(e) => setHospitalLng(e.target.value)}
                      required
                    />
                    <button type="button" className="btn-secondary btn-sm" onClick={handleGetLocation}>
                      📍
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="hospital-doc">License Document (optional)</label>
                <input
                  id="hospital-doc"
                  type="file"
                  onChange={(e) => setHospitalDoc(e.target.files[0])}
                  accept="image/*,.pdf"
                />
              </div>
            </>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="auth-link">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>

      {showVerification && <VerificationPending onClose={handleVerificationDone} />}
    </div>
  );
}
