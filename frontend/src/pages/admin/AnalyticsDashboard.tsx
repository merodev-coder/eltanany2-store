// pages/admin/AnalyticsDashboard.tsx
import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingBag,
  DollarSign,
  BarChart3,
  Calendar,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getMonthlyAnalytics, getOverviewStats } from '@/services/api';

interface MonthData {
  month: string;
  monthNumber: number;
  totalOrdersValue: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  orderCount: number;
}

interface YearlyData {
  totalOrdersValue: number;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  totalOrders: number;
}

interface InventoryData {
  totalInventoryValue: number;
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
}

export default function AnalyticsDashboard() {
  const [monthlyData, setMonthlyData] = useState<MonthData[]>([]);
  const [yearly, setYearly] = useState<YearlyData | null>(null);
  const [inventory, setInventory] = useState<InventoryData | null>(null);
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [analytics, stats] = await Promise.all([
          getMonthlyAnalytics(),
          getOverviewStats(),
        ]);
        setMonthlyData(analytics.monthly || []);
        setYearly(analytics.yearly || null);
        setInventory(analytics.inventory || null);
        setOverview(stats);
      } catch (err: any) {
        setError(err.response?.data?.message || 'فشل تحميل التحليلات');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow-sm rounded-card p-12 text-center">
        <p className="text-error font-body mb-4">{error}</p>
      </div>
    );
  }

  // Calculate profit margin
  const profitMargin = yearly && yearly.totalRevenue > 0
    ? Math.round((yearly.netProfit / yearly.totalRevenue) * 100)
    : 0;

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div>
        <h2 className="font-heading font-bold text-xl text-[#18181B]">لوحة التحليلات والأرباح</h2>
        <p className="font-body text-sm text-slate mt-1">إحصائيات المبيعات والأرباح الشهرية</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'إيرادات الشهر',
              value: `${overview.monthlyRevenue?.toLocaleString() || 0} ج.م`,
              icon: DollarSign,
              color: 'text-success',
              bg: 'bg-success/10',
            },
            {
              label: 'صافي الربح',
              value: `${overview.monthlyProfit?.toLocaleString() || 0} ج.م`,
              icon: TrendingUp,
              color: 'text-ignition-start',
              bg: 'bg-ignition-start/10',
            },
            {
              label: 'طلبات الشهر',
              value: overview.monthlyOrders?.toString() || '0',
              icon: ShoppingBag,
              color: 'text-primary',
              bg: 'bg-primary/10',
            },
            {
              label: 'منتجات منخفضة المخزون',
              value: overview.lowStockProducts?.toString() || '0',
              icon: Package,
              color: 'text-warning',
              bg: 'bg-warning/10',
            },
          ].map((card, idx) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="bg-white shadow-sm rounded-card p-5"
            >
              <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <p className="font-body text-sm text-slate">{card.label}</p>
              <p className="font-heading font-bold text-2xl text-[#18181B] mt-1">{card.value}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Yearly Summary */}
      {yearly && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm rounded-card p-6"
        >
          <h3 className="font-heading font-bold text-lg text-[#18181B] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-ignition-start" />
            ملخص السنة
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">إجمالي قيمة الطلبات</p>
              <p className="font-heading font-bold text-xl text-[#18181B] mt-1">
                {yearly.totalOrdersValue.toLocaleString()} ج.م
              </p>
            </div>
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">إجمالي الإيرادات</p>
              <p className="font-heading font-bold text-xl text-[#18181B] mt-1">
                {yearly.totalRevenue.toLocaleString()} ج.م
              </p>
            </div>
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">صافي الربح</p>
              <p className="font-heading font-bold text-xl text-success mt-1">
                {yearly.netProfit.toLocaleString()} ج.م
              </p>
            </div>
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">هامش الربح</p>
              <p className="font-heading font-bold text-xl text-ignition-start mt-1">
                {profitMargin}%
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Monthly Table */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm rounded-card p-6"
      >
        <h3 className="font-heading font-bold text-lg text-[#18181B] mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-ignition-start" />
          التحليل الشهري
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-steel-light">
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">الشهر</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">الطلبات</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">قيمة الطلبات</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">الإيرادات</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">التكلفة</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">صافي الربح</th>
                <th className="text-right py-3 px-4 font-body text-sm text-slate font-medium">هامش الربح</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((month) => {
                const margin = month.totalRevenue > 0
                  ? Math.round((month.netProfit / month.totalRevenue) * 100)
                  : 0;
                const isPositive = month.netProfit >= 0;
                return (
                  <tr
                    key={month.monthNumber}
                    className="border-b border-steel-light/50 last:border-0 hover:bg-steel-light/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-body text-sm font-medium text-[#18181B]">{month.month}</td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B]">{month.orderCount}</td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B]">{month.totalOrdersValue.toLocaleString()} ج.م</td>
                    <td className="py-3 px-4 font-body text-sm text-[#18181B]">{month.totalRevenue.toLocaleString()} ج.م</td>
                    <td className="py-3 px-4 font-body text-sm text-slate">{month.totalCost.toLocaleString()} ج.م</td>
                    <td className="py-3 px-4 font-body text-sm font-medium">
                      <span className={isPositive ? 'text-success' : 'text-error'}>
                        {isPositive ? '+' : ''}{month.netProfit.toLocaleString()} ج.م
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-body font-medium ${
                        isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}>
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {margin}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Inventory Summary */}
      {inventory && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white shadow-sm rounded-card p-6"
        >
          <h3 className="font-heading font-bold text-lg text-[#18181B] mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-ignition-start" />
            ملخص المخزون
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">إجمالي قيمة المخزون</p>
              <p className="font-heading font-bold text-xl text-[#18181B] mt-1">
                {inventory.totalInventoryValue.toLocaleString()} ج.م
              </p>
            </div>
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">إجمالي المنتجات</p>
              <p className="font-heading font-bold text-xl text-[#18181B] mt-1">
                {inventory.totalProducts}
              </p>
            </div>
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">منخفض المخزون</p>
              <p className="font-heading font-bold text-xl text-warning mt-1">
                {inventory.lowStockCount}
              </p>
            </div>
            <div className="p-4 bg-steel-light/30 rounded-lg">
              <p className="font-body text-sm text-slate">نفذ المخزون</p>
              <p className="font-heading font-bold text-xl text-error mt-1">
                {inventory.outOfStockCount}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
