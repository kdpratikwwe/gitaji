/**
 * Data Loader Module
 * Handles fetching and caching of Bhagavad Gita JSON data from GitHub
 */

const DataLoader = (() => {
  const GITHUB_BASE_URL = 'https://raw.githubusercontent.com/bhavykhatri/DharmicData/main/SrimadBhagvadGita';
  const CACHE_KEY_PREFIX = 'bhagavad_gita_';
  const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  // Chapter metadata (name and verse counts)
  const CHAPTER_INFO = [
    { number: 1, name: 'Arjuna Vishada Yoga', sanskrit: 'अर्जुन विषाद योग', verses: 47 },
    { number: 2, name: 'Sankhya Yoga', sanskrit: 'सांख्य योग', verses: 72 },
    { number: 3, name: 'Karma Yoga', sanskrit: 'कर्म योग', verses: 43 },
    { number: 4, name: 'Jnana Karma Sanyasa Yoga', sanskrit: 'ज्ञान कर्म संन्यास योग', verses: 42 },
    { number: 5, name: 'Karma Sanyasa Yoga', sanskrit: 'कर्म संन्यास योग', verses: 29 },
    { number: 6, name: 'Dhyana Yoga', sanskrit: 'ध्यान योग', verses: 47 },
    { number: 7, name: 'Jnana Vijnana Yoga', sanskrit: 'ज्ञान विज्ञान योग', verses: 30 },
    { number: 8, name: 'Aksara Brahma Yoga', sanskrit: 'अक्षर ब्रह्म योग', verses: 28 },
    { number: 9, name: 'Raja Vidya Raja Guhya Yoga', sanskrit: 'राज विद्या राज गुह्य योग', verses: 34 },
    { number: 10, name: 'Vibhuti Yoga', sanskrit: 'विभूति योग', verses: 42 },
    { number: 11, name: 'Vishvarupa Darshana Yoga', sanskrit: 'विश्वरूप दर्शन योग', verses: 55 },
    { number: 12, name: 'Bhakti Yoga', sanskrit: 'भक्ति योग', verses: 20 },
    { number: 13, name: 'Ksetra Ksetrajna Vibhaga Yoga', sanskrit: 'क्षेत्र क्षेत्रज्ञ विभाग योग', verses: 35 },
    { number: 14, name: 'Gunatraya Vibhaga Yoga', sanskrit: 'गुणत्रय विभाग योग', verses: 27 },
    { number: 15, name: 'Purushottama Yoga', sanskrit: 'पुरुषोत्तम योग', verses: 20 },
    { number: 16, name: 'Daivasura Sampad Vibhaga Yoga', sanskrit: 'दैवासुर सम्पद् विभाग योग', verses: 24 },
    { number: 17, name: 'Sraddhatraya Vibhaga Yoga', sanskrit: 'श्रद्धात्रय विभाग योग', verses: 28 },
    { number: 18, name: 'Moksha Sanyasa Yoga', sanskrit: 'मोक्ष संन्यास योग', verses: 78 }
  ];
  
  /**
   * Get data from cache if valid
   */
  const getFromCache = (key) => {
    try {
      const cached = localStorage.getItem(CACHE_KEY_PREFIX + key);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const isExpired = Date.now() - timestamp > CACHE_DURATION;
      
      if (isExpired) {
        localStorage.removeItem(CACHE_KEY_PREFIX + key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Cache retrieval error:', error);
      return null;
    }
  };
  
  /**
   * Save data to cache
   */
  const saveToCache = (key, data) => {
    try {
      const cacheItem = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(CACHE_KEY_PREFIX + key, JSON.stringify(cacheItem));
    } catch (error) {
      console.error('Cache save error:', error);
    }
  };
  
  /**
   * Fetch chapter data from GitHub
   */
  const fetchChapterData = async (chapterNumber) => {
    const cacheKey = `chapter_${chapterNumber}`;
    
    // Check cache first
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.log(`Chapter ${chapterNumber} loaded from cache`);
      return cachedData;
    }
    
    // Fetch from GitHub
    try {
      const url = `${GITHUB_BASE_URL}/bhagavad_gita_chapter_${chapterNumber}.json`;
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Save to cache
      saveToCache(cacheKey, data);
      console.log(`Chapter ${chapterNumber} fetched from GitHub`);
      
      return data;
    } catch (error) {
      console.error(`Error fetching chapter ${chapterNumber}:`, error);
      throw error;
    }
  };
  
  /**
   * Get all chapters metadata
   */
  const getAllChapters = () => {
    return CHAPTER_INFO;
  };
  
  /**
   * Get specific verse from a chapter
   */
  const getVerse = async (chapterNumber, verseNumber) => {
    try {
      const chapterData = await fetchChapterData(chapterNumber);
      
      if (!chapterData || !chapterData.BhagavadGitaChapter) {
        throw new Error('Invalid chapter data structure');
      }
      
      const verse = chapterData.BhagavadGitaChapter.find(v => v.verse === verseNumber);
      
      if (!verse) {
        throw new Error(`Verse ${verseNumber} not found in chapter ${chapterNumber}`);
      }
      
      return verse;
    } catch (error) {
      console.error(`Error getting verse ${chapterNumber}.${verseNumber}:`, error);
      throw error;
    }
  };
  
  /**
   * Get chapter info by number
   */
  const getChapterInfo = (chapterNumber) => {
    return CHAPTER_INFO.find(ch => ch.number === chapterNumber) || null;
  };
  
  /**
   * Clear all cached data
   */
  const clearCache = () => {
    try {
      Object.keys(localStorage)
        .filter(key => key.startsWith(CACHE_KEY_PREFIX))
        .forEach(key => localStorage.removeItem(key));
      console.log('Cache cleared successfully');
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };
  
  // Public API
  return {
    fetchChapterData,
    getAllChapters,
    getVerse,
    getChapterInfo,
    clearCache
  };
})();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataLoader;
}
