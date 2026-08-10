import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Target, Edit2, Check, Sparkles, CheckCircle2, Flame } from 'lucide-react';
import { useLanguage } from '../LanguageContext';
import { useAuth } from '../AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface DailyMemorizationGoalProps {
  completedToday: number;
  dailyGoal: number;
  onGoalChange: (newGoal: number) => void;
}

const CircularProgressRing: React.FC<{
  current: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
}> = ({ current, goal, size = 130, strokeWidth = 12 }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.round((current / Math.max(1, goal)) * 100));
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const isGoalReached = current >= goal && goal > 0;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-emerald-100 dark:text-slate-800"
          fill="transparent"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#progressGradientGoal)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          strokeLinecap="round"
          fill="transparent"
        />
        <defs>
          <linearGradient id="progressGradientGoal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={isGoalReached ? '#f59e0b' : '#059669'} />
            <stop offset="100%" stopColor={isGoalReached ? '#fbbf24' : '#10b981'} />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center p-2">
        <span
          className={`text-2xl font-black tracking-tight ${
            isGoalReached
              ? 'text-amber-500 dark:text-amber-400'
              : 'text-emerald-900 dark:text-emerald-400'
          }`}
        >
          {percentage}%
        </span>
        <span className="text-[10px] font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider">
          {current}/{goal}
        </span>
      </div>
    </div>
  );
};

export const DailyMemorizationGoal: React.FC<DailyMemorizationGoalProps> = ({
  completedToday,
  dailyGoal,
  onGoalChange,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [goalInput, setGoalInput] = useState(dailyGoal.toString());

  const isGoalReached = completedToday >= dailyGoal && dailyGoal > 0;
  const remainingAyat = Math.max(0, dailyGoal - completedToday);

  const handleSave = async (newVal?: number) => {
    const val = newVal ?? Math.max(1, Math.min(100, parseInt(goalInput, 10) || 10));
    onGoalChange(val);
    setGoalInput(val.toString());
    localStorage.setItem('hafiz_daily_goal', val.toString());
    setIsEditing(false);

    if (user) {
      try {
        await updateDoc(doc(db, 'users', user.uid), { dailyGoal: val });
      } catch (err) {
        console.error('Error updating daily goal in Firestore:', err);
      }
    }
  };

  const handlePresetSelect = (preset: number) => {
    handleSave(preset);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-emerald-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden"
    >
      {/* Background ambient accent */}
      <div className="absolute -right-12 -bottom-12 w-40 h-40 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-2xl pointer-events-none" />

      {/* Ring + Goal Info */}
      <div className="flex items-center gap-6 flex-1 w-full sm:w-auto">
        <CircularProgressRing current={completedToday} goal={dailyGoal} size={135} strokeWidth={12} />

        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="p-2 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 rounded-xl">
              <Target className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-300">
              {t('dailyGoal')}
            </h2>
          </div>

          <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed max-w-sm">
            {t('dailyGoalDesc')}
          </p>

          <div className="pt-1 flex items-center gap-3 flex-wrap">
            <span className="text-lg font-extrabold text-emerald-900 dark:text-emerald-300">
              {completedToday} / {dailyGoal} {t('ayat')}
            </span>

            {isGoalReached ? (
              <span className="px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold text-xs rounded-full border border-amber-200 dark:border-amber-800/80 flex items-center gap-1.5 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>{t('goalReached')}</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-100 dark:border-slate-700">
                {remainingAyat} {t('ayat')} remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Goal Setting Controls */}
      <div className="bg-emerald-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-emerald-100/60 dark:border-slate-700/60 w-full md:w-auto flex flex-col items-center md:items-end gap-3 shrink-0">
        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{t('targetGoal')}</span>
        </span>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={100}
              value={goalInput}
              onChange={(e) => setGoalInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSave()}
              className="w-20 p-2 text-center bg-white dark:bg-slate-900 border border-emerald-300 dark:border-slate-700 rounded-xl font-bold text-emerald-900 dark:text-emerald-300 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              autoFocus
            />
            <button
              onClick={() => handleSave()}
              className="p-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
              title={t('saveGoal')}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-2xl font-black text-emerald-900 dark:text-emerald-300">
              {dailyGoal} <span className="text-xs font-medium text-gray-500 dark:text-slate-400">{t('ayat')}</span>
            </span>
            <button
              onClick={() => {
                setGoalInput(dailyGoal.toString());
                setIsEditing(true);
              }}
              className="p-2 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              title={t('editGoal')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Quick Presets */}
        <div className="flex items-center gap-1.5 pt-1">
          {[5, 10, 15, 20, 30].map((preset) => (
            <button
              key={preset}
              onClick={() => handlePresetSelect(preset)}
              className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                dailyGoal === preset
                  ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 shadow-xs'
                  : 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-slate-700 hover:bg-emerald-100 dark:hover:bg-slate-800'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
