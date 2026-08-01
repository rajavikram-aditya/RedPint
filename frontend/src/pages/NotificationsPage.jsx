import { useEffect, useState } from 'react';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/api';
import { formatDate } from '../utils/helpers';
import './Dashboard.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await getNotifications();
      setNotifications(res.data.notifications);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id) => {
    await markNotificationRead(id);
    loadNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
    loadNotifications();
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="dashboard-container">
      <div className="card-header">
        <h1>🔔 Notifications</h1>
        {unreadCount > 0 && (
          <button className="btn-secondary" onClick={handleMarkAllRead}>
            Mark all as read ({unreadCount})
          </button>
        )}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : notifications.length === 0 ? (
        <p className="empty-state">No notifications yet.</p>
      ) : (
        <div className="notifications-list">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`notification-card ${n.read ? '' : 'unread'}`}
              onClick={() => !n.read && handleMarkRead(n._id)}
            >
              <p>{n.message}</p>
              <span className="notification-time">{formatDate(n.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
