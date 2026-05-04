const express = require('express');
const router = express.Router();
const auth = require('./auth');
const Task = require('./taskModel');

/**
 * GET /analytics/overview
 * Returns: total tasks, completed tasks, pending tasks, completion percentage
 */
router.get('/overview', auth, async (req, res) => {
  try {
    // Count tasks owned by the user OR shared with the user
    const filter = {
      $or: [
        { owner: req.userId },
        { sharedWith: { $in: [req.userId] } }
      ]
    };
    const totalTasks = await Task.countDocuments(filter);
    const completedTasks = await Task.countDocuments({ ...filter, status: 'Completed' });
    const pendingTasks = await Task.countDocuments({ ...filter, status: 'Pending' });
    const inProgressTasks = await Task.countDocuments({ ...filter, status: 'In Progress' });
    const completionPercent = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

    res.json({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      completionPercent: Math.round(completionPercent)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * GET /analytics/trends?period=weekly (default) or monthly
 * Returns: array of { period, completed, overdue? } grouped by week or month
 */
router.get('/trends', auth, async (req, res) => {
  try {
    const period = req.query.period || 'weekly'; // 'weekly' or 'monthly'
    const filter = {
      $or: [
        { owner: req.userId },
        { sharedWith: { $in: [req.userId] } }
      ]
    };

    let groupByFormat;
    if (period === 'weekly') {
      groupByFormat = { $isoWeek: '$createdAt' };
    } else {
      groupByFormat = { $month: '$createdAt' };
    }

    const trends = await Task.aggregate([
      { $match: filter },
      {
        $group: {
          _id: groupByFormat,
          totalCreated: { $sum: 1 },
          completedCount: {
            $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Format the response
    const formatted = trends.map(item => ({
      period: item._id,
      totalCreated: item.totalCreated,
      completedCount: item.completedCount,
      completionRate: (item.completedCount / item.totalCreated) * 100
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;