import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Trophy,
  Target,
  Sparkles,
  CalendarDays,
  Flame,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { useLanguage } from '../LanguageContext';

interface DailyStat {
  date: Date;
  str: string;
  count: number;
  metGoal: boolean;
  dayLabel: string;
  isToday: boolean;
}

interface WeeklyProgressReportProps {
  last7Days: DailyStat[];
  dailyGoal: number;
}

export const WeeklyProgressReport: React.FC<WeeklyProgressReportProps> = ({
  last7Days,
  dailyGoal,
}) => {
  const { t, language } = useLanguage();

  // Find max productive day
  let maxCount = 0;
  let maxDayObj: DailyStat | null = null;

  last7Days.forEach((day) => {
    if (day.count > maxCount) {
      maxCount = day.count;
      maxDayObj = day;
    }
  });

  const totalWeeklyAyat = last7Days.reduce((acc, d) => acc + d.count, 0);
  const dailyAverage = (totalWeeklyAyat / 7).toFixed(1);
  const daysMetGoalCount = last7Days.filter((d) => d.metGoal).length;
  const goalCompletionPercentage = Math.round((daysMetGoalCount / 7) * 100);

  // Full day name formatting (e.g. "Sunday" or "الأحد")
  const getFullDayName = (d: Date) => {
    return d.toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      weekday: 'long',
    });
  };

  const chartData = last7Days.map((day) => {
    const shortDay = day.date.toLocaleDateString(
      language === 'ar' ? 'ar-EG' : 'en-US',
      { weekday: 'short', month: 'numeric', day: 'numeric' }
    );
    const isMaxDay = maxCount > 0 && day.count === maxCount;

    return {
      dayLabel: shortDay,
      fullDayName: getFullDayName(day.date),
      ayat: day.count,
      target: dailyGoal,
      isMaxDay,
      metGoal: day.metGoal,
    };
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-100 dark:border-slate-800 space-y-6"
    >
      {/* Title Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl text-white shadow-md">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-400">
              {t('weeklyReportTitle')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('weeklyReportSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-slate-700">
          <CalendarDays className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
            Last 7 Days Analysis
          </span>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Most Productive Day Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/80 dark:from-amber-950/40 dark:to-orange-950/20 border border-amber-200/80 dark:border-amber-800/50 space-y-1 relative overflow-hidden">
          <div className="flex justify-between items-center text-amber-800 dark:text-amber-300">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('mostProductiveDay')}
            </span>
            <Flame className="w-4 h-4 fill-amber-500 text-amber-600" />
          </div>
          <p className="text-lg font-black text-amber-950 dark:text-amber-200">
            {maxDayObj && maxCount > 0
              ? getFullDayName(maxDayObj.date)
              : 'N/A'}
          </p>
          <span className="text-xs text-amber-700 dark:text-amber-400 font-medium block">
            {maxCount > 0
              ? `${maxCount} ${t('ayat')}`
              : t('noActivityNote')}
          </span>
        </div>

        {/* 7-Day Total */}
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-800/80 border border-emerald-100 dark:border-slate-700 space-y-1">
          <div className="flex justify-between items-center text-emerald-700 dark:text-emerald-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('weeklyTotalAyat')}
            </span>
            <Sparkles className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-emerald-900 dark:text-emerald-200">
            {totalWeeklyAyat}
          </p>
          <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">
            {t('ayat')} {t('memorized')}
          </span>
        </div>

        {/* Daily Average */}
        <div className="p-4 rounded-2xl bg-teal-50/70 dark:bg-slate-800/80 border border-teal-100 dark:border-slate-700 space-y-1">
          <div className="flex justify-between items-center text-teal-700 dark:text-teal-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('dailyAverage')}
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-teal-900 dark:text-teal-200">
            {dailyAverage}
          </p>
          <span className="text-xs text-teal-700 dark:text-teal-400 font-medium block">
            {t('ayat')} / {t('day')}
          </span>
        </div>

        {/* Goal Completion Rate */}
        <div className="p-4 rounded-2xl bg-sky-50/70 dark:bg-slate-800/80 border border-sky-100 dark:border-slate-700 space-y-1">
          <div className="flex justify-between items-center text-sky-700 dark:text-sky-400">
            <span className="text-xs font-bold uppercase tracking-wider">
              {t('goalCompletionRate')}
            </span>
            <Target className="w-4 h-4" />
          </div>
          <p className="text-2xl font-black text-sky-900 dark:text-sky-200">
            {goalCompletionPercentage}%
          </p>
          <span className="text-xs text-sky-700 dark:text-sky-400 font-medium block">
            {daysMetGoalCount} / 7 {t('days')} {t('metGoal')}
          </span>
        </div>
      </div>

      {/* Productive Highlight Banner */}
      {maxDayObj && maxCount > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-emerald-500/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl flex items-center gap-3">
          <Award className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <p className="text-xs sm:text-sm font-semibold text-amber-950 dark:text-amber-200">
            {t('productivePeakNote')
              .replace('{day}', getFullDayName(maxDayObj.date))
              .replace('{count}', maxCount.toString())}
          </p>
        </div>
      )}

      {/* Recharts Bar & Target Chart */}
      <div className="pt-2">
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{ top: 15, right: 15, left: -15, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis
                dataKey="dayLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748b', fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '16px',
                  border: 'none',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
                  fontSize: '13px',
                }}
                formatter={(value: any, name: string) => [
                  `${value} ${t('ayat')}`,
                  name === 'ayat' ? t('memorizedBar') : t('dailyTargetLine'),
                ]}
                labelFormatter={(label, items) => {
                  if (items && items.length > 0 && items[0].payload) {
                    return `${items[0].payload.fullDayName} (${label})`;
                  }
                  return label;
                }}
              />
              <Legend
                formatter={(value) =>
                  value === 'ayat' ? t('memorizedBar') : t('dailyTargetLine')
                }
                wrapperStyle={{ paddingTop: '12px' }}
              />

              {/* Bar for Daily Ayat */}
              <Bar dataKey="ayat" radius={[10, 10, 0, 0]} maxBarSize={48}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.isMaxDay
                        ? '#f59e0b' // Amber/Gold for peak productive day
                        : entry.metGoal
                        ? '#10b981' // Vibrant Emerald
                        : '#34d399' // Light Emerald
                    }
                  />
                ))}
              </Bar>

              {/* Line for Target Threshold */}
              <Line
                type="monotone"
                dataKey="target"
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  );
};
