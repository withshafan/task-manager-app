import { useState, useEffect } from 'react';
import { createTask, updateTask } from '../services/api';

function TaskForm({ currentTask, setCurrentTask, refresh, setRefresh, setEditing }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');

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
    }
  }, [currentTask]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskData = { title, description, status, dueDate };
    try {
      if (currentTask) {
        await updateTask(currentTask._id, taskData);
        setEditing(false);
      } else {
        await createTask(taskData);
      }
      setCurrentTask(null);
      setRefresh(!refresh);
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setDueDate('');
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="task-form">
      <h2>{currentTask ? 'Edit Task' : 'New Task'}</h2>
      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        <option>Pending</option>
        <option>In Progress</option>
        <option>Completed</option>
      </select>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <button type="submit">{currentTask ? 'Update' : 'Add'} Task</button>
      {currentTask && (
        <button type="button" onClick={() => { setCurrentTask(null); setEditing(false); }}>
          Cancel
        </button>
      )}
    </form>
  );
}

export default TaskForm;