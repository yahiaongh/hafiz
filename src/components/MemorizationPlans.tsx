import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  Calendar,
  Zap,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
  Clock,
  Target,
  Check,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

export interface Plan {
  id: string;
  titleKey: string;
  descKey: string;
  dailyGoal: number;
  durationDays: number;
  levelKey: 'beginner' | 'intermediate' | 'advanced';
  iconColor: string;
  badgeBg: string;
  milestones: {
    period: string;
    targetText: string;
    ayatRange: string;
  }[];
}

const MEMORIZATION_PLANS: Plan[] = [
  {
    id: 'juz-amma-30',
    titleKey: 'juzAmma30Title',
    descKey: 'juzAmma30Desc',
    dailyGoal: 19,
    durationDays: 30,
    levelKey: 'beginner',
    iconColor: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
    milestones: [
      { period: 'Week 1 (Days 1–7)', targetText: "An-Naas to At-Takathur (17 Short Surahs)", ayatRange: "128 Ayat" },
      { period: 'Week 2 (Days 8–14)', targetText: "Al-Qari'ah to Al-Inshirah (10 Surahs)", ayatRange: "115 Ayat" },
      { period: 'Week 3 (Days 15–21)', targetText: "Ad-Duha to Al-Inshiqaq (6 Surahs)", ayatRange: "125 Ayat" },
      { period: 'Week 4 (Days 22–30)', targetText: "Al-Mutaffifin to An-Naba (4 Long Surahs)", ayatRange: "196 Ayat" },
    ],
  },
  {
    id: 'mulk-10',
    titleKey: 'mulk10Title',
    descKey: 'mulk10Desc',
    dailyGoal: 3,
    durationDays: 10,
    levelKey: 'beginner',
    iconColor: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    milestones: [
      { period: 'Day 1–3', targetText: "Ayat 1 to 9 (Power & Creation of Heavens)", ayatRange: "9 Ayat" },
      { period: 'Day 4–6', targetText: "Ayat 10 to 18 (Warnings & Secret Knowledge)", ayatRange: "9 Ayat" },
      { period: 'Day 7–9', targetText: "Ayat 19 to 27 (Signs in Flying Birds & Provision)", ayatRange: "9 Ayat" },
      { period: 'Day 10', targetText: "Ayat 28 to 30 (Water of Life & Final Consolidation)", ayatRange: "3 Ayat" },
    ],
  },
  {
    id: 'kahf-15',
    titleKey: 'kahf15Title',
    descKey: 'kahf15Desc',
    dailyGoal: 8,
    durationDays: 15,
    levelKey: 'intermediate',
    iconColor: 'from-sky-500 to-blue-600',
    badgeBg: 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300',
    milestones: [
      { period: 'Days 1–4', targetText: "Story of the People of the Cave (Ayat 1–31)", ayatRange: "31 Ayat" },
      { period: 'Days 5–8', targetText: "Story of the Two Gardens & Wealth Parable (Ayat 32–59)", ayatRange: "28 Ayat" },
      { period: 'Days 9–12', targetText: "Story of Prophet Musa & Al-Khidr (Ayat 60–82)", ayatRange: "23 Ayat" },
      { period: 'Days 13–15', targetText: "Story of Dhul-Qarnayn & Conclusion (Ayat 83–110)", ayatRange: "28 Ayat" },
    ],
  },
  {
    id: 'baqarah-60',
    titleKey: 'baqarah60Title',
    descKey: 'baqarah60Desc',
    dailyGoal: 5,
    durationDays: 60,
    levelKey: 'intermediate',
    iconColor: 'from-indigo-500 to-purple-600',
    badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    milestones: [
      { period: 'Month 1 (Juz 1)', targetText: "Ayat 1 to 141 (Guidance, Adam, Children of Israel)", ayatRange: "141 Ayat" },
      { period: 'Month 2 (Juz 2)', targetText: "Ayat 142 to 286 (Qiblah, Fasting, Hajj, Ayatul Kursi)", ayatRange: "145 Ayat" },
    ],
  },
  {
    id: 'full-quran-2years',
    titleKey: 'fullQuran2YearsTitle',
    descKey: 'fullQuran2YearsDesc',
    dailyGoal: 9,
    durationDays: 730,
    levelKey: 'advanced',
    iconColor: 'from-purple-500 to-pink-600',
    badgeBg: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
    milestones: [
      { period: 'Months 1–6', targetText: "Juz 30 down to Juz 25 (120 Pages)", ayatRange: "~1500 Ayat" },
      { period: 'Months 7–12', targetText: "Juz 24 down to Juz 19 (120 Pages)", ayatRange: "~1500 Ayat" },
      { period: 'Months 13–18', targetText: "Juz 18 down to Juz 10 (160 Pages)", ayatRange: "~1700 Ayat" },
      { period: 'Months 19–24', targetText: "Juz 9 down to Juz 1 (Surah Al-Baqarah finish)", ayatRange: "~1500 Ayat" },
    ],
  },
];

