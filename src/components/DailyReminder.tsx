import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useLanguage } from '../LanguageContext';
import { Bell, BellOff, Clock, Check, Send, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const DailyReminder: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    } else {
      setNotificationPermission('unsupported');
    }

    if (!user) return;

    const fetchUserReminder = async () => {
      try {
        const userRef = doc(db, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const data = snap.data();
          if (data.reminderEnabled !== undefined) {
            setEnabled(Boolean(data.reminderEnabled));
          }
          if (data.reminderTime) {
            setReminderTime(data.reminderTime);
          }
        }
      } catch (err) {
        console.error('Error fetching user reminder settings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReminder();
  }, [user]);

  // Periodic check to trigger local browser notification if time matches
  useEffect(() => {
    if (!enabled || !reminderTime) return;

    const checkInterval = setInterval(() => {
      if (!('Notification' in window) || Notification.permission !== 'granted') return;

      const now = new Date();
      const currentFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (currentFormatted === reminderTime) {
        const lastNotified = localStorage.getItem(`last_reminder_notified_${user?.uid}`);
        const todayStr = now.toDateString();

        if (lastNotified !== todayStr) {
          localStorage.setItem(`last_reminder_notified_${user?.uid}`, todayStr);
          new Notification('حافظ - Hafiz Quran Memorization', {
            body: t('testNotificationSent') || 'Time for your daily Quran memorization practice!',
            icon: '/favicon.ico',
          });
        }
      }
    }, 30000); // check every 30s

    return () => clearInterval(checkInterval);
  }, [enabled, reminderTime, user, t]);

  const requestPermissionIfNeeded = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      } catch (err) {
        console.warn('Notification permission request failed:', err);
      }
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    setSavedSuccess(false);

    try {
      if (enabled) {
        await requestPermissionIfNeeded();
      }

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        reminderEnabled: enabled,
        reminderTime: reminderTime,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving reminder preferences:', err);
    } finally {
      setSaving(false);
    }
  };

  const sendTestNotification = async () => {
    setTestSent(false);
    if ('Notification' in window) {
      let perm = Notification.permission;
      if (perm === 'default') {
        perm = await Notification.requestPermission();
        setNotificationPermission(perm);
      }

      if (perm === 'granted') {
        new Notification('حافظ - Hafiz Daily Practice', {
          body: '🌙 Time for your daily Quran practice! Stay steadfast on your journey.',
          icon: '/favicon.ico',
        });
        setTestSent(true);
        setTimeout(() => setTestSent(false), 3000);
        return;
      }
    }
    // Fallback alert if in an iframe or permission denied
    alert('🌙 Hafiz Practice Reminder: Time for your daily Quran memorization session!');
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  if (loading) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-50 dark:border-slate-800 shadow-xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-2xl transition-colors ${enabled ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-400' : 'bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-400'}`}>
            {enabled ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
              {t('dailyReminderTitle')}
            </h2>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('dailyReminderSubtitle')}
            </p>
          </div>
        </div>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:after:border-slate-600 peer-checked:bg-emerald-600 dark:peer-checked:bg-emerald-500"></div>
        </label>
      </div>

      {/* Main Settings Panel */}
      <AnimatePresence>
        {enabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-6 pt-4 border-t border-emerald-50 dark:border-slate-800"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-200 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {t('reminderTimeLabel')}
                </label>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="w-full p-3 bg-emerald-50/50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 rounded-xl text-lg font-bold text-emerald-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-50/60 dark:bg-slate-800/60 p-4 rounded-2xl border border-emerald-100 dark:border-slate-700 space-y-1">
                <span className="text-xs text-emerald-800 dark:text-emerald-300 font-medium block">
                  {t('reminderActiveStatus')} <strong className="text-emerald-900 dark:text-emerald-200">{reminderTime}</strong>
                </span>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {notificationPermission === 'denied' || notificationPermission === 'unsupported' ? (
                    <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {t('notificationPermissionDenied')}
                    </span>
                  ) : (
                    'Browser notifications enabled for your practice time.'
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-3 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all shadow-md shadow-emerald-200 dark:shadow-none disabled:opacity-50"
              >
                {savedSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> {t('reminderSaved')}
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" /> {t('saveReminder')}
                  </>
                )}
              </button>

              <button
                onClick={sendTestNotification}
                type="button"
                className="px-5 py-3 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              >
                <Send className={`w-4 h-4 ${isRTL ? 'rotate-180' : ''}`} />
                {testSent ? t('testNotificationSent') : t('testNotification')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
