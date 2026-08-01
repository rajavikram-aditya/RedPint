import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import { getDonorMatches, respondToMatch } from '../services/api';
import { isDonorEligible, daysUntilEligible, formatDate } from '../utils/helpers';
import './Dashboard.css';

export default function DonorDashboard() {
  const { profile } = useAuth();
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      const res = await getDonorMatches();
      setMatches(res.data.matches);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (matchId, status) => {
    try {
      await respondToMatch(matchId, status);
      loadMatches(); // refresh
    } catch (err) {
      alert(err.response?.data?.message || 'Error responding to match');
    }
  };

  const eligible = isDonorEligible(profile?.lastDonationDate);
  const daysLeft = daysUntilEligible(profile?.lastDonationDate);

  return (
    <div className="dashboard-container">
      <h1>🩸 Donor Dashboard</h1>

      {/* Profile Card */}
      <div className="card">
        <h2>My Profile</h2>
        <div className="profile-grid">
          <div><strong>Name:</strong> {profile?.name}</div>
          <div><strong>Email:</strong> {profile?.email}</div>
          <div><strong>Phone:</strong> {profile?.phone}</div>
          <div><strong>Blood Group:</strong> <span className="badge badge-blood">{profile?.bloodGroup}</span></div>
          <div>
            <strong>Last Donation:</strong> {formatDate(profile?.lastDonationDate)}
          </div>
          <div>
            <strong>Eligibility:</strong>{' '}
            {eligible ? (
              <span className="badge badge-eligible">✅ Eligible</span>
            ) : (
              <span className="badge badge-cooldown">⏳ {daysLeft} days left</span>
            )}
          </div>
        </div>
      </div>

      {/* Active Matches */}
      <div className="card">
        <h2>Active Match Requests</h2>
        {loading ? (
          <p>Loading...</p>
        ) : matches.length === 0 ? (
          <p className="empty-state">No match requests at the moment.</p>
        ) : (
          <div className="matches-list">
            {matches.map((m) => (
              <div key={m._id} className="match-card">
                <div className="match-info">
                  <strong>{m.requestId?.hospitalId?.name || 'Hospital'}</strong>
                  <span className="match-detail">
                    Needs: <span className="badge badge-blood">{m.requestId?.bloodGroupNeeded}</span>
                  </span>
                  <span className="match-detail">
                    Urgency: <span className={`badge badge-${m.requestId?.urgencyLevel}`}>
                      {m.requestId?.urgencyLevel}
                    </span>
                  </span>
                  <span className="match-detail">
                    Distance: {m.distanceKm} km
                  </span>
                </div>
                <div className="match-actions">
                  {m.responseStatus === 'pending' ? (
                    <>
                      <button
                        className="btn-accept"
                        onClick={() => handleRespond(m._id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn-decline"
                        onClick={() => handleRespond(m._id, 'declined')}
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <span className={`badge badge-${m.responseStatus}`}>
                      {m.responseStatus}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
