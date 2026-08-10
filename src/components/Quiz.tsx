import React, { useState, useEffect } from 'react';
import { Ayah, Surah, AyahProgress } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Home,
  Brain,
  AlertTriangle,
  Clock,
  Sparkles,
  Award,
  BookOpen,
  Mic,
} from 'lucide-react';
import {
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import {
  calculateNextSRS,
  calculateSRSPriority,
  SRSState,
  AyahSRSStatus,
} from '../utils/srs';
import { useLanguage } from '../LanguageContext';
import { quranService } from '../services/quranService';
import { AyahAudioPlayer } from './AyahAudioPlayer';
import { VoiceRecitationFeedback } from './VoiceRecitationFeedback';

interface QuizProps {
  surah: Surah;
  ayahs: Ayah[];
  mode: 'next-ayah' | 'fill-blank' | 'voice-recitation';
  onFinish: () => void;
}

interface QuizQueueItem {
  currentAyah: Ayah;
  nextAyah?: Ayah;
  srsStatus: AyahSRSStatus;
  priorityScore: number;
  daysUntilReview: number;
  progress?: Partial<AyahProgress>;
}

const Quiz: React.FC<QuizProps> = ({ surah, ayahs, mode, onFinish }) => {
  const { user } = useAuth();
  const { t, language, isRTL } = useLanguage();

  const [loadingProgress, setLoadingProgress] = useState(true);
  const [quizQueue, setQuizQueue] = useState<QuizQueueItem[]>([]);
  const [prioritizedCount, setPrioritizedCount] = useState(0);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [showSummary, setShowSummary] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [blankWord, setBlankWord] = useState('');
  const [displayAyah, setDisplayAyah] = useState('');
  const [showVoicePractice, setShowVoicePractice] = useState(false);

  const handleVoiceFeedbackComplete = (accuracy: number, isPassed: boolean) => {
    if (selectedOption || !currentAyah) return;
    setIsCorrect(isPassed);
    setSelectedOption(`Voice Recitation Accuracy: ${accuracy}%`);
    if (isPassed) setCorrectCount((c) => c + 1);
    else setMistakeCount((m) => m + 1);

    updateProgress(currentAyah.numberInSurah, isPassed);
  };

  // Initialize SRS Prioritized Quiz Queue
  useEffect(() => {
    let isMounted = true;

    const buildPrioritizedQueue = async () => {
      setLoadingProgress(true);
      try {
        const progressMap = new Map<number, AyahProgress>();

        if (user) {
          const progressRef = collection(db, 'users', user.uid, 'progress');
          const q = query(progressRef, where('surahNumber', '==', surah.number));
          const querySnap = await getDocs(q);
          querySnap.forEach((docSnap) => {
            const data = docSnap.data() as AyahProgress;
            progressMap.set(data.ayahNumber, data);
          });
        }

        // Fetch full surah ayahs so next-ayah mode options are complete
        let fullSurahAyahs: Ayah[] = [];
        try {
          fullSurahAyahs = await quranService.getSurahAyahs(surah.number);
        } catch {
          fullSurahAyahs = ayahs;
        }

        const ayahMap = new Map<number, Ayah>();
        fullSurahAyahs.forEach((a) => ayahMap.set(a.numberInSurah, a));

        let candidateAyahs = [...ayahs];
        if (mode === 'next-ayah') {
          // Filter to ayahs that have a subsequent Ayah in the Surah
          candidateAyahs = candidateAyahs.filter((a) =>
            ayahMap.has(a.numberInSurah + 1)
          );
        }

        const items: QuizQueueItem[] = candidateAyahs.map((a) => {
          const prog = progressMap.get(a.numberInSurah);
          const srs = calculateSRSPriority(prog);
          const nxt =
            mode === 'next-ayah'
              ? ayahMap.get(a.numberInSurah + 1)
              : undefined;

          return {
            currentAyah: a,
            nextAyah: nxt,
            srsStatus: srs.status,
            priorityScore: srs.priorityScore,
            daysUntilReview: srs.daysUntilReview,
            progress: prog,
          };
        });

        // Priority sort: Higher SRS Priority score comes first
        items.sort((a, b) => b.priorityScore - a.priorityScore);

        const weakOrDue = items.filter(
          (i) => i.srsStatus === 'weak' || i.srsStatus === 'due'
        ).length;

        if (isMounted) {
          setPrioritizedCount(weakOrDue);
          setQuizQueue(items);
        }
      } catch (err) {
        console.error('Failed to initialize SRS queue:', err);
        if (isMounted) {
          const fallback = ayahs.map((a, idx) => ({
            currentAyah: a,
            nextAyah: ayahs[idx + 1],
            srsStatus: 'new' as AyahSRSStatus,
            priorityScore: 50,
            daysUntilReview: 0,
          }));
          setQuizQueue(fallback);
        }
      } finally {
        if (isMounted) {
          setLoadingProgress(false);
        }
      }
    };

    buildPrioritizedQueue();

    return () => {
      isMounted = false;
    };
  }, [user, surah, ayahs, mode]);

  const currentItem = quizQueue[currentIndex];
  const currentAyah = currentItem?.currentAyah;
  const nextAyah = currentItem?.nextAyah;

  useEffect(() => {
    if (!currentItem || !currentAyah) return;

    if (mode === 'next-ayah' && nextAyah) {
      const otherAyahs = ayahs.filter(
        (a) => a.numberInSurah !== nextAyah.numberInSurah
      );
      const shuffled = [...otherAyahs]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      const allOptions = [...shuffled.map((a) => a.text), nextAyah.text].sort(
        () => 0.5 - Math.random()
      );
      setOptions(allOptions);
    } else if (mode === 'fill-blank') {
      const words = currentAyah.text.split(' ');
      const randomIndex = Math.floor(Math.random() * words.length);
      const word = words[randomIndex];
      setBlankWord(word);
      const newWords = [...words];
      newWords[randomIndex] = '_____';
      setDisplayAyah(newWords.join(' '));
    }
  }, [currentIndex, mode, currentItem, currentAyah, nextAyah, ayahs]);

  const handleOptionSelect = (option: string) => {
    if (selectedOption || !nextAyah || !currentAyah) return;
    setSelectedOption(option);
    const correct = option === nextAyah.text;
    setIsCorrect(correct);
    if (correct) setCorrectCount((c) => c + 1);
    else setMistakeCount((m) => m + 1);

    updateProgress(currentAyah.numberInSurah, correct);
  };

  const handleFillSubmit = () => {
    if (selectedOption || !currentAyah) return;
    const correct = userInput.trim() === blankWord.trim();
    setIsCorrect(correct);
    setSelectedOption(userInput);
    if (correct) setCorrectCount((c) => c + 1);
    else setMistakeCount((m) => m + 1);

    updateProgress(currentAyah.numberInSurah, correct);
  };

  const updateProgress = async (ayahNum: number, correct: boolean) => {
    if (!user) return;
    const progressId = `${surah.number}_${ayahNum}`;
    const progressRef = doc(db, 'users', user.uid, 'progress', progressId);

    try {
      const existingSnap = await getDoc(progressRef);
      let currentState: Partial<SRSState> = {};
      let prevCorrect = 0;
      let prevMistakes = 0;

      if (existingSnap.exists()) {
        const data = existingSnap.data();
        currentState = {
          interval: data.interval,
          repetition: data.repetition,
          easeFactor: data.easeFactor,
          nextReview: data.nextReview,
        };
        prevCorrect = data.correctCount || 0;
        prevMistakes = data.mistakeCount || 0;
      }

      const srsMetrics = calculateNextSRS(correct, currentState);

      await setDoc(
        progressRef,
        {
          userId: user.uid,
          surahNumber: surah.number,
          ayahNumber: ayahNum,
          correctCount: prevCorrect + (correct ? 1 : 0),
          mistakeCount: prevMistakes + (correct ? 0 : 1),
          lastAttempt: new Date().toISOString(),
          interval: srsMetrics.interval,
          repetition: srsMetrics.repetition,
          easeFactor: srsMetrics.easeFactor,
          nextReview: srsMetrics.nextReview,
        },
        { merge: true }
      );

      await updateDoc(doc(db, 'users', user.uid), {
        totalCorrect: increment(correct ? 1 : 0),
        totalMistakes: increment(correct ? 0 : 1),
        lastActive: new Date().toISOString(),
      });

      // Update current quiz item local SRS status
      setQuizQueue((prev) =>
        prev.map((item, idx) => {
          if (idx === currentIndex) {
            return {
              ...item,
              srsStatus: correct ? 'learning' : 'weak',
              daysUntilReview: srsMetrics.interval,
            };
          }
          return item;
        })
      );
    } catch (e) {
      console.error('Error updating SRS progress:', e);
    }
  };

  const handleNext = async () => {
    const isLast = currentIndex >= quizQueue.length - 1;

    if (isLast) {
      setShowSummary(true);
      if (user && quizQueue.length > 0) {
        await addDoc(collection(db, 'users', user.uid, 'sessions'), {
          userId: user.uid,
          surahNumber: surah.number,
          ayahRange: `${ayahs[0]?.numberInSurah || 0}-${
            ayahs[ayahs.length - 1]?.numberInSurah || 0
          }`,
          mode,
          correctCount,
          mistakeCount,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      setCurrentIndex((c) => c + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setUserInput('');
    }
  };

  if (loadingProgress) {
    return (
      <div className="max-w-2xl mx-auto p-12 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-emerald-50 dark:border-slate-800 space-y-4">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto animate-pulse">
          <Brain className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 dark:text-slate-100">
          {t('srsSchedulerTitle')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Analyzing your retention history & prioritizing weak Ayah segments...
        </p>
      </div>
    );
  }

  if (!currentItem || !currentAyah) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-emerald-50 dark:border-slate-800 space-y-4">
        <p className="text-gray-500 dark:text-slate-400">{t('noAyatFound')}</p>
        <button
          onClick={onFinish}
          className="px-6 py-2 bg-emerald-600 text-white rounded-xl font-bold"
        >
          {t('goBack')}
        </button>
      </div>
    );
  }

  if (showSummary) {
    const total = correctCount + mistakeCount;
    const accuracy = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-2xl border border-emerald-50 dark:border-slate-800 text-center space-y-8"
      >
        <div className="space-y-2">
          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/80 rounded-3xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">
            {t('sessionComplete')}
          </h2>
          <p className="text-gray-500 dark:text-slate-400">
            {t('greatJob')} {language === 'ar' ? surah.name : surah.englishName}.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/50 rounded-2xl">
            <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
              {t('correct')}
            </p>
            <p className="text-2xl font-bold text-emerald-900 dark:text-emerald-300">
              {correctCount}
            </p>
          </div>
          <div className="p-4 bg-red-50 dark:bg-red-950/50 rounded-2xl">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              {t('mistakes')}
            </p>
            <p className="text-2xl font-bold text-red-900 dark:text-red-300">
              {mistakeCount}
            </p>
          </div>
          <div className="p-4 bg-blue-50 dark:bg-blue-950/50 rounded-2xl">
            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
              {t('accuracy')}
            </p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {accuracy}%
            </p>
          </div>
        </div>

        {/* SRS Retention Summary Badge */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800/80 dark:to-slate-800 rounded-2xl border border-emerald-100 dark:border-slate-700 text-left rtl:text-right space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
            <Brain className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{t('srsSummaryTitle')}</span>
          </div>
          <p className="text-xs text-gray-600 dark:text-slate-300">
            Your review scores were saved using Spaced Repetition (SM-2). Correctly reviewed segments will be spaced out over longer intervals to strengthen long-term memory.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => window.location.reload()}
            className="flex-1 py-4 bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-slate-200 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" /> {t('practiceAgain')}
          </button>
          <button
            onClick={onFinish}
            className="flex-1 py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-lg shadow-emerald-100 dark:shadow-none transition-all cursor-pointer"
          >
            <Home className="w-5 h-5" /> {t('finish')}
          </button>
        </div>
      </motion.div>
    );
  }

  // Render Status Badge for current question
  const renderSRSStatusBadge = (status: AyahSRSStatus) => {
    switch (status) {
      case 'due':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 rounded-full text-xs font-bold border border-red-200 dark:border-red-900">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            {t('srsDueReview')}
          </span>
        );
      case 'weak':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 rounded-full text-xs font-bold border border-amber-200 dark:border-amber-900">
            <AlertTriangle className="w-3.5 h-3.5" />
            {t('srsWeakSegment')}
          </span>
        );
      case 'mastered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold border border-emerald-200 dark:border-emerald-900">
            <Award className="w-3.5 h-3.5" />
            {t('srsMastered')}
          </span>
        );
      case 'learning':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 rounded-full text-xs font-bold border border-sky-200 dark:border-sky-900">
            <BookOpen className="w-3.5 h-3.5" />
            {t('srsLearning')}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6 transition-colors duration-200">
      {/* SRS Prioritization Banner */}
      {prioritizedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50/90 dark:bg-slate-800/90 border border-emerald-200 dark:border-slate-700 rounded-2xl flex items-center gap-3 text-emerald-900 dark:text-emerald-300 text-xs font-semibold"
        >
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <Brain className="w-4 h-4" />
          </div>
          <div className="flex-1">
            <span className="font-bold block text-sm">{t('srsPrioritized')}</span>
            <span className="text-gray-600 dark:text-slate-300">{t('srsPrioritizationBanner')}</span>
          </div>
        </motion.div>
      )}

      {/* Quiz Top Header */}
      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-400">
              {language === 'ar' ? surah.name : surah.englishName}
            </h2>
            {renderSRSStatusBadge(currentItem.srsStatus)}
          </div>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            {t('ayah')} {currentAyah.numberInSurah} {t('of')} {surah.numberOfAyahs}
          </p>
        </div>

        <div className="flex gap-4 text-sm font-bold">
          <span className="text-emerald-600 dark:text-emerald-400">✓ {correctCount}</span>
          <span className="text-red-500 dark:text-red-400">✗ {mistakeCount}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
        <motion.div
          className="bg-emerald-500 h-full"
          initial={{ width: 0 }}
          animate={{
            width: `${((currentIndex + 1) / quizQueue.length) * 100}%`,
          }}
        />
      </div>

      {/* Question Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-emerald-50 dark:border-slate-800 space-y-8"
      >
        <div className="text-center space-y-6">
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            {mode === 'next-ayah'
              ? t('whatComesNext')
              : mode === 'fill-blank'
              ? t('fillInBlankPrompt')
              : t('voiceRecitationMode')}
          </p>

          <div
            className="font-arabic text-4xl leading-relaxed text-emerald-900 dark:text-emerald-300 text-right rtl:text-right transition-colors"
            dir="rtl"
          >
            {mode === 'next-ayah' ? currentAyah.text : mode === 'fill-blank' ? displayAyah : currentAyah.text}
          </div>

          {/* Recitation Audio Player Component */}
          <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
            <AyahAudioPlayer
              audioNumber={currentAyah.number}
              ayahText={currentAyah.text}
            />
            {mode !== 'voice-recitation' && (
              <button
                onClick={() => setShowVoicePractice((prev) => !prev)}
                className="px-4 py-2 bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-xs flex items-center gap-2 border border-emerald-200 dark:border-slate-700 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>{showVoicePractice ? 'Hide Voice Practice' : '🎙️ Test Voice Recitation'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Optional Voice Practice widget for next-ayah and fill-blank modes */}
        {mode !== 'voice-recitation' && showVoicePractice && (
          <div className="pt-2">
            <VoiceRecitationFeedback
              targetAyahText={mode === 'next-ayah' && nextAyah ? nextAyah.text : currentAyah.text}
              onCompleteFeedback={handleVoiceFeedbackComplete}
            />
          </div>
        )}

        {mode === 'voice-recitation' ? (
          <div className="pt-2">
            <VoiceRecitationFeedback
              targetAyahText={currentAyah.text}
              onCompleteFeedback={handleVoiceFeedbackComplete}
            />
          </div>
        ) : mode === 'next-ayah' && nextAyah ? (
          <div className="grid grid-cols-1 gap-4">
            {options.map((option, i) => (
              <motion.button
                key={i}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleOptionSelect(option)}
                disabled={!!selectedOption}
                className={`p-6 rounded-2xl text-right font-arabic text-xl border-2 transition-all cursor-pointer ${
                  selectedOption === option
                    ? isCorrect
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                      : 'bg-red-50 dark:bg-red-950/60 border-red-500 text-red-900 dark:text-red-200'
                    : selectedOption && option === nextAyah.text
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-900 dark:text-emerald-200'
                    : 'bg-white dark:bg-slate-900 border-emerald-50 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 text-gray-700 dark:text-slate-200'
                }`}
                dir="rtl"
              >
                {option}
              </motion.button>
            ))}
          </div>
        ) : mode === 'fill-blank' ? (
          <div className="space-y-6">
            <div className="relative">
              <input
                type="text"
                placeholder={t('typeMissingWord')}
                className="w-full p-6 text-right font-arabic text-2xl bg-gray-50 dark:bg-slate-800 border-2 border-emerald-50 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all"
                dir="rtl"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                disabled={!!selectedOption}
                onKeyPress={(e) => e.key === 'Enter' && handleFillSubmit()}
              />
              {selectedOption && (
                <div
                  className="mt-4 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-right font-arabic text-xl text-emerald-800 dark:text-emerald-300"
                  dir="rtl"
                >
                  {t('correctWord')}: {blankWord}
                </div>
              )}
            </div>
            {!selectedOption && (
              <button
                onClick={handleFillSubmit}
                className="w-full py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 transition-all cursor-pointer"
              >
                {t('checkAnswer')}
              </button>
            )}
          </div>
        ) : null}

        <AnimatePresence>
          {selectedOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center gap-4"
            >
              <div
                className={`flex items-center gap-2 font-bold ${
                  isCorrect
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-500 dark:text-red-400'
                }`}
              >
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-6 h-6" /> {t('correct')}
                  </>
                ) : (
                  <>
                    <XCircle className="w-6 h-6" /> {t('incorrect')}
                  </>
                )}
              </div>
              <button
                onClick={handleNext}
                className="w-full py-4 bg-emerald-900 dark:bg-emerald-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-black dark:hover:bg-emerald-700 transition-all cursor-pointer"
              >
                {t('nextAyah')}{' '}
                <ArrowRight
                  className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`}
                />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Quiz;