interface MemorizationPlansProps {
  currentDailyGoal: number;
  onSelectPlanGoal: (goal: number, planTitle: string) => void;
}

export const MemorizationPlans: React.FC<MemorizationPlansProps> = ({
  currentDailyGoal,
  onSelectPlanGoal,
}) => {
  const { t } = useLanguage();
  const [activePlanId, setActivePlanId] = useState<string>(() => {
    return localStorage.getItem('hafiz_active_plan_id') || 'juz-amma-30';
  });
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleActivatePlan = (plan: Plan) => {
    setActivePlanId(plan.id);
    localStorage.setItem('hafiz_active_plan_id', plan.id);
    onSelectPlanGoal(plan.dailyGoal, t(plan.titleKey as any));

    const msg = t('planActiveSuccess').replace('{goal}', plan.dailyGoal.toString());
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl shadow-lg border border-emerald-100 dark:border-slate-800 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl text-white shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-emerald-950 dark:text-emerald-400">
              {t('memorizationPlansTitle')}
            </h2>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('memorizationPlansSubtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-slate-800 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-slate-700">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
            5 Guided Pathways
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-emerald-500 text-white rounded-2xl flex items-center gap-3 shadow-md font-semibold text-xs sm:text-sm"
          >
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MEMORIZATION_PLANS.map((plan) => {
          const isActive = activePlanId === plan.id;
          const isExpanded = expandedPlanId === plan.id;

          return (
            <motion.div
              key={plan.id}
              whileHover={{ y: -3 }}
              transition={{ duration: 0.2 }}
              className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                isActive
                  ? 'bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white dark:from-slate-800 dark:to-slate-900 border-emerald-400 dark:border-emerald-500 shadow-md ring-2 ring-emerald-400/30'
                  : 'bg-white dark:bg-slate-900/80 border-gray-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 shadow-xs'
              }`}
            >
              <div className="space-y-3">
                {/* Top Badge & Level */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${plan.badgeBg}`}
                  >
                    {t(plan.levelKey as any)}
                  </span>

                  {isActive && (
                    <span className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-extrabold rounded-full flex items-center gap-1 shadow-xs">
                      <Check className="w-3 h-3" /> {t('activePlan')}
                    </span>
                  )}
                </div>

                {/* Plan Title & Description */}
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                    {t(plan.titleKey as any)}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {t(plan.descKey as any)}
                  </p>
                </div>

                {/* Stat Pills */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2">
                    <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">
                        {t('dailySchedule')}
                      </span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {plan.dailyGoal} {t('ayat')} / {t('day')}
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                    <div>
                      <span className="text-[10px] text-gray-400 block uppercase font-bold">
                        {t('targetDuration')}
                      </span>
                      <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                        {plan.durationDays}{' '}
                        {plan.durationDays > 30
                          ? plan.durationDays >= 365
                            ? 'Years'
                            : 'Days'
                          : 'Days'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-slate-800">
                <button
                  onClick={() => handleActivatePlan(plan)}
                  disabled={isActive}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 opacity-90 cursor-default'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>{isActive ? t('activePlan') : t('activatePlan')}</span>
                </button>

                <button
                  onClick={() =>
                    setExpandedPlanId(isExpanded ? null : plan.id)
                  }
                  className="w-full py-1.5 text-xs text-gray-500 hover:text-emerald-700 dark:text-slate-400 dark:hover:text-emerald-300 font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <span>
                    {isExpanded ? t('hideSchedule') : t('viewSchedule')}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              {/* Schedule Breakdown Dropdown */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-2 space-y-2 border-t border-emerald-100 dark:border-slate-800 overflow-hidden"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                      Milestone Breakdown
                    </p>
                    <div className="space-y-1.5 text-xs">
                      {plan.milestones.map((m, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 flex justify-between items-start gap-2 text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-emerald-700 dark:text-emerald-400 block">
                              {m.period}
                            </span>
                            <span className="text-slate-600 dark:text-slate-300">
                              {m.targetText}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-md whitespace-nowrap">
                            {m.ayatRange}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};
