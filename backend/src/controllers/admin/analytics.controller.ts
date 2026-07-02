// backend/src/controllers/admin/analytics.controller.ts
import { Request, Response } from 'express';
import Order from '../../models/user/Order.model.js';
import Product from '../../models/admin/Product.model.js';
import logger from '../../utils/logger.js';

/**
 * GET /api/v1/admin/analytics/monthly
 * Get monthly order analytics: total orders value, revenue, net profit
 */
export async function getMonthlyAnalytics(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const endOfYear = new Date(now.getFullYear() + 1, 0, 1);

    // Aggregate orders by month
    const monthlyData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lt: endOfYear },
          status: { $nin: ['cancelled'] },
        },
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          totalOrdersValue: { $sum: '$totalAmount' },
          totalRevenue: { $sum: { $ifNull: ['$totalRevenue', '$totalAmount'] } },
          totalCost: { $sum: { $ifNull: ['$totalCost', 0] } },
          netProfit: { $sum: { $ifNull: ['$netProfit', 0] } },
          orderCount: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill in missing months with zeros
    const monthNames = [
      'يناير', 'فبراير', 'مارس', 'إبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر',
    ];

    const filledData = monthNames.map((name, index) => {
      const monthData = monthlyData.find((d) => d._id === index + 1);
      return {
        month: name,
        monthNumber: index + 1,
        totalOrdersValue: monthData?.totalOrdersValue || 0,
        totalRevenue: monthData?.totalRevenue || 0,
        totalCost: monthData?.totalCost || 0,
        netProfit: monthData?.netProfit || 0,
        orderCount: monthData?.orderCount || 0,
      };
    });

    // Calculate yearly totals
    const yearlyTotals = filledData.reduce(
      (acc, month) => ({
        totalOrdersValue: acc.totalOrdersValue + month.totalOrdersValue,
        totalRevenue: acc.totalRevenue + month.totalRevenue,
        totalCost: acc.totalCost + month.totalCost,
        netProfit: acc.netProfit + month.netProfit,
        totalOrders: acc.totalOrders + month.orderCount,
      }),
      { totalOrdersValue: 0, totalRevenue: 0, totalCost: 0, netProfit: 0, totalOrders: 0 }
    );

    // Get inventory stats
    const inventoryStats = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalInventoryValue: { $sum: { $multiply: ['$buyingPrice', '$stock'] } },
          totalProducts: { $sum: 1 },
          lowStockCount: {
            $sum: { $cond: [{ $lte: ['$stock', 5] }, 1, 0] },
          },
          outOfStockCount: {
            $sum: { $cond: [{ $eq: ['$stock', 0] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        monthly: filledData,
        yearly: yearlyTotals,
        inventory: inventoryStats[0] || {
          totalInventoryValue: 0,
          totalProducts: 0,
          lowStockCount: 0,
          outOfStockCount: 0,
        },
      },
    });
  } catch (err: any) {
    logger.error(`Analytics error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to retrieve analytics' });
  }
}

/**
 * GET /api/v1/admin/analytics/overview
 * Quick overview stats for dashboard cards
 */
export async function getOverviewStats(req: Request, res: Response): Promise<void> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const [monthlyOrders, totalProducts, lowStockProducts] = await Promise.all([
      Order.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $nin: ['cancelled'] } } },
        {
          $group: {
            _id: null,
            revenue: { $sum: '$totalAmount' },
            profit: { $sum: { $ifNull: ['$netProfit', 0] } },
            count: { $sum: 1 },
          },
        },
      ]),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lte: 5 } }),
    ]);

    const monthly = monthlyOrders[0] || { revenue: 0, profit: 0, count: 0 };

    res.status(200).json({
      success: true,
      data: {
        monthlyRevenue: monthly.revenue,
        monthlyProfit: monthly.profit,
        monthlyOrders: monthly.count,
        totalProducts,
        lowStockProducts,
      },
    });
  } catch (err: any) {
    logger.error(`Overview stats error: ${err.message}`);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats' });
  }
}
