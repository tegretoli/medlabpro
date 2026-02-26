const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Result = require('../models/Result');
const Patient = require('../models/Patient');
const Analysis = require('../models/Analysis');

router.get('/stats', protect, async (req, res) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(today); weekStart.setDate(today.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    dailyPatients,
    weeklyPatients,
    monthlyPatients,
    dailyRevenue,
    weeklyRevenue,
    monthlyRevenue,
    pendingResults,
    topAnalyses
  ] = await Promise.all([
    Patient.countDocuments({ visitDate: { $gte: today } }),
    Patient.countDocuments({ visitDate: { $gte: weekStart } }),
    Patient.countDocuments({ visitDate: { $gte: monthStart } }),
    Result.aggregate([{ $match: { createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
    Result.aggregate([{ $match: { createdAt: { $gte: weekStart } } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
    Result.aggregate([{ $match: { createdAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$price' } } }]),
    Result.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
    Result.aggregate([
      { $group: { _id: '$analysis', count: { $sum: 1 }, revenue: { $sum: '$price' } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'analyses', localField: '_id', foreignField: '_id', as: 'analysis' } },
      { $unwind: '$analysis' }
    ])
  ]);

  // Revenue by department (this month)
  const revenueByDept = await Result.aggregate([
    { $match: { createdAt: { $gte: monthStart } } },
    { $lookup: { from: 'analyses', localField: 'analysis', foreignField: '_id', as: 'analysis' } },
    { $unwind: '$analysis' },
    { $lookup: { from: 'departments', localField: 'analysis.department', foreignField: '_id', as: 'dept' } },
    { $unwind: '$dept' },
    { $group: { _id: '$dept.name', revenue: { $sum: '$price' }, count: { $sum: 1 } } },
    { $sort: { revenue: -1 } }
  ]);

  // Daily chart data (last 30 days)
  const chartData = await Result.aggregate([
    { $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
    { $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      revenue: { $sum: '$price' },
      count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  res.json({
    success: true,
    stats: {
      patients: { daily: dailyPatients, weekly: weeklyPatients, monthly: monthlyPatients },
      revenue: {
        daily: dailyRevenue[0]?.total || 0,
        weekly: weeklyRevenue[0]?.total || 0,
        monthly: monthlyRevenue[0]?.total || 0
      },
      pendingResults,
      topAnalyses,
      revenueByDept,
      chartData
    }
  });
});

module.exports = router;
