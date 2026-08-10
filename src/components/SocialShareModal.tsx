import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import {
  Share2,
  Copy,
  Check,
  X,
  Flame,
  Award,
  BookOpen,
  Sparkles,
  ExternalLink,
  MessageCircle,
  Send,
  Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SocialShareProps {
  streak: number;
  totalCorrect: number;
  todayCount: number;
  dailyGoal: number;
  userName?: string;
}

export const SocialShareModal: React.FC<SocialShareProps> = ({
  streak,
  totalCorrect,
  todayCount,
  dailyGoal,
  userName = 'Hafiz Student',
}) => {
  const { t, isRTL } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Construct message text dynamically
  const messageText = t('shareMessageText')
    .replace('{streak}', streak.toString())
    .replace('{total}', totalCorrect.toString());

  const appUrl = window.location.origin;
  const fullShareText = `${messageText}\n\n📲 Practice Quran with Hafiz: ${appUrl}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullShareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}`;
    window.open(twitterUrl, '_blank', 'noopener,noreferrer');
  };

  const handleWhatsAppShare = () => {
    const waUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(fullShareText)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const handleTelegramShare = () => {
    const tgUrl = `https://t.me/share/url?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(messageText)}`;
    window.open(tgUrl, '_blank', 'noopener,noreferrer');
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Hafiz Quran Journey',
          text: messageText,
          url: appUrl,
        });
      } catch (err) {
        console.log('Share canceled or failed:', err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-500 dark:to-teal-500 text-white rounded-2xl text-sm font-bold flex items-center gap-2 hover:from-emerald-700 hover:to-teal-700 shadow-md shadow-emerald-200 dark:shadow-none transition-all cursor-pointer"
      >
        <Share2 className="w-4 h-4" />
        <span>{t('shareProgress')}</span>
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border border-emerald-50 dark:border-slate-800 space-y-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-5 right-5 rtl:right-auto rtl:left-5 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-full bg-gray-100 dark:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title Header */}
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-950/80 rounded-2xl text-emerald-600 dark:text-emerald-400">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                    {t('shareModalTitle')}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {t('shareModalSubtitle')}
                  </p>
                </div>
              </div>

              {/* Visual Preview Card */}
              <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden space-y-4">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-emerald-400" />
                    <span className="font-extrabold text-lg tracking-wide">حافظ • Hafiz</span>
                  </div>
                  <span className="text-[11px] bg-white/10 px-2.5 py-1 rounded-full text-emerald-200 font-medium">
                    Quran Progress
                  </span>
                </div>

                <div className="text-center py-2 space-y-1">
                  <h4 className="text-lg font-bold text-emerald-100">{userName}</h4>
                  <p className="text-xs text-emerald-200/80">Continuous Memorization Milestone</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl text-center border border-white/10">
                    <Flame className="w-5 h-5 text-amber-400 mx-auto mb-1 fill-amber-400" />
                    <span className="text-xl font-extrabold text-amber-300 block">{streak} Days</span>
                    <span className="text-[10px] text-emerald-200">Daily Streak</span>
                  </div>

                  <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl text-center border border-white/10">
                    <Award className="w-5 h-5 text-emerald-300 mx-auto mb-1" />
                    <span className="text-xl font-extrabold text-emerald-200 block">{totalCorrect}</span>
                    <span className="text-[10px] text-emerald-200">Ayat Memorized</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <button
                    onClick={handleTwitterShare}
                    className="p-3 bg-black hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ExternalLink className="w-4 h-4 text-sky-400" />
                    <span>{t('shareOnTwitter')}</span>
                  </button>

                  <button
                    onClick={handleWhatsAppShare}
                    className="p-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t('shareOnWhatsApp')}</span>
                  </button>

                  <button
                    onClick={handleTelegramShare}
                    className="p-3 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer col-span-2 sm:col-span-1"
                  >
                    <Send className="w-4 h-4" />
                    <span>{t('shareOnTelegram')}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopy}
                    className="flex-1 p-3 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-emerald-700 dark:text-emerald-400">{t('summaryCopied')}</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>{t('copySummary')}</span>
                      </>
                    )}
                  </button>

                  {'share' in navigator && (
                    <button
                      onClick={handleNativeShare}
                      className="p-3 bg-emerald-50 dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
                      title={t('shareNative')}
                    >
                      <Globe className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
