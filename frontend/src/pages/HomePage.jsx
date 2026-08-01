import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { getAllHospitals } from '../services/api';
import MapView from '../components/MapView';
import { Link } from 'react-router-dom';
import './HomePage.css';

export default function HomePage() {
  const { user, profile, role } = useAuth();
  const [hospitals, setHospitals] = useState([]);

  useEffect(() => {
    getAllHospitals()
      .then((res) => setHospitals(res.data.hospitals))
      .catch(() => {});
  }, []);

  const userLocation = profile
    ? { lat: profile.latitude, lng: profile.longitude }
    : null;

  return (
    <div className="home-container">
      <div className="home-hero">
        <h1>
          {profile ? `Welcome, ${profile.name}!` : 'Welcome to RedPint'}
        </h1>
        <p className="home-subtitle">
          Connecting blood donors with hospitals in need — saving lives, one pint at a time.
        </p>
      </div>

      <div className="home-map-section">
        <h2>🏥 Hospitals Near You</h2>
        <MapView
          center={userLocation ? [userLocation.lat, userLocation.lng] : [19.076, 72.8777]}
          zoom={12}
          hospitals={hospitals}
          userLocation={userLocation}
        />
      </div>

      <div className="home-actions">
        {!user ? (
          <>
            <Link to="/signup" className="action-card">
              <span className="action-icon">🩸</span>
              <h3>Become a Donor</h3>
              <p>Register and save lives</p>
            </Link>
            <Link to="/signup" className="action-card">
              <span className="action-icon">🏥</span>
              <h3>Register Hospital</h3>
              <p>Post blood requests</p>
            </Link>
          </>
        ) : role === 'donor' ? (
          <>
            <Link to="/donor/dashboard" className="action-card">
              <span className="action-icon">📋</span>
              <h3>My Dashboard</h3>
              <p>View matches & profile</p>
            </Link>
            <Link to="/notifications" className="action-card">
              <span className="action-icon">🔔</span>
              <h3>Notifications</h3>
              <p>Check blood requests</p>
            </Link>
          </>
        ) : (
          <>
            <Link to="/hospital/dashboard" className="action-card">
              <span className="action-icon">📋</span>
              <h3>Hospital Dashboard</h3>
              <p>Manage requests & stock</p>
            </Link>
            <Link to="/notifications" className="action-card">
              <span className="action-icon">🔔</span>
              <h3>Notifications</h3>
              <p>View updates</p>
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
