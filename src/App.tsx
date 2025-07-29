import React, { useState } from 'react';
import { BookOpen, Brain, Globe } from 'lucide-react';
import { SearchBar } from './components/SearchBar';
import { BookGrid } from './components/BookGrid';
import { RecommendationPanel } from './components/RecommendationPanel';
import { searchBooks } from './services/bookService';
import { getAIRecommendations } from './services/aiService';
import { Book, AIRecommendation } from './types';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState('');
  const [aiRecommendations, setAiRecommendations] = useState<AIRecommendation | null>(null);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleSearch = async (query: string) => {
    setIsLoading(true);
    setCurrentQuery(query);
    setShowRecommendations(false);

    try {
      // Get AI recommendations first
      const aiRecs = await getAIRecommendations(query);
      setAiRecommendations(aiRecs);
      
      // Search for books using the enhanced query
      const searchQuery = aiRecs.enhancedQuery || query;
      const results = await searchBooks(searchQuery);
      
      setBooks(results.books);
      setShowRecommendations(true);
    } catch (error) {
      console.error('Search failed:', error);
      setBooks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendationSearch = (query: string) => {
    handleSearch(query);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center space-x-3 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Library</h1>
              <p className="text-gray-600">Discover books with intelligent recommendations</p>
            </div>
          </div>
          
          <SearchBar onSearch={handleSearch} isLoading={isLoading} />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        {currentQuery && !isLoading && (
          <div className="mb-8">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-1">
                    Search Results for "{currentQuery}"
                  </h2>
                  <p className="text-gray-600">
                    Found {books.length} books from Open Library and Internet Archive
                  </p>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-1" />
                    <span>Open Library</span>
                  </div>
                  <div className="flex items-center">
                    <Brain className="w-4 h-4 mr-1" />
                    <span>AI Enhanced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* AI Recommendations */}
        <RecommendationPanel
          recommendations={aiRecommendations}
          onSearchRecommendation={handleRecommendationSearch}
          isVisible={showRecommendations}
        />

        {/* Book Grid */}
        <BookGrid books={books} isLoading={isLoading} />

        {/* Welcome State */}
        {!currentQuery && !isLoading && (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-12 h-12 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to AI Library
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-8">
              Discover millions of books from Open Library and Internet Archive. 
              Use our AI-powered search to find exactly what you're looking for, 
              or get personalized recommendations based on your interests.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <Brain className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">AI-Powered Search</h3>
                <p className="text-gray-600 text-sm">
                  Our AI understands your search intent and provides enhanced results
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <Globe className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Vast Library</h3>
                <p className="text-gray-600 text-sm">
                  Access millions of books from trusted sources worldwide
                </p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <BookOpen className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Direct Downloads</h3>
                <p className="text-gray-600 text-sm">
                  Download EPUB files directly to your device for offline reading
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-400">
              Powered by Open Library & Internet Archive • Enhanced with AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;