import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ShoppingBag, PackageCheck } from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { getOrders, getMonthlyInventoryList } from '@/services/mockApi';
import type { Order, MonthlyInventorySnapshot } from '@/types';

interface MonthData {
  key: string;
  label: string;
  revenue: number;
  orders: number;
  items: number;
  sparkline: { d: number; v: number }[];
}

const MONTH_LABELS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

const BRAND_PRIMARY = '#E8420C';
const BRAND_SECONDARY = '#FFB627';

function formatEGP(value: number): string {
  return value.toLocaleString('ar-EG') + ' ج.م';
}

function formatCompact(value: number): string {
  if (value >= 1_000_000) return (value / 1_000_000).toFixed(1) + 'M';
  if (value >= 1_000) return (value / 1_000).toFixed(0) + 'K';
  return value.toLocaleString('ar-EG');
}

function generateSparkline(revenue: number, seed: number): { d: number; v: number }[] {
  const points: { d: number; v: number }[] = [];
  const base = revenue / 30;
  let current = base * (0.6 + ((seed * 7) % 10) / 25);
  for (let d = 1; d <= 30; d++) {
    const noise = Math.sin(d * 0.9 + seed * 3.7) * base * 0.45;
    const trend = Math.sin((d / 30) * Math.PI) * base * 0.3;
    current = Math.max(0, current * 0.7 + (base + noise + trend) * 0.3);
    points.push({ d, v: Math.round(current) });
  }
  return points;
}

function AnnualTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      className="bg-white/95 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-steel-light/40"
      style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10)' }}
    >
      <p className="font-heading font-bold text-[13px] text-ink mb-0.5">{label}</p>
      <p className="font-body text-sm text-slate">{formatEGP(payload[0].value)}</p>
    </div>
  );
}

