import React from 'react';
import type { UploadHistory as UploadHistoryType } from '../types';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

interface UploadHistoryProps {
  history: UploadHistoryType[];
  onSelect: (upload: UploadHistoryType) => void;
}

export const UploadHistory: React.FC<UploadHistoryProps> = ({ history, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Upload History</h2>
      
      {history.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No prescriptions uploaded yet
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((upload) => (
            <div
              key={upload.id}
              className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-blue-200 transition-colors cursor-pointer"
              onClick={() => onSelect(upload)}
            >
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={upload.imageUrl}
                    alt="Prescription"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">
                      Prescription #{upload.prescriptionId.slice(-4)}
                    </p>
                    {upload.status === 'processed' ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(upload.uploadedAt).toLocaleDateString()} at{' '}
                    {new Date(upload.uploadedAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};