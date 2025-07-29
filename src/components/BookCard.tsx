import React, { useState } from 'react';
import { Download, Book as BookIcon, Calendar, Tag, ExternalLink } from 'lucide-react';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

  const handleDownload = async () => {
    if (!book.downloadUrl) return;
    
    // Direct download using browser's built-in download functionality
    // This bypasses CORS issues by letting the browser handle the download
    const link = document.createElement('a');
    link.href = book.downloadUrl;
    link.download = `${book.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        {book.coverUrl ? (
          <img 
            src={book.coverUrl} 
            alt={book.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        
        <div className={`w-full h-64 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${book.coverUrl ? 'hidden' : ''}`}>
          <BookIcon className="w-16 h-16 text-white opacity-50" />
        </div>
        
        <div className="absolute top-2 right-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
            book.source === 'archive' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {book.source === 'archive' ? 'Archive' : 'Library'}
          </span>
        </div>
      </div>
      
      <div className="p-6">
        <h3 className="font-bold text-xl mb-2 line-clamp-2 text-gray-900">
          {book.title}
        </h3>
        
        <p className="text-gray-600 mb-3">
          by {book.author.join(', ')}
        </p>
        
        {book.publishYear && (
          <div className="flex items-center text-gray-500 text-sm mb-2">
            <Calendar className="w-4 h-4 mr-1" />
            {book.publishYear}
          </div>
        )}
        
        {book.subjects && book.subjects.length > 0 && (
          <div className="flex items-start text-gray-500 text-sm mb-4">
            <Tag className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
            <div className="flex flex-wrap gap-1">
              {book.subjects.slice(0, 3).map((subject, index) => (
                <span 
                  key={index}
                  className="bg-gray-100 px-2 py-1 rounded text-xs"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex gap-2">
          {book.downloadUrl && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? `${Math.round(downloadProgress)}%` : 'Download EPUB'}
            </button>
          )}
          
          <a
            href={book.source === 'archive' 
              ? `https://archive.org/details/${book.id}` 
              : `https://openlibrary.org${book.id}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
        
        {isDownloading && downloadProgress > 0 && (
          <div className="mt-2 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};