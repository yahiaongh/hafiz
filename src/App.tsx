import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { ThemeProvider } from './ThemeContext';
import Navbar from './components/Navbar';
import SurahSelector from './components/SurahSelector';
import Quiz from './components/Quiz';
import Dashboard from './components/Dashboard';
import Leaderboard from './components/Leaderboard';
import { ProfileSettings } from './components/ProfileSettings';
import { Surah, Ayah } from './types';
import { quranService } from './services/quranService';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Brain, Sparkles, LogIn, Trophy, Crown } from 'lucide-react';

const HomeContent: React.FC = () => {
  const { user, signIn } = useAuth();
  const { t, language } = useLanguage();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahs, setAyahs] = useState<Ayah[]>([]);
  const [mode, setMode] = useState<'next-ayah' | 'fill-blank' | 'voice-recitation' | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSurahSelect = async (surah: Surah, start: number, end: number) => {
    setLoading(true);
    try {
      const data = await quranService.getAyahRange(surah.number, start, end);
      setAyahs(data);
      setSelectedSurah(surah);
    } catch (error) {
      console.error('Error fetching ayahs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-12 transition-colors duration-200">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-24 h-24 bg-emerald-600 dark:bg-emerald-500 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-emerald-200 dark:shadow-none">
            <BookOpen className="text-white w-12 h-12" />
          </div>
          <h1 className="text-5xl font-bold text-emerald-900 dark:text-slate-100 tracking-tight">
            {t('heroTitlePre')} <br />
            <span className="text-emerald-600 dark:text-emerald-400">{t('heroTitleSub')}</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t('heroSubtitle')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: t('featureQuizzesTitle'), desc: t('featureQuizzesDesc') },
            { icon: Sparkles, title: t('featureAdaptiveTitle'), desc: t('featureAdaptiveDesc') },
            { icon: Trophy, title: t('featureTrackTitle'), desc: t('featureTrackDesc') },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-emerald-50 dark:border-slate-800 space-y-4"
            >
              <div className="w-12 h-12 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-emerald-900 dark:text-slate-100">{feature.title}</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={signIn}
          className="inline-flex items-center px-8 py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-xl shadow-emerald-100 dark:shadow-none transition-all gap-2"
        >
          <LogIn className="w-5 h-5 rtl:rotate-180" /> {t('startJourney')}
        </motion.button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
        <p className="text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">{t('fetchingQuran')}</p>
      </div>
    );
  }

  return (
    <div className="py-8">
      <AnimatePresence mode="wait">
        {!selectedSurah ? (
          <motion.div
            key="selector"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <SurahSelector onSelect={handleSurahSelect} />
          </motion.div>
        ) : !mode ? (
          <motion.div
            key="mode-selector"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-2xl mx-auto bg-white dark:bg-slate-900 p-10 rounded-3xl shadow-xl border border-emerald-50 dark:border-slate-800 space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">{t('selectMode')}</h2>
              <p className="text-gray-500 dark:text-slate-400">
                {t('selectModeDesc')} {language === 'ar' ? selectedSurah.name : selectedSurah.englishName}?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button
                onClick={() => {
                  if (ayahs.length < 2) {
                    alert(t('nextAyahAlert'));
                    return;
                  }
                  setMode('next-ayah');
                }}
                className="p-6 bg-emerald-50 dark:bg-slate-800/60 border-2 border-emerald-100 dark:border-slate-700 rounded-2xl text-left rtl:text-right hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group"
              >
                <h3 className="text-xl font-bold text-emerald-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{t('nextAyahMode')}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{t('nextAyahDesc')}</p>
              </button>
              <button
                onClick={() => setMode('fill-blank')}
                className="p-6 bg-emerald-50 dark:bg-slate-800/60 border-2 border-emerald-100 dark:border-slate-700 rounded-2xl text-left rtl:text-right hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group"
              >
                <h3 className="text-xl font-bold text-emerald-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{t('fillBlankMode')}</h3>
                <p className="text-sm text-gray-600 dark:text-slate-400">{t('fillBlankDesc')}</p>
              </button>

              <button
                onClick={() => setMode('voice-recitation')}
                className="p-6 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-emerald-500/10 dark:bg-slate-800/80 border-2 border-emerald-200 dark:border-slate-700 rounded-2xl text-left rtl:text-right hover:border-emerald-500 dark:hover:border-emerald-400 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-xl font-bold text-emerald-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center gap-2">
                    🎙️ {t('voiceRecitationMode')}
                  </h3>
                  <span className="px-2.5 py-0.5 bg-emerald-600 text-white text-[10px] font-extrabold uppercase rounded-full shadow-xs">
                    Interactive AI
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-slate-400 pt-1">{t('voiceRecitationDesc')}</p>
              </button>
            </div>

            <button
              onClick={() => setSelectedSurah(null)}
              className="w-full py-4 text-gray-500 dark:text-slate-400 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              {t('cancelChooseAnother')}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Quiz
              surah={selectedSurah}
              ayahs={ayahs}
              mode={mode}
              onFinish={() => {
                setSelectedSurah(null);
                setMode(null);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LeaderboardPage: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-amber-100 dark:bg-amber-950/80 rounded-2xl text-amber-600 dark:text-amber-400">
          <Crown className="w-8 h-8 fill-amber-400" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-emerald-900 dark:text-emerald-400">{t('globalLeaderboard')}</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">{t('leaderboardDesc')}</p>
        </div>
      </div>
      <Leaderboard />
    </div>
  );
};

const FooterContent: React.FC = () => {
  const { t } = useLanguage();
  return (
    <footer className="py-8 text-center text-gray-400 dark:text-slate-500 text-sm">
      <p>© {new Date().getFullYear()} {t('footerRights')}</p>
    </footer>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <ThemeProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-gray-50/50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<HomeContent />} />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/leaderboard"
                    element={
                      <ProtectedRoute>
                        <LeaderboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                          <ProfileSettings />
                        </div>
                      </ProtectedRoute>
                    }
                  />
                </Routes>
              </main>
              <FooterContent />
            </div>
          </Router>
        </ThemeProvider>
      </LanguageProvider>
    </AuthProvider>
  );
}
