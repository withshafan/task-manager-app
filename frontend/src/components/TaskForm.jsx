import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/api';
import axios from 'axios';

function TaskForm({ currentTask, setCurrentTask, refresh, setRefresh, setEditing }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (currentTask) {
      setTitle(currentTask.title);
      setDescription(currentTask.description);
      setStatus(currentTask.status);
      setDueDate(currentTask.dueDate.split('T')[0]);
    } else {
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setDueDate('');
      setFile(null);
    }
  }, [currentTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { title, description, status, dueDate };
    try {
      let taskId;
      if (currentTask) {
        await updateTask(currentTask._id, taskData);
        taskId = currentTask._id;
        setEditing(false);
      } else {
        const response = await createTask(taskData);
        taskId = response.data._id;
      }
      // If a file is selected, upload it after task creation/update
      if (file) {
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        await axios.post(`http://localhost:5000/api/tasks/${taskId}/upload`, formData, {
          headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUploading(false);
        alert('File uploaded successfully');
      }
      setCurrentTask(null);
      setRefresh(!refresh);
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setDueDate('');
      setFile(null);
    } catch (error) {
      console.error('Error saving task:', error);
      alert(error.response?.data?.message || 'Error saving task');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>{currentTask ? 'Edit Task' : 'New Task'}</h2>
      <input
        type="text"
        name="title"
        id="title"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        name="description"
        id="description"
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <select name="status" id="status" value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
      <input
        type="date"
        name="dueDate"
        id="dueDate"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <input
        type="file"
        accept=".pdf,.doc,.docx,.txt,.jpg,.png"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button type="submit" disabled={uploading}>
        {uploading ? 'Uploading...' : (currentTask ? 'Update' : 'Add')} Task
      </button>
      {currentTask && (
        <button type="button" onClick={() => { setCurrentTask(null); setEditing(false); }}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default TaskForm;