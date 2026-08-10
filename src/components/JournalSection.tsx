import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { JournalEntry } from '../types';
import { useLanguage } from '../LanguageContext';
import { BookMarked, PenTool, Trash2, Calendar, Send, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const MOODS = [
  { id: 'blessed', labelKey: 'moodBlessed', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' },
  { id: 'focused', labelKey: 'moodFocused', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border-blue-200 dark:border-blue-800' },
  { id: 'peaceful', labelKey: 'moodPeaceful', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border-teal-200 dark:border-teal-800' },
  { id: 'challenging', labelKey: 'moodChallenging', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800' },
] as const;

export const JournalSection: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string>('blessed');
  const [surahTag, setSurahTag] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const journalRef = collection(db, 'users', user.uid, 'journal');
    const q = query(journalRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: JournalEntry[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as JournalEntry[];
        setEntries(list);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading journal entries:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !content.trim()) return;

    setIsSubmitting(true);
    try {
      const now = new Date().toISOString();
      const journalRef = collection(db, 'users', user.uid, 'journal');
      
      const newEntry: Omit<JournalEntry, 'id'> = {
        userId: user.uid,
        date: new Date().toLocaleDateString(),
        content: content.trim(),
        mood: selectedMood,
        createdAt: now,
      };

      if (surahTag && !isNaN(Number(surahTag))) {
        newEntry.surahNumber = Number(surahTag);
      }

      await addDoc(journalRef, newEntry);
      setContent('');
      setSurahTag('');
    } catch (err) {
      console.error('Failed to save reflection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (entryId: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'journal', entryId));
    } catch (err) {
      console.error('Failed to delete reflection:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-emerald-50 dark:border-slate-800 shadow-xl space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl text-emerald-700 dark:text-emerald-400">
          <BookMarked className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-400">
            {t('journalTitle')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('journalSubtitle')}
          </p>
        </div>
      </div>

      {/* Write New Note Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-emerald-50/40 dark:bg-slate-800/50 p-5 rounded-2xl border border-emerald-100 dark:border-slate-700/60">
        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-emerald-900 dark:text-slate-200 flex items-center gap-2">
            <PenTool className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            {t('writeReflection')}
          </label>
        </div>

        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('placeholderJournal')}
          className="w-full p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none transition-all"
          maxLength={1000}
        />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-slate-400 font-medium">
              {t('selectMood')}:
            </span>
            <div className="flex gap-1.5 flex-wrap">
              {MOODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedMood(m.id)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium border transition-all ${
                    selectedMood === m.id
                      ? `${m.color} ring-2 ring-emerald-500 dark:ring-emerald-400 scale-105`
                      : 'bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-emerald-300'
                  }`}
                >
                  {t(m.labelKey as any)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="number"
              placeholder={t('optionalSurahTag')}
              value={surahTag}
              onChange={(e) => setSurahTag(e.target.value)}
              className="w-full sm:w-36 p-2 text-xs bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-emerald-500"
              min={1}
              max={114}
            />

            <button
              type="submit"
              disabled={isSubmitting || !content.trim()}
              className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 dark:hover:bg-emerald-600 disabled:opacity-50 transition-all shadow-md shadow-emerald-200 dark:shadow-none"
            >
              <Send className={`w-3.5 h-3.5 ${isRTL ? 'rotate-180' : ''}`} />
              {t('saveReflection')}
            </button>
          </div>
        </div>
      </form>

      {/* Past Journal Entries List */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8 text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
            <Sparkles className="w-5 h-5 mr-2 animate-spin" />
            Loading entries...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 px-4 bg-gray-50/50 dark:bg-slate-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 text-gray-400 dark:text-slate-500 text-sm">
            {t('noJournalEntries')}
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry) => {
              const moodObj = MOODS.find((m) => m.id === entry.mood) || MOODS[0];
              const entryDate = new Date(entry.createdAt).toLocaleDateString(undefined, {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white dark:bg-slate-900 border border-emerald-50 dark:border-slate-800 p-5 rounded-2xl space-y-3 hover:border-emerald-200 dark:hover:border-slate-700 transition-all shadow-sm"
                >
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-gray-600 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        {entryDate}
                      </span>
                      {entry.surahNumber && (
                        <span className="bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md text-[11px] font-semibold">
                          Surah #{entry.surahNumber}
                        </span>
                      )}
                      <span className={`px-2.5 py-0.5 rounded-full border text-[11px] font-medium ${moodObj.color}`}>
                        {t(moodObj.labelKey as any)}
                      </span>
                    </div>

                    <button
                      onClick={() => entry.id && handleDelete(entry.id)}
                      className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1.5 rounded-lg transition-colors"
                      title={t('deleteReflection')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-gray-800 dark:text-slate-200 text-sm whitespace-pre-wrap leading-relaxed font-sans">
                    {entry.content}
                  </p>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
