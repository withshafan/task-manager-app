import { useState, useEffect } from 'react';
import Login from './components/Login';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState(localStorage.getItem('username'));
  const [refresh, setRefresh] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (token) {
      setToken(token);
      setUserId(localStorage.getItem('userId'));
      setUsername(localStorage.getItem('username'));
    }
  }, [token]);

  const handleLogout = () => {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Task Manager - Welcome, {username}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>
      <TaskForm
        currentTask={currentTask}
        setCurrentTask={setCurrentTask}
        refresh={refresh}
        setRefresh={setRefresh}
        setEditing={setEditing}
      />
      {!editing && (
        <TaskList onEdit={(task) => { setCurrentTask(task); setEditing(true); }} refresh={refresh} setRefresh={setRefresh} />
      )}
    </div>
  );
}

export default App;