import { useState, useEffect } from 'react';
import axios from 'axios';

function NotificationBell({ userId, token, refreshFlag }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error('Failed to fetch notifications', err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.put(`/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token, refreshFlag]);

  return (
    <div className="notification-bell">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="notification-bell-button"
        aria-label="Notifications"
      >
        <span role="img" aria-hidden="true">🔔</span>
        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">Notifications</div>
          {notifications.length === 0 ? (
            <div className="notification-empty">No notifications</div>
          ) : (
            notifications.map(notif => (
              <div
                key={notif._id}
                className={`notification-item ${notif.read ? 'read' : 'unread'}`}
                onClick={() => markAsRead(notif._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && markAsRead(notif._id)}
              >
                <div className="notification-message">{notif.message}</div>
                <small className="notification-time">
                  {new Date(notif.createdAt).toLocaleString()}
                </small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;