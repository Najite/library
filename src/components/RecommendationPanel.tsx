import React from 'react';
import { Lightbulb, Search } from 'lucide-react';
import { AIRecommendation } from '../types';

interface RecommendationPanelProps {
  recommendations: AIRecommendation | null;
  onSearchRecommendation: (query: string) => void;
  isVisible: boolean;
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({
  recommendations,
  onSearchRecommendation,
  isVisible
}) => {
  if (!isVisible || !recommendations) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 mb-8">
      <div className="flex items-start gap-3">
        <Lightbulb className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 mb-3">AI Recommendations</h3>
          
          {recommendations.enhancedQuery && (
            <div className="mb-4">
              <h4 className="font-medium text-amber-800 mb-2">Enhanced Search:</h4>
              <button
                onClick={() => onSearchRecommendation(recommendations.enhancedQuery)}
                className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                "{recommendations.enhancedQuery}"
              </button>
            </div>
          )}
          
          {recommendations.recommendations.length > 0 && (
            <div className="mb-4">
              <h4 className="font-medium text-amber-800 mb-2">Suggested Books:</h4>
              <div className="space-y-1">
                {recommendations.recommendations.map((rec, index) => (
                  <button
                    key={index}
                    onClick={() => onSearchRecommendation(rec)}
                    className="block text-left text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    • {rec}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {recommendations.searchTerms.length > 0 && (
            <div>
              <h4 className="font-medium text-amber-800 mb-2">Alternative Searches:</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations.searchTerms.map((term, index) => (
                  <button
                    key={index}
                    onClick={() => onSearchRecommendation(term)}
                    className="px-3 py-1 bg-white border border-amber-300 text-amber-700 rounded-full text-sm hover:bg-amber-100 transition-colors flex items-center gap-1"
                  >
                    <Search className="w-3 h-3" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};