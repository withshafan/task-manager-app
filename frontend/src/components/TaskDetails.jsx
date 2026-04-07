function TaskDetails({ task, onClose }) {
  if (!task) return null;
  return (
    <div className="task-details">
      <h2>{task.title}</h2>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Status:</strong> {task.status}</p>
      <p><strong>Due Date:</strong> {new Date(task.dueDate).toLocaleDateString()}</p>
      <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleString()}</p>
      <button onClick={onClose}>Close</button>
    </div>
  );
}

export default TaskDetails;