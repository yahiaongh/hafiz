import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  MicOff,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Volume2,
  Brain,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { useLanguage } from '../LanguageContext';

interface VoiceRecitationFeedbackProps {
  targetAyahText: string;
  onCompleteFeedback?: (accuracy: number, isPassed: boolean) => void;
  compact?: boolean;
}

// Arabic Text Normalization for accurate phonetic matching
export function normalizeArabicText(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel / diacritics
    .replace(/[أإآٱ]/g, 'ا') // normalize Alif
    .replace(/ى/g, 'ي') // normalize Yaa
    .replace(/ة/g, 'ه') // normalize Taa Marboota
    .replace(/[^\u0621-\u064A\s]/g, '') // keep Arabic letters and spaces only
    .replace(/\s+/g, ' ')
    .trim();
}

interface WordComparison {
  originalWord: string;
  normalizedWord: string;
  isMatched: boolean;
}

export const VoiceRecitationFeedback: React.FC<VoiceRecitationFeedbackProps> = ({
  targetAyahText,
  onCompleteFeedback,
  compact = false,
}) => {
  const { t, isRTL } = useLanguage();

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [wordAnalysis, setWordAnalysis] = useState<WordComparison[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check SpeechRecognition support in browser
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startListening = () => {
    setErrorMsg(null);
    setHasSubmitted(false);
    setTranscript('');
    setInterimTranscript('');
    setAccuracy(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      setErrorMsg(t('micNotSupported'));
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentFinal = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const res = event.results[i];
          if (res.isFinal) {
            currentFinal += res[0].transcript + ' ';
          } else {
            currentInterim += res[0].transcript;
          }
        }

        if (currentFinal) {
          setTranscript((prev) => (prev + ' ' + currentFinal).trim());
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition event error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setErrorMsg('Microphone access was denied. Please allow microphone permissions.');
        } else if (event.error !== 'no-speech') {
          setErrorMsg(`Voice recognition note: ${event.error}`);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setErrorMsg('Failed to initiate microphone.');
      setIsRecording(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsRecording(false);
    analyzeRecitation();
  };

  const analyzeRecitation = () => {
    const fullSpoken = (transcript + ' ' + interimTranscript).trim();
    if (!fullSpoken) {
      setErrorMsg('No spoken recitation detected. Please try again.');
      return;
    }

    const normTargetWords = targetAyahText.split(' ').map((w) => ({
      original: w,
      norm: normalizeArabicText(w),
    }));

    const normSpokenWords = fullSpoken
      .split(' ')
      .map((w) => normalizeArabicText(w))
      .filter((w) => w.length > 0);

    // Compute word-level matches
    let matchedCount = 0;
    const spokenSet = new Set(normSpokenWords);

    const comparisons: WordComparison[] = normTargetWords.map((item) => {
      // Direct match or substring match
      const isMatched =
        spokenSet.has(item.norm) ||
        normSpokenWords.some(
          (sw) => sw.includes(item.norm) || item.norm.includes(sw)
        );

      if (isMatched) matchedCount++;

      return {
        originalWord: item.original,
        normalizedWord: item.norm,
        isMatched,
      };
    });

    const calculatedAccuracy = Math.min(
      100,
      Math.round((matchedCount / Math.max(1, normTargetWords.length)) * 100)
    );

    setAccuracy(calculatedAccuracy);
    setWordAnalysis(comparisons);
    setHasSubmitted(true);

    const isPassed = calculatedAccuracy >= 70;
    if (onCompleteFeedback) {
      onCompleteFeedback(calculatedAccuracy, isPassed);
    }
  };

  const getFeedbackTone = (acc: number) => {
    if (acc >= 90) {
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200',
        badge: 'bg-emerald-600 text-white',
        title: t('excellentRecitation'),
      };
    } else if (acc >= 70) {
      return {
        bg: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200',
        badge: 'bg-sky-600 text-white',
        title: t('greatRecitation'),
      };
    } else if (acc >= 50) {
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200',
        badge: 'bg-amber-600 text-white',
        title: t('goodEffort'),
      };
    } else {
      return {
        bg: 'bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800 text-red-900 dark:text-red-200',
        badge: 'bg-red-600 text-white',
        title: t('needsPractice'),
      };
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-emerald-100 dark:border-slate-800 space-y-6 shadow-md">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl text-emerald-700 dark:text-emerald-400">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-emerald-900 dark:text-emerald-300">
              {t('voiceRecitationMode')}
            </h3>
            <p className="text-xs text-gray-500 dark:text-slate-400">
              {t('voiceRecitationDesc')}
            </p>
          </div>
        </div>

        {accuracy !== null && (
          <div className="px-4 py-2 bg-emerald-50 dark:bg-slate-800 border border-emerald-200 dark:border-slate-700 rounded-2xl flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
              {t('accuracyScore')}: {accuracy}%
            </span>
          </div>
        )}
      </div>

      {/* Recording Animation & Control Box */}
      <div className="p-6 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-slate-50 dark:from-slate-800/80 dark:to-slate-800/40 rounded-2xl border border-emerald-100/80 dark:border-slate-700 text-center space-y-4">
        {isRecording ? (
          <div className="space-y-4 py-2">
            <div className="relative inline-flex items-center justify-center">
              <motion.div
                animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0.2, 0.6] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                className="w-20 h-20 bg-red-500/20 rounded-full absolute"
              />
              <button
                onClick={stopListening}
                className="w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer relative z-10"
              >
                <MicOff className="w-8 h-8 animate-pulse" />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-red-600 dark:text-red-400 animate-pulse">
                {t('listeningState')}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400 pt-1">
                Tap button when finished to analyze accuracy
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-2">
            <button
              onClick={startListening}
              className="px-6 py-3.5 bg-emerald-600 dark:bg-emerald-500 hover:bg-emerald-700 text-white font-bold rounded-2xl inline-flex items-center gap-2.5 shadow-lg shadow-emerald-200 dark:shadow-none transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Mic className="w-5 h-5" />
              <span>{hasSubmitted ? t('tryAgain') : t('startReciting')}</span>
            </button>
            {!isSupported && (
              <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                {t('micNotSupported')}
              </p>
            )}
          </div>
        )}

        {/* Real-time or final Spoken Transcript Display */}
        {(transcript || interimTranscript) && (
          <div className="mt-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-emerald-100 dark:border-slate-700 text-right space-y-1">
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-400 block">
              {t('transcribedText')}:
            </span>
            <p className="font-arabic text-xl leading-relaxed text-gray-800 dark:text-slate-200" dir="rtl">
              {transcript}{' '}
              <span className="text-gray-400 italic">{interimTranscript}</span>
            </p>
          </div>
        )}

        {errorMsg && (
          <p className="text-xs text-red-600 dark:text-red-400 font-medium flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMsg}</span>
          </p>
        )}
      </div>

      {/* Analysis Feedback Report */}
      {hasSubmitted && accuracy !== null && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-5 rounded-2xl border space-y-4 ${getFeedbackTone(accuracy).bg}`}
        >
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h4 className="font-bold text-sm">
                {getFeedbackTone(accuracy).title}
              </h4>
            </div>
            <span
              className={`px-3 py-1 text-xs font-bold rounded-full ${
                getFeedbackTone(accuracy).badge
              }`}
            >
              {accuracy}% {t('accuracyScore')}
            </span>
          </div>

          {/* Word by word breakdown with color coding */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-600 dark:text-slate-300 block">
              {t('voiceFeedbackTitle')} (Word Breakdown):
            </span>
            <div
              className="flex flex-wrap gap-2 text-right justify-start font-arabic text-xl p-4 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-gray-100 dark:border-slate-800"
              dir="rtl"
            >
              {wordAnalysis.map((item, idx) => (
                <span
                  key={idx}
                  className={`px-2 py-1 rounded-lg border text-lg font-bold transition-all ${
                    item.isMatched
                      ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 border-emerald-300 dark:border-emerald-700'
                      : 'bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-300 dark:border-red-800 line-through decoration-red-500'
                  }`}
                  title={
                    item.isMatched ? 'Correctly Recited' : 'Missing / Mispronounced'
                  }
                >
                  {item.originalWord}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
