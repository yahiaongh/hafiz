import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Trophy, Crown, LogOut, Menu, X, Globe, Sun, Moon, Flame, Settings } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useLanguage } from '../LanguageContext';
import { useTheme } from '../ThemeContext';
import { motion, AnimatePresence } from 'motion/react';

const Navbar: React.FC = () => {
  const { user, profile, logout, signIn } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const location = useLocation();

  const navItems = [
    { name: t('memorize'), path: '/', icon: BookOpen },
    { name: t('dashboard'), path: '/dashboard', icon: Trophy },
    { name: t('leaderboard'), path: '/leaderboard', icon: Crown },
    ...(user ? [{ name: t('settingsNav'), path: '/settings', icon: Settings }] : []),
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 sticky top-0 z-50 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="w-10 h-10 bg-emerald-600 dark:bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 dark:shadow-none">
                <BookOpen className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold text-emerald-900 dark:text-emerald-400 tracking-tight">{t('appTitle')}</span>
            </Link>
            <div className="hidden sm:flex sm:space-x-2 ltr:sm:space-x-2 rtl:sm:space-x-reverse">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`inline-flex items-center px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200 ${
                    isActive(item.path)
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'text-gray-600 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className="w-4 h-4 mx-1.5" />
                  {item.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="hidden sm:flex sm:items-center gap-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all"
              title={theme === 'light' ? t('themeDark') : t('themeLight')}
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-700" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400" />
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 border border-emerald-200 dark:border-slate-700 transition-all"
              title={language === 'en' ? 'Switch to Arabic' : 'التحويل إلى الإنجليزية'}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{language === 'en' ? 'العربية' : 'English'}</span>
            </button>

            {user ? (
              <div className="flex items-center gap-3 border-l rtl:border-r rtl:border-l-0 border-gray-100 dark:border-slate-800 pl-3 rtl:pl-0 rtl:pr-3">
                <Link to="/settings" className="flex flex-col items-end rtl:items-start hover:opacity-80 transition-opacity" title={t('profileSettingsTitle')}>
                  <span className="text-xs font-bold text-gray-900 dark:text-slate-100">{profile?.displayName || 'User'}</span>
                  <div className="flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-bold">
                    <Flame className="w-3 h-3 fill-amber-500 text-amber-500" />
                    <span>{profile?.streak || 0} {profile?.streak === 1 ? t('day') : t('days')}</span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-full transition-colors"
                  title={t('logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={signIn}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 shadow-md shadow-emerald-100 dark:shadow-none transition-all"
              >
                {t('signIn')}
              </button>
            )}
          </div>

          <div className="flex items-center sm:hidden gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-slate-300 bg-gray-100 dark:bg-slate-800 rounded-lg"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
            </button>

            <button
              onClick={toggleLanguage}
              className="p-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-800 rounded-lg"
            >
              {language === 'en' ? 'عربي' : 'EN'}
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="sm:hidden bg-white dark:bg-slate-900 border-b border-emerald-50 dark:border-slate-800"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.path)
                      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-slate-800'
                      : 'text-gray-600 dark:text-slate-400 hover:text-emerald-600 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mx-3" />
                    {item.name}
                  </div>
                </Link>
              ))}
              {!user && (
                <button
                  onClick={() => {
                    signIn();
                    setIsOpen(false);
                  }}
                  className="w-full text-left rtl:text-right px-3 py-2 rounded-md text-base font-medium text-white bg-emerald-600 hover:bg-emerald-700"
                >
                  {t('signIn')}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
