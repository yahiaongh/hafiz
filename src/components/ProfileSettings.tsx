import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateProfile as updateAuthProfile } from 'firebase/auth';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import {
  User,
  Mail,
  Target,
  Globe,
  Sun,
  Moon,
  Check,
  Save,
  Flame,
  Award,
  Calendar,
  Sparkles,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProfileSettings: React.FC = () => {
  const { user, profile } = useAuth();
  const { t, language, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [displayName, setDisplayName] = useState('');
  const [dailyGoal, setDailyGoal] = useState<number>(10);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          setDisplayName(data.displayName || user.displayName || '');
          if (data.dailyGoal) {
            setDailyGoal(Number(data.dailyGoal));
          }
        } else {
          setDisplayName(user.displayName || '');
        }
      } catch (err) {
        console.error('Error loading user settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Update Firestore user doc
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        dailyGoal: Number(dailyGoal),
      });

      // 2. Update Auth display name
      if (auth.currentUser && displayName.trim()) {
        await updateAuthProfile(auth.currentUser, {
          displayName: displayName.trim(),
        });
      }

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update profile settings:', err);
    } finally {
      setSaving(false);
    }
  };

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Recently';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
        <Sparkles className="w-6 h-6 mr-2 animate-spin" />
        Loading settings...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3.5 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl text-emerald-700 dark:text-emerald-400">
          <Settings className="w-7 h-7" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">
            {t('profileSettingsTitle')}
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('profileSettingsSubtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account Summary Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-50 dark:border-slate-800 shadow-xl space-y-6 flex flex-col justify-between"
        >
          <div className="text-center space-y-4">
            <div className="relative inline-block">
              {profile?.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={displayName || 'User'}
                  className="w-24 h-24 rounded-full mx-auto border-4 border-emerald-500 shadow-md object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center mx-auto text-3xl font-extrabold shadow-lg shadow-emerald-200 dark:shadow-none">
                  {(displayName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              )}
              <span className="absolute bottom-1 right-1 p-1.5 bg-emerald-500 text-white rounded-full border-2 border-white dark:border-slate-900 shadow-sm" title="Verified Account">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {displayName || user?.displayName || 'Hafiz Student'}
              </h2>
              <p className="text-xs text-gray-400 dark:text-slate-500 font-mono mt-0.5">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-emerald-50 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-500">
              {t('profileSummaryTitle')}
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-amber-50 dark:bg-amber-950/40 p-3.5 rounded-2xl border border-amber-100 dark:border-amber-900/40 text-center">
                <Flame className="w-5 h-5 text-amber-500 mx-auto mb-1 fill-amber-500" />
                <span className="text-lg font-extrabold text-amber-800 dark:text-amber-300 block">
                  {profile?.streak || 0}
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  {t('streak')}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 text-center">
                <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
                <span className="text-lg font-extrabold text-emerald-800 dark:text-emerald-300 block">
                  {profile?.totalCorrect || 0}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  {t('totalAyat')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 pt-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{t('memberSince')}: <strong>{joinDate}</strong></span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Settings Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-50 dark:border-slate-800 shadow-xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name Input */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('displayNameLabel')}
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your Name"
                className="w-full p-3.5 bg-gray-50/80 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-gray-900 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                maxLength={50}
                required
              />
            </div>

            {/* Email Field (Read Only) */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-3.5 bg-gray-100 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 rounded-2xl text-gray-500 dark:text-slate-400 font-medium cursor-not-allowed"
              />
            </div>

            {/* Daily Goal Target Select */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                {t('dailyGoalLabel')}
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[5, 10, 15, 20].map((goalOption) => (
                  <button
                    key={goalOption}
                    type="button"
                    onClick={() => setDailyGoal(goalOption)}
                    className={`py-3 px-2 rounded-2xl text-sm font-bold border transition-all ${
                      dailyGoal === goalOption
                        ? 'bg-emerald-600 text-white border-emerald-600 dark:bg-emerald-500 dark:border-emerald-500 shadow-md shadow-emerald-200 dark:shadow-none'
                        : 'bg-gray-50 dark:bg-slate-800 text-gray-700 dark:text-slate-300 border-gray-200 dark:border-slate-700 hover:border-emerald-300'
                    }`}
                  >
                    {goalOption} <span className="text-[11px] font-normal block">{t('ayatPerDay')}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* App Language & Theme Quick Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('appLanguageLabel')}
                </label>
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between hover:border-emerald-400 transition-all"
                >
                  <span>{language === 'en' ? 'English (🇺🇸)' : 'العربية (🇸🇦)'}</span>
                  <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">Switch</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="w-4 h-4 text-amber-500" />
                  ) : (
                    <Moon className="w-4 h-4 text-amber-400" />
                  )}
                  {t('appThemeLabel')}
                </label>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-gray-800 dark:text-slate-200 flex items-center justify-between hover:border-emerald-400 transition-all"
                >
                  <span className="capitalize">{theme} Theme</span>
                  <span className="text-xs font-normal text-emerald-600 dark:text-emerald-400">Toggle</span>
                </button>
              </div>
            </div>

            {/* Submit Action Button */}
            <div className="pt-4 border-t border-emerald-50 dark:border-slate-800 flex items-center justify-end">
              <button
                type="submit"
                disabled={saving || !displayName.trim()}
                className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-lg shadow-emerald-200 dark:shadow-none disabled:opacity-50 transition-all"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-5 h-5" />
                    {t('profileSaved')}
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {t('saveChanges')}
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};
