import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import NotificationBell from './components/NotificationBell';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import './App.css';

let socket;

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [refresh, setRefresh] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editing, setEditing] = useState(false);
  const [view, setView] = useState('tasks');
  const [forceRefresh, setForceRefresh] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  useEffect(() => {
    if (token && userId) {
      socket = io('http://localhost:5000');
      socket.emit('register', userId);
      socket.on('notification', (notification) => {
        alert(`🔔 ${notification.message}`);
        setForceRefresh(prev => !prev);
      });
      return () => {
        socket.disconnect();
      };
    }
  }, [token, userId]);

  const handleLogout = () => {
    if (socket) socket.disconnect();
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    setToken(null);
    setUserId(null);
    setUsername(null);
  };

  if (!token) {
    return <Login setToken={setToken} setUserId={setUserId} setUsername={setUsername} />;
  }

  return (
    <div className="app">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <h1>Task Manager - Welcome, {username}!</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setDarkMode(!darkMode)}
            style={{ background: 'rgba(255,255,255,0.2)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer' }}
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
          <div style={{ display: 'flex', gap: '5px' }}>
            <button 
              onClick={() => setView('tasks')} 
              style={{ background: view === 'tasks' ? '#007bff' : 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', border: 'none' }}
            >
              📋 Tasks
            </button>
            <button 
              onClick={() => setView('analytics')} 
              style={{ background: view === 'analytics' ? '#007bff' : 'rgba(255,255,255,0.2)', color: 'white', padding: '8px 20px', borderRadius: '25px', cursor: 'pointer', border: 'none' }}
            >
              📊 Analytics
            </button>
          </div>
          <NotificationBell userId={userId} token={token} refreshFlag={forceRefresh} />
          <button onClick={handleLogout}>Logout</button>
        </div>
      </div>

      {view === 'tasks' ? (
        <>
          <TaskForm
            currentTask={currentTask}
            setCurrentTask={setCurrentTask}
            refresh={refresh}
            setRefresh={setRefresh}
            setEditing={setEditing}
          />
          {!editing && (
            <TaskList 
              onEdit={(task) => { setCurrentTask(task); setEditing(true); }} 
              refresh={refresh} 
              setRefresh={setRefresh} 
            />
          )}
        </>
      ) : (
        <AnalyticsDashboard token={token} />
      )}
    </div>
  );
}

export default App;