import React from 'react';
import { AlertTriangle, CheckCircle, Brain } from 'lucide-react';

interface AIAnalysisProps {
  analysis: {
    confidence: number;
    warnings: string[];
    suggestions: string[];
  };
  isLoading?: boolean;
}

export const AIAnalysis: React.FC<AIAnalysisProps> = ({ analysis, isLoading }) => {
  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4 p-6 bg-white rounded-lg shadow-md">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
        <Brain className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold text-blue-900">AI Analysis Results</h3>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-500 rounded-full h-2" 
              style={{ width: `${analysis.confidence}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {analysis.confidence}% confidence
          </span>
        </div>

        {analysis.warnings.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-amber-700 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Warnings
            </h4>
            <ul className="space-y-1">
              {analysis.warnings.map((warning, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-amber-500">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysis.suggestions.length > 0 && (
          <div className="space-y-2">
            <h4 className="flex items-center gap-2 text-green-700 font-medium">
              <CheckCircle className="h-4 w-4" />
              Suggestions
            </h4>
            <ul className="space-y-1">
              {analysis.suggestions.map((suggestion, idx) => (
                <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                  <span className="text-green-500">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};