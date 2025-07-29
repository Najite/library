// src/services/bookService.ts
import axios from 'axios';
import { Book, SearchResult } from '../types';
import { getAIRecommendations } from './aiService';

const OPEN_LIBRARY_BASE = 'https://openlibrary.org';
const ARCHIVE_BASE      = 'https://archive.org';

/* ------------------------------------------------------------------ */
/* 1. Open Library helpers                                              */
/* ------------------------------------------------------------------ */
export const searchOpenLibrary = async (
  query: string,
  limit = 20
): Promise<Book[]> => {
  try {
    const { data } = await axios.get(`${OPEN_LIBRARY_BASE}/search.json`, {
      params: {
        q: query,
        limit,
        fields: 'key,title,author_name,isbn,publish_year,subject,cover_i'
      }
    });

    return data.docs.map((doc: any) => ({
      id: doc.key,
      title: doc.title || 'Unknown Title',
      author: doc.author_name || ['Unknown Author'],
      isbn: doc.isbn?.[0],
      publishYear: doc.publish_year?.[0],
      subjects: doc.subject?.slice(0, 5) || [],
      coverUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`
        : undefined,
      source: 'openlibrary' as const
    }));
  } catch (err) {
    console.error('OpenLibrary search error:', err);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* 2. Internet Archive helpers                                        */
/* ------------------------------------------------------------------ */
export const getArchiveMetadata = async (identifier: string) => {
  try {
    const { data } = await axios.get(`${ARCHIVE_BASE}/metadata/${identifier}`);
    const files: any[] = data.files || [];

    // EPUB download link (if any)
    const epubFile = files.find((f) => f.name.toLowerCase().endsWith('.epub'));

    // Always provide a cover via the official service
    const coverUrl = `https://archive.org/services/img/${identifier}`;

    return {
      downloadUrl: epubFile
        ? `${ARCHIVE_BASE}/download/${identifier}/${epubFile.name}`
        : undefined,
      coverUrl
    };
  } catch (err) {
    console.error('Archive metadata error:', err);
    return null;
  }
};

export const searchInternetArchive = async (
  query: string,
  limit = 20
): Promise<Book[]> => {
  try {
    const { data } = await axios.get(`${ARCHIVE_BASE}/advancedsearch.php`, {
      params: {
        q: `${query} AND mediatype:texts AND format:epub`,
        fl: 'identifier,title,creator,subject,year',
        output: 'json',
        rows: limit
      }
    });

    const books = await Promise.all(
      data.response.docs.map(async (doc: any) => {
        const meta = await getArchiveMetadata(doc.identifier);
        return {
          id: doc.identifier,
          title: doc.title || 'Unknown Title',
          author: Array.isArray(doc.creator)
            ? doc.creator
            : [doc.creator || 'Unknown Author'],
          publishYear: parseInt(doc.year) || undefined,
          subjects: Array.isArray(doc.subject)
            ? doc.subject.slice(0, 5)
            : [doc.subject].filter(Boolean),
          downloadUrl: meta?.downloadUrl,
          coverUrl: meta?.coverUrl,
          source: 'archive' as const
        };
      })
    );

    return books;
  } catch (err) {
    console.error('Internet Archive search error:', err);
    return [];
  }
};

/* ------------------------------------------------------------------ */
/* 3. AI Recommendation to Book conversion                           */
/* ------------------------------------------------------------------ */
const convertAIRecommendationToBook = (recommendation: string, index: number, originalQuery: string): Book => {
  // Parse "Title by Author" format
  const titleAuthorMatch = recommendation.match(/^(.*?)\s+by\s+(.*)$/i);
  const title = titleAuthorMatch ? titleAuthorMatch[1].trim() : recommendation;
  const author = titleAuthorMatch ? titleAuthorMatch[2].trim().split(',').map(a => a.trim()) : ['Unknown Author'];
  
  return {
    id: `ai-rec-${index}`,
    title,
    author,
    subjects: [`AI recommended for: ${originalQuery}`],
    source: 'ai-recommendation' as const,
    isAIRecommendation: true,
    // Generate a placeholder cover or use a default
    coverUrl: `https://via.placeholder.com/200x300/4F46E5/FFFFFF?text=${encodeURIComponent(title.substring(0, 20))}`
  };
};

/* ------------------------------------------------------------------ */
/* 4. Enhanced unified search with AI recommendations               */
/* ------------------------------------------------------------------ */
export const searchBooks = async (query: string, includeAI: boolean = true): Promise<SearchResult> => {
  try {
    // Get AI recommendations first (parallel with other searches)
    const aiPromise = includeAI ? getAIRecommendations(query) : Promise.resolve(null);
    
    // Run all searches in parallel
    const [aiData, openLibraryBooks, archiveBooks] = await Promise.all([
      aiPromise,
      searchOpenLibrary(query),
      searchInternetArchive(query)
    ]);

    let allBooks: Book[] = [];
    let enhancedQuery = query;
    let searchTerms: string[] = [];

    // Add AI recommendations as books if available
    if (aiData) {
      enhancedQuery = aiData.enhancedQuery;
      searchTerms = aiData.searchTerms;
      
      const aiBooks = aiData.recommendations.map((rec, index) => 
        convertAIRecommendationToBook(rec, index, query)
      );
      allBooks = [...aiBooks];

      // If we have an enhanced query that's different from original, search with it too
      if (aiData.enhancedQuery !== query && aiData.enhancedQuery.length > 0) {
        try {
          const [enhancedOpenLibrary, enhancedArchive] = await Promise.all([
            searchOpenLibrary(aiData.enhancedQuery, 10),
            searchInternetArchive(aiData.enhancedQuery, 10)
          ]);
          allBooks = [...allBooks, ...enhancedOpenLibrary, ...enhancedArchive];
        } catch (enhancedSearchError) {
          console.error('Enhanced search failed:', enhancedSearchError);
        }
      }
    }

    // Add original search results
    allBooks = [...allBooks, ...openLibraryBooks, ...archiveBooks];

    // If we have few results and AI provided search terms, try those too
    if (allBooks.filter(b => !b.isAIRecommendation).length < 5 && searchTerms.length > 0) {
      for (const term of searchTerms.slice(0, 2)) { // Limit to 2 additional searches
        try {
          const [termOpenLibrary, termArchive] = await Promise.all([
            searchOpenLibrary(term, 10),
            searchInternetArchive(term, 10)
          ]);
          allBooks = [...allBooks, ...termOpenLibrary, ...termArchive];
        } catch (termSearchError) {
          console.error(`Search with term "${term}" failed:`, termSearchError);
        }
      }
    }

    // Deduplicate on lowercase title, but keep AI recommendations
    const uniqueBooks = allBooks.filter((book, idx, arr) => {
      if (book.isAIRecommendation) return true; // Always keep AI recommendations
      
      return idx === arr.findIndex((b) => 
        !b.isAIRecommendation && 
        b.title.toLowerCase() === book.title.toLowerCase()
      );
    });

    // Sort so AI recommendations appear first
    const sortedBooks = uniqueBooks.sort((a, b) => {
      if (a.isAIRecommendation && !b.isAIRecommendation) return -1;
      if (!a.isAIRecommendation && b.isAIRecommendation) return 1;
      return 0;
    });

    return {
      books: sortedBooks,
      totalResults: sortedBooks.length,
      query,
      enhancedQuery,
      searchTerms,
      aiRecommendationsCount: sortedBooks.filter(b => b.isAIRecommendation).length
    };

  } catch (error) {
    console.error('Enhanced search error:', error);
    
    // Fallback to original search without AI
    const [openLibraryBooks, archiveBooks] = await Promise.all([
      searchOpenLibrary(query),
      searchInternetArchive(query)
    ]);

    const allBooks = [...openLibraryBooks, ...archiveBooks];
    const uniqueBooks = allBooks.filter(
      (book, idx, arr) =>
        idx === arr.findIndex((b) => b.title.toLowerCase() === book.title.toLowerCase())
    );

    return {
      books: uniqueBooks,
      totalResults: uniqueBooks.length,
      query
    };
  }
};