export default function SalesOverviewView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [snapshots, setSnapshots] = useState<MonthlyInventorySnapshot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [orderData, snapshotData] = await Promise.all([
        getOrders(),
        getMonthlyInventoryList(),
      ]);
      setOrders(orderData);
      setSnapshots(snapshotData);
      setLoading(false);
    };
    load();
  }, []);

  const totalRevenue = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce((sum, o) => sum + o.total, 0),
    [orders],
  );

  const totalOrders = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled').length,
    [orders],
  );

  const totalItems = useMemo(
    () =>
      orders
        .filter((o) => o.status !== 'cancelled')
        .reduce(
          (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0),
          0,
        ),
    [orders],
  );

  const monthlyData: MonthData[] = useMemo(() => {
    const monthMap = new Map<string, MonthData>();

    MONTH_LABELS.forEach((label, idx) => {
      const key = `${idx + 1}`.padStart(2, '0');
      monthMap.set(key, {
        key,
        label,
        revenue: 0,
        orders: 0,
        items: 0,
        sparkline: [],
      });
    });

    snapshots.forEach((snap) => {
      const monthNum = snap.monthKey.split('-')[1];
      if (monthNum && monthMap.has(monthNum)) {
        const entry = monthMap.get(monthNum)!;
        entry.revenue = snap.monthlyRevenue.total;
        entry.items = snap.unitsSoldThisMonth;
      }
    });

    orders
      .filter((o) => o.status !== 'cancelled')
      .forEach((o) => {
        const d = new Date(o.date);
        const monthKey = `${d.getMonth() + 1}`.padStart(2, '0');
        if (monthMap.has(monthKey)) {
          const entry = monthMap.get(monthKey)!;
          entry.orders += 1;
          if (entry.revenue === 0) {
            entry.revenue += o.total;
          }
          if (entry.items === 0) {
            entry.items += o.items.reduce((s, i) => s + i.quantity, 0);
          }
        }
      });

    monthMap.forEach((entry) => {
      if (entry.revenue > 0 || entry.orders > 0) {
        entry.sparkline = generateSparkline(
          entry.revenue || entry.orders * 5000,
          parseInt(entry.key, 10),
        );
      }
    });

    return Array.from(monthMap.values());
  }, [orders, snapshots]);

  const annualChartData = useMemo(
    () => monthlyData.map((m) => ({ name: m.label, revenue: m.revenue })),
    [monthlyData],
  );

  const activeMonths = useMemo(
    () => monthlyData.filter((m) => m.revenue > 0 || m.orders > 0),
    [monthlyData],
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-steel-light border-t-ignition-start rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'إجمالي المبيعات',
      value: formatEGP(totalRevenue),
      icon: TrendingUp,
      trend: '+12.5%',
      gradient: 'from-[#E8420C]/8 to-[#FFB627]/4',
      iconBg: 'bg-[#E8420C]/10',
      iconColor: 'text-[#E8420C]',
    },
    {
      title: 'عدد الطلبات',
      value: totalOrders.toLocaleString('ar-EG'),
      icon: ShoppingBag,
      trend: '+8.3%',
      gradient: 'from-[#3B82F6]/8 to-[#60A5FA]/4',
      iconBg: 'bg-[#3B82F6]/10',
      iconColor: 'text-[#3B82F6]',
    },
    {
      title: 'عدد القطع المباعة',
      value: totalItems.toLocaleString('ar-EG'),
      icon: PackageCheck,
      trend: '+15.2%',
      gradient: 'from-[#16A34A]/8 to-[#4ADE80]/4',
      iconBg: 'bg-[#16A34A]/10',
      iconColor: 'text-[#16A34A]',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-heading font-bold text-xl text-[#18181B]">
          دفتر المبيعات التنفيذي
        </h2>
        <p className="font-body text-sm text-slate mt-1">
          نظرة شاملة على أداء المبيعات والإيرادات
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {statCards.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.12 }}
            className={`bg-white shadow-sm rounded-xl p-6 bg-gradient-to-bl ${card.gradient} relative overflow-hidden group hover:shadow-card transition-shadow duration-300`}
          >
            <div className="absolute -left-8 -bottom-8 w-32 h-32 rounded-full bg-gradient-to-tr from-white/0 to-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-11 h-11 rounded-xl ${card.iconBg} flex items-center justify-center`}
              >
                <card.icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#16A34A]/10 text-[#16A34A] font-body text-xs font-semibold">
                <TrendingUp className="w-3 h-3" />
                {card.trend}
              </span>
            </div>
            <p className="font-body text-sm text-slate">{card.title}</p>
            <p className="font-heading font-bold text-2xl text-[#18181B] mt-1 tracking-tight">
              {card.value}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="w-full bg-white shadow-sm rounded-xl p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div>
            <h3 className="font-heading font-bold text-lg text-[#18181B]">
              الأداء السنوي العام
            </h3>
            <p className="font-body text-sm text-slate mt-0.5">
              مسار الإيرادات على مدار العام
            </p>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:mt-0">
            <span className="w-3 h-3 rounded-full bg-[#E8420C]" />
            <span className="font-body text-xs text-slate">الإيرادات (ج.م)</span>
          </div>
        </div>
        <div className="h-[340px]" dir="ltr">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={annualChartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={BRAND_PRIMARY} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={BRAND_SECONDARY} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#F2F3F5"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 12, fontFamily: 'Cairo' }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#6B7280', fontSize: 11, fontFamily: 'Cairo' }}
                tickFormatter={(v: number) => formatCompact(v)}
                width={55}
              />
              <Tooltip
                content={<AnnualTooltip />}
                cursor={{ stroke: '#E8420C', strokeWidth: 1, strokeDasharray: '4 4' }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke={BRAND_PRIMARY}
                strokeWidth={2.5}
                fill="url(#areaGrad)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: BRAND_PRIMARY,
                  stroke: '#fff',
                  strokeWidth: 2.5,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
      >
        <div className="mb-5">
          <h3 className="font-heading font-bold text-lg text-[#18181B]">
            الأداء الشهري التفصيلي
          </h3>
          <p className="font-body text-sm text-slate mt-0.5">
            مقارنة الأداء شهرًا بشهر
          </p>
        </div>

        {activeMonths.length === 0 ? (
          <div className="bg-white shadow-sm rounded-xl p-10 text-center">
            <p className="font-body text-slate">لا توجد بيانات شهرية بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMonths.map((month, idx) => (
              <motion.div
                key={month.key}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.6 + idx * 0.08 }}
                className="bg-white shadow-sm rounded-xl p-5 flex flex-col justify-between hover:shadow-card transition-shadow duration-300 group"
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-heading font-bold text-[15px] text-[#18181B]">
                    شحن شهر {month.label}
                  </h4>
                  <p className="font-heading font-bold text-lg text-[#E8420C] tracking-tight whitespace-nowrap mr-3">
                    {formatCompact(month.revenue)}
                    <span className="text-xs font-body font-normal text-slate mr-0.5">
                      ج.م
                    </span>
                  </p>
                </div>

                <div className="h-[72px] my-3 -mx-1" dir="ltr">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={month.sparkline}
                      margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                    >
                      <defs>
                        <linearGradient
                          id={`spark-${month.key}`}
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor={BRAND_PRIMARY} />
                          <stop offset="100%" stopColor={BRAND_SECONDARY} />
                        </linearGradient>
                      </defs>
                      <Line
                        type="monotone"
                        dataKey="v"
                        stroke={`url(#spark-${month.key})`}
                        strokeWidth={2}
                        dot={false}
                        strokeLinecap="round"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center gap-5 pt-3 border-t border-[#F2F3F5]">
                  <span className="font-body text-[12px] text-slate">
                    الطلبات:{' '}
                    <span className="font-semibold text-[#18181B]">
                      {month.orders.toLocaleString('ar-EG')}
                    </span>
                  </span>
                  <span className="font-body text-[12px] text-slate">
                    القطع:{' '}
                    <span className="font-semibold text-[#18181B]">
                      {month.items.toLocaleString('ar-EG')}
                    </span>
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
