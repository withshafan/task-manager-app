import { useState, useEffect } from 'react';
import axios from 'axios';

function NotificationBell({ userId, token, refreshFlag }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await axios.get('http://localhost:5000/api/notifications', {
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
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch (err) {
      console.error('Failed to mark as read', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token, refreshFlag]); // re‑fetch when refreshFlag changes

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '24px',
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '-5px',
            right: '-10px',
            background: 'red',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '12px'
          }}>{unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div style={{
          position: 'absolute',
          top: '35px',
          right: '0',
          width: '300px',
          maxHeight: '400px',
          overflowY: 'auto',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          zIndex: 1000
        }}>
          <div style={{ padding: '10px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>
            Notifications
          </div>
          {notifications.length === 0 ? (
            <div style={{ padding: '10px', color: '#999' }}>No notifications</div>
          ) : (
            notifications.map(notif => (
              <div 
                key={notif._id} 
                style={{
                  padding: '10px',
                  borderBottom: '1px solid #eee',
                  background: notif.read ? '#fff' : '#f0f7ff',
                  cursor: 'pointer'
                }}
                onClick={() => markAsRead(notif._id)}
              >
                <div>{notif.message}</div>
                <small style={{ color: '#888' }}>{new Date(notif.createdAt).toLocaleString()}</small>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;