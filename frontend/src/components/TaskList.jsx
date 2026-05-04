import { useState, useEffect } from 'react';
import { getTasks, deleteTask, shareTask } from '../services/api';
import axios from 'axios';

function TaskList({ onEdit, refresh, setRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [shareUsername, setShareUsername] = useState('');
  const [shareError, setShareError] = useState('');

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [refresh]);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this task?')) {
      await deleteTask(id);
      setRefresh(!refresh);
    }
  };

  const handleShareClick = (taskId) => {
    setSelectedTaskId(taskId);
    setShowShareModal(true);
    setShareUsername('');
    setShareError('');
  };

  const handleShareSubmit = async () => {
    try {
      await shareTask(selectedTaskId, shareUsername);
      alert(`Task shared with ${shareUsername}`);
      setShowShareModal(false);
    } catch (err) {
      setShareError(err.response?.data?.message || 'Sharing failed');
    }
  };

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const currentUserId = localStorage.getItem('userId');

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      <button onClick={() => setRefresh(!refresh)} style={{ marginBottom: '10px' }}>⟳ Refresh</button>
      
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <span className="progress-text">{Math.round(progressPercent)}% Completed ({completedTasks}/{totalTasks})</span>
      </div>

      <div className="filters">
        <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {filteredTasks.length === 0 && <p>No tasks match.</p>}
      {filteredTasks.map(task => {
        const isOwner = task.owner === currentUserId;
        return (
          <div key={task._id} className="task-card">
            <h3>{task.title}</h3>
            <p>{task.description}</p>
            <p>Status: {task.status}</p>
            <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
            {/* Display attachments */}
            {task.attachments && task.attachments.length > 0 && (
              <div style={{ marginTop: '10px' }}>
                <strong>Attachments:</strong>
                {task.attachments.map(att => (
                  <div key={att._id}>
                    <a href={`http://localhost:5000${att.filePath}`} target="_blank" rel="noopener noreferrer">
                      📎 {att.originalName}
                    </a>
                  </div>
                ))}
              </div>
            )}
            <button onClick={() => onEdit(task)}>Edit</button>
            <button onClick={() => handleDelete(task._id)}>Delete</button>
            {isOwner && <button onClick={() => handleShareClick(task._id)}>Share</button>}
          </div>
        );
      })}

      {/* Share Modal */}
      {showShareModal && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Share Task</h3>
            <input type="text" placeholder="Enter username" value={shareUsername} onChange={(e) => setShareUsername(e.target.value)} />
            <button onClick={handleShareSubmit}>Share</button>
            <button onClick={() => setShowShareModal(false)}>Cancel</button>
            {shareError && <p style={{ color: 'red' }}>{shareError}</p>}
          </div>
        </div>
      )}
    </div>
  );
}

export default TaskList;