import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { UserAchievement } from '../types';
import { useLanguage } from '../LanguageContext';
import {
  Trophy,
  Flame,
  Target,
  BookOpen,
  Clock,
  CheckCircle2,
  Lock,
  Award,
  PenTool,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';

interface AchievementDef {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  getRatio: (userStats: UserStats) => { current: number; max: number };
}

interface UserStats {
  streak: number;
  totalCorrect: number;
  totalMistakes: number;
  sessionsCount: number;
  hasPerfectScore: boolean;
  journalCount: number;
  reminderEnabled: boolean;
}

const BADGES: AchievementDef[] = [
  {
    id: 'first_quiz',
    titleKey: 'ach_first_quiz_title',
    descKey: 'ach_first_quiz_desc',
    icon: Zap,
    iconColor: 'text-amber-500 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60',
    getRatio: (s) => ({ current: Math.min(1, s.sessionsCount), max: 1 }),
  },
  {
    id: 'perfect_score',
    titleKey: 'ach_perfect_score_title',
    descKey: 'ach_perfect_score_desc',
    icon: Target,
    iconColor: 'text-emerald-500 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60',
    getRatio: (s) => ({ current: s.hasPerfectScore ? 1 : 0, max: 1 }),
  },
  {
    id: 'streak_3',
    titleKey: 'ach_streak_3_title',
    descKey: 'ach_streak_3_desc',
    icon: Flame,
    iconColor: 'text-orange-500 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800/60',
    getRatio: (s) => ({ current: Math.min(3, s.streak), max: 3 }),
  },
  {
    id: 'streak_10',
    titleKey: 'ach_streak_10_title',
    descKey: 'ach_streak_10_desc',
    icon: Flame,
    iconColor: 'text-red-500 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-800/60',
    getRatio: (s) => ({ current: Math.min(10, s.streak), max: 10 }),
  },
  {
    id: 'ayat_50',
    titleKey: 'ach_ayat_50_title',
    descKey: 'ach_ayat_50_desc',
    icon: BookOpen,
    iconColor: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60',
    getRatio: (s) => ({ current: Math.min(50, s.totalCorrect), max: 50 }),
  },
  {
    id: 'ayat_500',
    titleKey: 'ach_ayat_500_title',
    descKey: 'ach_ayat_500_desc',
    icon: Trophy,
    iconColor: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60',
    getRatio: (s) => ({ current: Math.min(500, s.totalCorrect), max: 500 }),
  },
  {
    id: 'journal_reflect',
    titleKey: 'ach_journal_reflect_title',
    descKey: 'ach_journal_reflect_desc',
    icon: PenTool,
    iconColor: 'text-teal-500 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/60',
    getRatio: (s) => ({ current: Math.min(1, s.journalCount), max: 1 }),
  },
  {
    id: 'reminder_set',
    titleKey: 'ach_reminder_set_title',
    descKey: 'ach_reminder_set_desc',
    icon: Clock,
    iconColor: 'text-indigo-500 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/60',
    getRatio: (s) => ({ current: s.reminderEnabled ? 1 : 0, max: 1 }),
  },
];

export const Achievements: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [unlockedMap, setUnlockedMap] = useState<Record<string, UserAchievement>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Listen to real-time achievements subcollection
    const achievementsRef = collection(db, 'users', user.uid, 'achievements');
    const unsubscribe = onSnapshot(achievementsRef, (snapshot) => {
      const map: Record<string, UserAchievement> = {};
      snapshot.docs.forEach((d) => {
        const data = d.data() as UserAchievement;
        map[data.achievementId] = data;
      });
      setUnlockedMap(map);
    });

    // Evaluate current user stats and auto-unlock achievements in Firestore
    const evaluateAchievements = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};

        const sessionsSnap = await getDocs(collection(db, 'users', user.uid, 'sessions'));
        let hasPerfect = false;
        sessionsSnap.docs.forEach((sDoc) => {
          const sData = sDoc.data();
          if (sData.correctCount > 0 && sData.mistakeCount === 0) {
            hasPerfect = true;
          }
        });

        const journalSnap = await getDocs(collection(db, 'users', user.uid, 'journal'));

        const stats: UserStats = {
          streak: userData.streak || 0,
          totalCorrect: userData.totalCorrect || 0,
          totalMistakes: userData.totalMistakes || 0,
          sessionsCount: sessionsSnap.size,
          hasPerfectScore: hasPerfect,
          journalCount: journalSnap.size,
          reminderEnabled: Boolean(userData.reminderEnabled),
        };

        const now = new Date().toISOString();

        for (const badge of BADGES) {
          const ratio = badge.getRatio(stats);
          const isEligible = ratio.current >= ratio.max;

          if (isEligible) {
            const achDocRef = doc(db, 'users', user.uid, 'achievements', badge.id);
            const existing = await getDoc(achDocRef);
            if (!existing.exists()) {
              await setDoc(achDocRef, {
                userId: user.uid,
                achievementId: badge.id,
                unlocked: true,
                unlockedAt: now,
              });
            }
          }
        }
      } catch (err) {
        console.error('Error evaluating achievements:', err);
      } finally {
        setLoading(false);
      }
    };

    evaluateAchievements();

    return () => unsubscribe();
  }, [user]);

  const totalUnlocked = Object.keys(unlockedMap).length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-50 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/80 rounded-2xl text-amber-600 dark:text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
              {t('achievementsTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('achievementsSubtitle')}
            </p>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-slate-800 px-4 py-2 rounded-2xl border border-emerald-100 dark:border-slate-700">
          <span className="text-xs text-gray-500 dark:text-slate-400 font-medium block">
            {t('badgesEarned')}
          </span>
          <span className="text-lg font-bold text-emerald-800 dark:text-emerald-300">
            {totalUnlocked} / {BADGES.length}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {BADGES.map((badge) => {
          const unlockedItem = unlockedMap[badge.id];
          const isUnlocked = Boolean(unlockedItem?.unlocked);
          const IconComponent = badge.icon;

          return (
            <motion.div
              key={badge.id}
              whileHover={{ scale: 1.02 }}
              className={`p-5 rounded-2xl border transition-all relative flex flex-col justify-between space-y-4 ${
                isUnlocked
                  ? `${badge.bgColor} shadow-sm`
                  : 'bg-gray-50/70 dark:bg-slate-800/30 border-gray-100 dark:border-slate-800 opacity-70'
              }`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`p-3 rounded-xl ${
                    isUnlocked
                      ? 'bg-white dark:bg-slate-900 shadow-xs'
                      : 'bg-gray-200 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
                  }`}
                >
                  <IconComponent className={`w-6 h-6 ${isUnlocked ? badge.iconColor : ''}`} />
                </div>

                {isUnlocked ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    {t('unlockedAt')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-gray-200 text-gray-600 dark:bg-slate-800 dark:text-slate-400">
                    <Lock className="w-3 h-3" />
                    {t('locked')}
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-gray-900 dark:text-slate-100 text-base">
                  {t(badge.titleKey as any)}
                </h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {t(badge.descKey as any)}
                </p>
              </div>

              {unlockedItem?.unlockedAt && (
                <div className="text-[10px] text-gray-400 dark:text-slate-500 pt-2 border-t border-black/5 dark:border-white/5">
                  {new Date(unlockedItem.unlockedAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
