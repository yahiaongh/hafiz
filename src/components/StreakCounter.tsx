import React from 'react';
import { motion } from 'motion/react';
import { Flame, Award, Crown, CheckCircle2, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface StreakCounterProps {
  activeStreak: number;
  isGoalReachedToday: boolean;
  last7Days: Array<{
    dateStr: string;
    dayLabel: string;
    count: number;
    metGoal: boolean;
    isToday: boolean;
  }>;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({
  activeStreak,
  isGoalReachedToday,
  last7Days,
}) => {
  const { t } = useLanguage();

  const is7DayUnlocked = activeStreak >= 7;
  const is30DayUnlocked = activeStreak >= 30;

  const progress7Day = Math.min(100, Math.round((activeStreak / 7) * 100));
  const progress30Day = Math.min(100, Math.round((activeStreak / 30) * 100));

  const daysNeededFor7 = Math.max(0, 7 - activeStreak);
  const daysNeededFor30 = Math.max(0, 30 - activeStreak);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-600 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden flex flex-col gap-6"
    >
      {/* Background ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner: Main Streak Count */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-lg border border-white/30"
            >
              <Flame className="w-9 h-9 text-amber-200 fill-amber-300 drop-shadow-md" />
            </motion.div>
            {isGoalReachedToday && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-300 rounded-full flex items-center justify-center border-2 border-orange-500 text-orange-950 font-black text-[10px] shadow-sm animate-bounce">
                ✓
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-2xl text-white tracking-tight">
                {t('dailyStreakTitle')}
              </h3>
              {isGoalReachedToday && (
                <span className="px-2.5 py-0.5 bg-amber-300 text-amber-950 font-bold text-xs rounded-full shadow-xs">
                  {t('streakActive')}
                </span>
              )}
            </div>
            <p className="text-xs text-amber-100 font-medium pt-0.5">
              {isGoalReachedToday
                ? t('streakActive')
                : t('keepStreakAlive')}
            </p>
          </div>
        </div>

        <div className="bg-black/20 backdrop-blur-xs px-5 py-3 rounded-2xl border border-white/20 text-center sm:text-right shrink-0 self-stretch sm:self-auto flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
          <span className="text-3xl font-black tracking-tight text-white leading-none">
            {activeStreak}
          </span>
          <span className="text-[11px] font-bold block uppercase tracking-wider text-amber-100 pt-0.5">
            {activeStreak === 1 ? t('day') : t('days')} {t('streak')}
          </span>
        </div>
      </div>

      {/* 7-Day Visual Mini-Calendar Tracker */}
      <div className="bg-white/10 backdrop-blur-xs p-4 rounded-2xl border border-white/15 space-y-2">
        <div className="flex justify-between items-center text-xs text-amber-100 font-semibold px-1">
          <span>Last 7 Days</span>
          <span>{isGoalReachedToday ? 'Goal Completed Today 🎉' : 'Pending Today'}</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {last7Days.map((day, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5">
              <span className="text-[10px] font-bold text-amber-100/90 uppercase tracking-wider">
                {day.dayLabel}
              </span>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-xs ${
                  day.metGoal
                    ? 'bg-amber-300 text-amber-950 shadow-md ring-2 ring-amber-200/60 scale-105'
                    : day.isToday
                    ? 'border-2 border-dashed border-amber-200 bg-white/20 text-white animate-pulse'
                    : 'bg-black/25 text-white/40'
                }`}
              >
                {day.metGoal ? (
                  <Flame className="w-4 h-4 fill-amber-600 text-amber-700" />
                ) : (
                  <span>{day.count > 0 ? day.count : '•'}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Badges for 7-Day & 30-Day Milestones */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center gap-2 text-white font-bold text-sm">
          <ShieldCheck className="w-4 h-4 text-amber-200" />
          <span>{t('milestonesTitle')}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 7-Day Milestone Badge Card */}
          <div
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
              is7DayUnlocked
                ? 'bg-gradient-to-br from-amber-400/30 to-amber-600/30 border-amber-300 shadow-md'
                : 'bg-black/20 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    is7DayUnlocked
                      ? 'bg-amber-300 text-amber-950 shadow-md ring-2 ring-amber-200/50'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {t('milestone7Title')}
                  </h4>
                  <p className="text-[11px] text-amber-100/80 leading-snug">
                    {t('milestone7Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                {is7DayUnlocked ? (
                  <span className="text-amber-200 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {t('unlockedBadge')}
                  </span>
                ) : (
                  <span className="text-amber-100/90 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t('daysRemaining').replace('{days}', daysNeededFor7.toString())}
                  </span>
                )}
                <span className="text-amber-200 font-mono">{activeStreak}/7</span>
              </div>

              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress7Day}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    is7DayUnlocked ? 'bg-amber-300 shadow-sm' : 'bg-amber-400/80'
                  }`}
                />
              </div>
            </div>
          </div>

          {/* 30-Day Milestone Badge Card */}
          <div
            className={`p-4 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between space-y-3 ${
              is30DayUnlocked
                ? 'bg-gradient-to-br from-amber-300/30 to-amber-500/40 border-amber-200 shadow-lg ring-1 ring-amber-200/50'
                : 'bg-black/20 border-white/10'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    is30DayUnlocked
                      ? 'bg-gradient-to-br from-amber-200 to-amber-400 text-amber-950 shadow-md ring-2 ring-amber-100'
                      : 'bg-white/10 text-white/60'
                  }`}
                >
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
                    {t('milestone30Title')}
                  </h4>
                  <p className="text-[11px] text-amber-100/80 leading-snug">
                    {t('milestone30Desc')}
                  </p>
                </div>
              </div>
            </div>

            {/* Status & Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px] font-semibold">
                {is30DayUnlocked ? (
                  <span className="text-amber-200 font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" /> {t('unlockedBadge')}
                  </span>
                ) : (
                  <span className="text-amber-100/90 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    {t('daysRemaining').replace('{days}', daysNeededFor30.toString())}
                  </span>
                )}
                <span className="text-amber-200 font-mono">{activeStreak}/30</span>
              </div>

              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden p-0.5">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress30Day}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className={`h-full rounded-full ${
                    is30DayUnlocked ? 'bg-amber-300 shadow-sm' : 'bg-amber-400/80'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
