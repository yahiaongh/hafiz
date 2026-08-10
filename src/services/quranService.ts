import { Surah, Ayah } from '../types';

const BASE_URL = 'https://api.alquran.cloud/v1';

export function removeArabicDiacritics(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه');
}

export interface SearchAyahMatch {
  number: number;
  text: string;
  numberInSurah: number;
  surah: Surah;
}

export const quranService = {
  async getAllSurahs(): Promise<Surah[]> {
    const response = await fetch(`${BASE_URL}/surah`);
    const data = await response.json();
    return data.data;
  },

  async getSurahAyahs(surahNumber: number): Promise<Ayah[]> {
    const response = await fetch(`${BASE_URL}/surah/${surahNumber}`);
    const data = await response.json();
    return data.data.ayahs;
  },

  async getAyahRange(surahNumber: number, start: number, end: number): Promise<Ayah[]> {
    const ayahs = await this.getSurahAyahs(surahNumber);
    return ayahs.filter(a => a.numberInSurah >= start && a.numberInSurah <= end);
  },

  async searchAyahs(query: string): Promise<SearchAyahMatch[]> {
    const cleanQuery = query.trim();
    if (!cleanQuery || cleanQuery.length < 2) return [];

    const normalizedQuery = removeArabicDiacritics(cleanQuery);
    const resultsMap = new Map<string, SearchAyahMatch>();

    const fetchSearch = async (searchTerm: string, edition: string = 'quran-simple') => {
      try {
        const response = await fetch(
          `${BASE_URL}/search/${encodeURIComponent(searchTerm)}/all/${edition}`
        );
        if (!response.ok) return [];
        const data = await response.json();
        return (data.data?.matches as SearchAyahMatch[]) || [];
      } catch (err) {
        return [];
      }
    };

    // Run parallel searches with original query and normalized query
    const [exactMatches, normMatches, cleanEditionMatches] = await Promise.all([
      fetchSearch(cleanQuery, 'quran-simple'),
      normalizedQuery !== cleanQuery ? fetchSearch(normalizedQuery, 'quran-simple') : Promise.resolve([]),
      normalizedQuery !== cleanQuery ? fetchSearch(normalizedQuery, 'quran-simple-clean') : Promise.resolve([])
    ]);

    [...exactMatches, ...normMatches, ...cleanEditionMatches].forEach((match) => {
      if (match && match.surah && match.numberInSurah) {
        const key = `${match.surah.number}:${match.numberInSurah}`;
        if (!resultsMap.has(key)) {
          resultsMap.set(key, match);
        }
      }
    });

    return Array.from(resultsMap.values());
  }
};

