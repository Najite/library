import React from 'react';
import { BookCard } from './BookCard';
import { Book } from '../types';

interface BookGridProps {
  books: Book[];
  isLoading: boolean;
}

export const BookGrid: React.FC<BookGridProps> = ({ books, isLoading }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden animate-pulse">
            <div className="w-full h-64 bg-gray-300" />
            <div className="p-6">
              <div className="h-6 bg-gray-300 rounded mb-2" />
              <div className="h-4 bg-gray-300 rounded mb-3 w-3/4" />
              <div className="h-4 bg-gray-300 rounded mb-2 w-1/2" />
              <div className="h-8 bg-gray-300 rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-600 mb-2">No books found</h3>
        <p className="text-gray-500">Try searching with different keywords or check our AI recommendations above.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book, index) => (
        <BookCard key={`${book.source}-${book.id}-${index}`} book={book} />
      ))}
    </div>
  );
};