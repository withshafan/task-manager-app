import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

function AnalyticsDashboard({ token }) {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [period, setPeriod] = useState('weekly');

  const fetchOverview = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/analytics/overview', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOverview(res.data);
    } catch (err) {
      console.error('Failed to fetch overview', err);
    }
  };

  const fetchTrends = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/analytics/trends?period=${period}`, {
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
    <div style={{ padding: '20px' }}>
      <h2>Analytics Dashboard</h2>
      {overview && (
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '30px' }}>
          <div style={{ background: '#f0f0f0', padding: '20px', borderRadius: '10px', textAlign: 'center', flex: 1 }}>
            <h3>Total Tasks</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{overview.totalTasks}</p>
          </div>
          <div style={{ background: '#28a745', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', flex: 1 }}>
            <h3>Completed</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{overview.completedTasks}</p>
          </div>
          <div style={{ background: '#17a2b8', color: 'white', padding: '20px', borderRadius: '10px', textAlign: 'center', flex: 1 }}>
            <h3>Completion Rate</h3>
            <p style={{ fontSize: '32px', fontWeight: 'bold' }}>{overview.completionPercent}%</p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <h3>Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
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

        <div style={{ flex: 2 }}>
          <h3>Task Trends</h3>
          <div style={{ marginBottom: '10px' }}>
            <button onClick={() => setPeriod('weekly')} style={{ marginRight: '10px', background: period === 'weekly' ? '#007bff' : '#ccc', color: period === 'weekly' ? 'white' : 'black' }}>Weekly</button>
            <button onClick={() => setPeriod('monthly')} style={{ background: period === 'monthly' ? '#007bff' : '#ccc', color: period === 'monthly' ? 'white' : 'black' }}>Monthly</button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="period" />
              <YAxis />
              <Tooltip />
              <Legend />
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