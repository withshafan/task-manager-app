import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

function AnalyticsDashboard({ token }) {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [period, setPeriod] = useState('weekly');

  const fetchOverview = async () => {
    try {
      const res = await axios.get('/api/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to fetch overview', err);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axios.get(`/api/analytics/trends?period=${period}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrends(res.data);
    } catch (err) {
      console.error('Failed to fetch trends', err);
    }
  };

  useEffect(() => {
    fetchOverview();
    fetchTrends();
  }, [period]);

  const pieData = overview ? [
    { name: 'Pending', value: overview.pendingTasks, color: '#ffc107' },
    { name: 'In Progress', value: overview.inProgressTasks, color: '#17a2b8' },
    { name: 'Completed', value: overview.completedTasks, color: '#28a745' }
  ] : [];

  return (
    <div className="analytics-container" style={{ color: 'var(--text-color)' }}>
      <h2>Analytics Dashboard</h2>
      {overview && (
        <div className="analytics-stats">
          <div className="analytics-card">
            <h3>Total Tasks</h3>
            <p className="analytics-number">{overview.totalTasks}</p>
          </div>
          <div className="analytics-card completed-card">
            <h3>Completed</h3>
            <p className="analytics-number">{overview.completedTasks}</p>
          </div>
          <div className="analytics-card rate-card">
            <h3>Completion Rate</h3>
            <p className="analytics-number">{overview.completionPercent}%</p>
          </div>
        </div>
      )}

      <div className="analytics-charts">
        <div className="pie-chart-container">
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="trends-container">
          <h3>Task Trends</h3>
          <div className="trend-buttons">
            <button onClick={() => setPeriod('weekly')} className={period === 'weekly' ? 'trend-btn-active' : 'trend-btn'}>Weekly</button>
            <button onClick={() => setPeriod('monthly')} className={period === 'monthly' ? 'trend-btn-active' : 'trend-btn'}>Monthly</button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--text-color)" opacity="0.3" />
              <XAxis dataKey="period" stroke="var(--text-color)" />
              <YAxis stroke="var(--text-color)" />
              <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', color: 'var(--text-color)', border: 'none' }} />
              <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
              <Line type="monotone" dataKey="totalCreated" stroke="#8884d8" name="Tasks Created" />
              <Line type="monotone" dataKey="completedCount" stroke="#82ca9d" name="Completed" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;