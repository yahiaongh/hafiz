import React, { useState, useEffect, useMemo } from 'react';
import { quranService, SearchAyahMatch } from '../services/quranService';
import { Surah } from '../types';
import { Search, ChevronRight, BookOpen, X, Sparkles, CornerDownLeft, Loader2, Book } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../LanguageContext';

interface SurahSelectorProps {
  onSelect: (surah: Surah, start: number, end: number) => void;
}

interface ParsedAyahJump {
  surah: Surah;
  ayahNumber: number;
}

const QUICK_SUGGESTIONS = [
  { label: 'أَلَمْ (Alam - Diacritized)', query: 'أَلَمْ' },
  { label: 'الم (Alif Lam Meem)', query: 'الم' },
  { label: 'الْحَمْدُ لِلَّهِ', query: 'الْحَمْدُ لِلَّهِ' },
  { label: 'Ayat Al-Kursi (2:255)', query: '2:255' },
  { label: 'Surah Al-Mulk (#67)', query: '67' },
];

const SurahSelector: React.FC<SurahSelectorProps> = ({ onSelect }) => {
  const { t, language, isRTL } = useLanguage();
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [startAyah, setStartAyah] = useState(1);
  const [endAyah, setEndAyah] = useState(10);
  const [loading, setLoading] = useState(true);

  // Ayah text search state
  const [ayahMatches, setAyahMatches] = useState<SearchAyahMatch[]>([]);
  const [isSearchingAyahs, setIsSearchingAyahs] = useState(false);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const data = await quranService.getAllSurahs();
        setSurahs(data);
      } catch (error) {
        console.error('Error fetching surahs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSurahs();
  }, []);

  // Search for written Ayah text across the Quran on appliedSearch change
  useEffect(() => {
    const q = appliedSearch.trim();
    if (q.length < 2) {
      setAyahMatches([]);
      setIsSearchingAyahs(false);
      return;
    }

    let isMounted = true;
    setIsSearchingAyahs(true);
    quranService
      .searchAyahs(q)
      .then((results) => {
        if (isMounted) setAyahMatches(results);
      })
      .catch((err) => {
        console.error('Error in Ayah search:', err);
        if (isMounted) setAyahMatches([]);
      })
      .finally(() => {
        if (isMounted) setIsSearchingAyahs(false);
      });

    return () => {
      isMounted = false;
    };
  }, [appliedSearch]);

  // Handle explicit search submission
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAppliedSearch(searchInput);
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setAppliedSearch('');
    setAyahMatches([]);
  };

  const handleQuickSuggestion = (query: string) => {
    setSearchInput(query);
    setAppliedSearch(query);
  };

  // Detect direct Ayah jump (e.g., "2:255", "67:10", "Baqarah 255", "255")
  const directAyahJump = useMemo<ParsedAyahJump | null>(() => {
    const query = appliedSearch.trim();
    if (!query || surahs.length === 0) return null;

    // Pattern 1: "2:255" or "2 : 255" or "2-255"
    const colonMatch = query.match(/^(\d{1,3})\s*[:\-]\s*(\d{1,3})$/);
    if (colonMatch) {
      const sNum = parseInt(colonMatch[1], 10);
      const aNum = parseInt(colonMatch[2], 10);
      const found = surahs.find((s) => s.number === sNum);
      if (found && aNum >= 1 && aNum <= found.numberOfAyahs) {
        return { surah: found, ayahNumber: aNum };
      }
    }

    // Pattern 2: "Baqarah 255" or "Surah 2 Ayah 10" or "Mulk 10"
    const textNumMatch = query.match(/^(.+?)\s+(\d{1,3})$/i);
    if (textNumMatch) {
      const textPart = textNumMatch[1].toLowerCase().replace(/^surah\s+/i, '').trim();
      const numPart = parseInt(textNumMatch[2], 10);

      const found = surahs.find(
        (s) =>
          s.englishName.toLowerCase().includes(textPart) ||
          s.name.includes(textPart) ||
          s.number.toString() === textPart
      );

      if (found && numPart >= 1 && numPart <= found.numberOfAyahs) {
        return { surah: found, ayahNumber: numPart };
      }
    }

    // Pattern 3: Single number > 114 (e.g. 255 -> Ayah 255 of Al-Baqarah)
    const singleNum = parseInt(query, 10);
    if (!isNaN(singleNum) && singleNum > 114) {
      const baqarah = surahs.find((s) => s.number === 2);
      if (baqarah && singleNum <= baqarah.numberOfAyahs) {
        return { surah: baqarah, ayahNumber: singleNum };
      }
    }

    return null;
  }, [appliedSearch, surahs]);

  // Filtered Surahs list by Name, Number, or Translation
  const filteredSurahs = useMemo(() => {
    const q = appliedSearch.trim().toLowerCase();
    if (!q) return surahs;

    return surahs.filter(
      (s) =>
        s.englishName.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        s.number.toString() === q ||
        s.number.toString().includes(q)
    );
  }, [appliedSearch, surahs]);

  const handleSurahClick = (surah: Surah) => {
    setSelectedSurah(surah);
    setStartAyah(1);
    setEndAyah(Math.min(10, surah.numberOfAyahs));
  };

  const handleJumpToAyahClick = (jump: ParsedAyahJump) => {
    setSelectedSurah(jump.surah);
    setStartAyah(jump.ayahNumber);
    setEndAyah(Math.min(jump.ayahNumber + 4, jump.surah.numberOfAyahs));
  };

  const handleSelectAyahMatch = (match: SearchAyahMatch) => {
    // Look up complete surah object from state if match.surah is partial
    const fullSurah = surahs.find((s) => s.number === match.surah.number) || match.surah;
    setSelectedSurah(fullSurah);
    setStartAyah(match.numberInSurah);
    setEndAyah(Math.min(match.numberInSurah + 4, fullSurah.numberOfAyahs));
  };

  const handleStart = () => {
    if (selectedSurah) {
      onSelect(selectedSurah, startAyah, endAyah);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 dark:border-emerald-400"></div>
      </div>
    );
  }

  const hasSearch = appliedSearch.trim().length >= 2;

  return (
    <div className="max-w-4xl mx-auto p-4 transition-colors duration-200">
      {!selectedSurah ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-emerald-950 dark:text-emerald-400">
              {t('chooseSurah')}
            </h1>
            <p className="text-sm text-gray-500 dark:text-slate-400">
              {t('chooseSurahSubtitle')}
            </p>
          </div>

          {/* Search Bar Container */}
          <div className="space-y-3">
            <form onSubmit={handleSearchSubmit} className="flex gap-2.5 items-stretch">
              <div className="relative flex-1">
                <Search className="absolute left-4 rtl:left-auto rtl:right-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-10 rtl:pl-10 rtl:pr-12 py-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 text-gray-900 dark:text-slate-100 rounded-2xl shadow-xs focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none text-base"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />

                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-4 rtl:right-auto rtl:left-4 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    title={t('clearSearch')}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-4 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
              >
                <Search className="w-5 h-5" />
                <span>{t('searchButton')}</span>
              </button>
            </form>

            <p className="text-[11px] text-gray-400 dark:text-slate-500 px-1 font-medium">
              💡 {t('searchBarHelp')}
            </p>

            {/* Quick Suggestions Chips */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs font-bold text-gray-500 dark:text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {t('quickSuggestions')}
              </span>
              {QUICK_SUGGESTIONS.map((sug, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickSuggestion(sug.query)}
                  className="px-2.5 py-1 bg-emerald-50 dark:bg-slate-800/80 hover:bg-emerald-100 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold border border-emerald-100 dark:border-slate-700 transition-all cursor-pointer"
                >
                  {sug.label}
                </button>
              ))}
            </div>
          </div>

          {/* Direct Ayah Jump Highlight Banner */}
          {directAyahJump && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={() => handleJumpToAyahClick(directAyahJump)}
              className="p-4 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-2 border-emerald-400/80 dark:border-emerald-500/60 rounded-2xl flex items-center justify-between gap-4 cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-600 text-white rounded-xl font-black text-sm shadow-xs">
                  #{directAyahJump.surah.number}:{directAyahJump.ayahNumber}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                      🎯 {t('jumpToAyah')}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                    {language === 'ar'
                      ? directAyahJump.surah.name
                      : directAyahJump.surah.englishName}{' '}
                    – {t('ayah')} {directAyahJump.ayahNumber}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform">
                <span>Practice Ayah {directAyahJump.ayahNumber}</span>
                <CornerDownLeft className="w-4 h-4" />
              </div>
            </motion.div>
          )}

          {/* Written Ayah Text Search Results Section */}
          {hasSearch && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 pb-2">
                <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
                  <Book className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  {t('ayahMatchesTitle').replace('{count}', ayahMatches.length.toString())}
                </h2>
                {isSearchingAyahs && (
                  <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t('searchingAyahs')}</span>
                  </div>
                )}
              </div>

              {/* Ayah Possibilities List */}
              {ayahMatches.length > 0 ? (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  <AnimatePresence>
                    {ayahMatches.map((match) => (
                      <motion.div
                        key={`${match.surah.number}:${match.numberInSurah}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleSelectAyahMatch(match)}
                        className="p-4 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800/80 hover:border-emerald-300 dark:hover:border-emerald-700/60 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 border-b border-gray-50 dark:border-slate-800/50 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                              #{match.surah.number}:{match.numberInSurah}
                            </span>
                            <span className="font-semibold text-gray-800 dark:text-slate-200">
                              {language === 'ar' ? match.surah.name : match.surah.englishName}
                            </span>
                          </div>
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline flex items-center gap-1">
                            {t('practiceThisAyah')}
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </span>
                        </div>

                        {/* Ayah Arabic Text */}
                        <p
                          className="font-arabic text-xl sm:text-2xl text-emerald-950 dark:text-emerald-100 leading-relaxed text-right rtl:text-right pt-1"
                          dir="rtl"
                        >
                          {match.text}
                          <span className="inline-block text-xs font-sans bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 font-bold px-2 py-0.5 rounded-full mr-2 rtl:mr-0 rtl:ml-2 align-middle">
                            ﴿{match.numberInSurah}﴾
                          </span>
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                !isSearchingAyahs && (
                  <p className="text-xs text-gray-400 dark:text-slate-500 italic px-1">
                    No matching Ayah text found for "{appliedSearch}". Try searching for another phrase or keyword with/without diacritics.
                  </p>
                )
              )}
            </div>
          )}

          {/* Surah Grid Section */}
          <div className="space-y-4">
            {hasSearch && (
              <h2 className="text-base font-bold text-emerald-900 dark:text-emerald-300 border-b border-gray-100 dark:border-slate-800 pb-2">
                {t('matchingSurahs').replace('{count}', filteredSurahs.length.toString())}
              </h2>
            )}

            {filteredSurahs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSurahs.map((surah) => (
                  <motion.button
                    key={surah.number}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleSurahClick(surah)}
                    className="flex items-center p-4 bg-white dark:bg-slate-900 border border-emerald-50 dark:border-slate-800/80 rounded-2xl hover:border-emerald-200 dark:hover:border-slate-700 hover:shadow-md transition-all text-left rtl:text-right group cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-emerald-50 dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold mr-4 rtl:mr-0 rtl:ml-4 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      {surah.number}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-emerald-900 dark:text-slate-100">
                        {language === 'ar' ? surah.name : surah.englishName}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-slate-400">
                        {surah.numberOfAyahs} {t('ayat')}
                      </p>
                    </div>
                    <div className="text-right rtl:text-left">
                      <p className="font-arabic text-lg text-emerald-800 dark:text-emerald-400">
                        {language === 'ar' ? surah.englishName : surah.name}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              /* No Results Empty State */
              !isSearchingAyahs && ayahMatches.length === 0 && (
                <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 space-y-4">
                  <Search className="w-12 h-12 text-gray-300 dark:text-slate-600 mx-auto" />
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-800 dark:text-slate-200">
                      {t('noSurahsFound')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                      Try searching for a Surah name (e.g. "Baqarah"), a number (e.g. "67"), reference (e.g. "2:255"), or written text (e.g. "أَلَم" or "الم")
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-4 py-2 bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 rounded-xl font-bold text-xs hover:bg-emerald-100 dark:hover:bg-slate-700 transition-colors"
                  >
                    {t('clearSearch')}
                  </button>
                </div>
              )
            )}
          </div>
        </motion.div>
      ) : (
        /* Ayah Range Selection View */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-emerald-50 dark:border-slate-800 space-y-8"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSelectedSurah(null)}
              className="text-emerald-600 dark:text-emerald-400 font-medium hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
            >
              <ChevronRight
                className={`w-4 h-4 ${isRTL ? '' : 'rotate-180'}`}
              />{' '}
              {t('backToList')}
            </button>
            <div className="text-right rtl:text-left">
              <h2 className="text-2xl font-bold text-emerald-900 dark:text-slate-100">
                {language === 'ar'
                  ? selectedSurah.name
                  : selectedSurah.englishName}
              </h2>
              <p className="font-arabic text-xl text-emerald-600 dark:text-emerald-400">
                {language === 'ar'
                  ? selectedSurah.englishName
                  : selectedSurah.name}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {t('selectAyahRange')}
            </h3>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('fromAyah')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={selectedSurah.numberOfAyahs}
                  value={startAyah}
                  onChange={(e) =>
                    setStartAyah(
                      Math.max(
                        1,
                        Math.min(
                          selectedSurah.numberOfAyahs,
                          parseInt(e.target.value) || 1
                        )
                      )
                    )
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-slate-300">
                  {t('toAyah')}
                </label>
                <input
                  type="number"
                  min={startAyah}
                  max={selectedSurah.numberOfAyahs}
                  value={endAyah}
                  onChange={(e) =>
                    setEndAyah(
                      Math.max(
                        startAyah,
                        Math.min(
                          selectedSurah.numberOfAyahs,
                          parseInt(e.target.value) || startAyah
                        )
                      )
                    )
                  }
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/40 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
              <p className="text-sm text-emerald-800 dark:text-emerald-300">
                {t('youWillPractice')}{' '}
                <strong>{endAyah - startAyah + 1}</strong> {t('ayatFrom')}{' '}
                {language === 'ar'
                  ? selectedSurah.name
                  : selectedSurah.englishName}
                .
              </p>
            </div>

            <button
              onClick={handleStart}
              className="w-full py-4 bg-emerald-600 dark:bg-emerald-500 text-white rounded-2xl font-bold text-lg hover:bg-emerald-700 dark:hover:bg-emerald-600 shadow-lg shadow-emerald-100 dark:shadow-none transition-all cursor-pointer"
            >
              {t('startPractice')}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SurahSelector;
