import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from 'recharts';

function AnalyticsDashboard({ token }) {
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState([]);
  const [period, setPeriod] = useState('weekly');
  const [loading, setLoading] = useState(true);

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
    setLoading(true);
    Promise.all([fetchOverview(), fetchTrends()]).finally(() => setLoading(false));
  }, [period, token]);

  const pieData = overview
    ? [
        { name: 'Pending', value: overview.pendingTasks, color: '#ffc107' },
        { name: 'In Progress', value: overview.inProgressTasks, color: '#17a2b8' },
        { name: 'Completed', value: overview.completedTasks, color: '#28a745' }
      ]
    : [];

  // Custom label: show percentage only inside the slice, names come from Legend
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight="bold"
        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (loading) {
    return <div className="analytics-container">Loading analytics…</div>;
  }

  return (
    <div className="analytics-container">
      <h2 className="analytics-title">Analytics Dashboard</h2>

      {overview && (
        <div className="analytics-stats">
          <div className="analytics-card total-card">
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
        <div className="pie-chart-card">
          <h3 className="chart-title">Status Distribution</h3>
          <div className="pie-chart-wrapper">
            <ResponsiveContainer width="100%" height={420}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  outerRadius={130}
                  innerRadius={60}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '10px',
                    boxShadow: 'var(--dropdown-shadow)'
                  }}
                />
                <Legend
                  layout="horizontal"
                  verticalAlign="bottom"
                  align="center"
                  wrapperStyle={{ color: 'var(--text-color)', paddingTop: '15px' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="trends-card">
          <h3 className="chart-title">Task Trends</h3>
          <div className="trend-buttons">
            <button
              onClick={() => setPeriod('weekly')}
              className={period === 'weekly' ? 'trend-btn-active' : 'trend-btn'}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={period === 'monthly' ? 'trend-btn-active' : 'trend-btn'}
            >
              Monthly
            </button>
          </div>
          <div className="trends-chart-wrapper">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--text-color)" opacity="0.15" />
                <XAxis dataKey="period" stroke="var(--text-color)" tick={{ fill: 'var(--text-color)' }} />
                <YAxis stroke="var(--text-color)" tick={{ fill: 'var(--text-color)' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--card-bg)',
                    color: 'var(--text-color)',
                    border: '1px solid var(--card-border)',
                    borderRadius: '10px',
                    boxShadow: 'var(--dropdown-shadow)'
                  }}
                />
                <Legend wrapperStyle={{ color: 'var(--text-color)' }} />
                <Line type="monotone" dataKey="totalCreated" stroke="#8884d8" strokeWidth={2} name="Tasks Created" dot={{ r: 4 }} />
                <Line type="monotone" dataKey="completedCount" stroke="#82ca9d" strokeWidth={2} name="Completed" dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AnalyticsDashboard;