import { useState, useEffect } from 'react';
import { getTasks, deleteTask } from '../services/api';

function TaskList({ onEdit, refresh, setRefresh }) {
  const [tasks, setTasks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      console.log('Tasks loaded:', response.data);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [refresh]); // This runs whenever `refresh` changes

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure?')) {
      await deleteTask(id);
      setRefresh(!refresh); // Trigger reload
    }
  };

  // Calculate progress
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const progressPercent = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '' || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="task-list">
      <h2>Your Tasks</h2>
      
      {/* Manual refresh button for debugging */}
      <button onClick={() => setRefresh(!refresh)} style={{ marginBottom: '10px' }}>⟳ Refresh</button>

      {/* Progress Bar */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        <span className="progress-text">{Math.round(progressPercent)}% Completed ({completedTasks}/{totalTasks})</span>
      </div>

      {/* Search and Filter */}
      <div className="filters">
        <input
          type="text"
          placeholder="Search by title or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      {filteredTasks.length === 0 && <p>No tasks match your criteria.</p>}
      {filteredTasks.map((task) => (
        <div key={task._id} className="task-card">
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          <p>Status: {task.status}</p>
          <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>
          <button onClick={() => onEdit(task)}>Edit</button>
          <button onClick={() => handleDelete(task._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default TaskList;