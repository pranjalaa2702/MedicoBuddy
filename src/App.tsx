import React, { useState, useEffect } from 'react';
import { PrescriptionScanner } from './components/PrescriptionScanner';
import { AIAnalysis } from './components/AIAnalysis';
import { UploadHistory } from './components/UploadHistory';
import { Activity, Heart } from 'lucide-react';
import { PrescriptionAnalyzer } from './lib/services/PrescriptionAnalyzer';
import type { UploadHistory as UploadHistoryType } from './types';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryType[]>([]);
  const [prescriptionAnalyzer] = useState(() => new PrescriptionAnalyzer());

  const [activePatient] = useState({
    id: '1',
    name: 'Pranjalaa Rai',
    age: 20,
    bloodType: 'B+',
    lastVisit: '2024/11/15',
    nextAppointment: '2025/03/01',
    vitals: {
      bp: '120/80',
      heartRate: '72',
      temperature: '98.6°F'
    }
  });

  const handleScan = async (image: string) => {
    setIsAnalyzing(true);
    try {
      const prescriptionText = "Amoxicillin 500mg";
      
      const result = await prescriptionAnalyzer.analyzePrescription(
        prescriptionText,
        activePatient.id
      );

      // Add to upload history
      const newUpload: UploadHistoryType = {
        id: Date.now().toString(),
        patientId: activePatient.id,
        imageUrl: image,
        uploadedAt: new Date().toISOString(),
        prescriptionId: Date.now().toString(),
        status: 'processed'
      };
      
      setUploadHistory(prev => [newUpload, ...prev]);
      setAnalysis({
        confidence: result.confidence,
        prescriptionDetails: {
          medication: result.medication,
          dosage: result.dosage,
          frequency: "3 times daily",
          duration: "7 days"
        },
        warnings: result.warnings,
        suggestions: result.suggestions,
        vitalSigns: {
          bloodPressure: activePatient.vitals.bp,
          heartRate: activePatient.vitals.heartRate,
          temperature: activePatient.vitals.temperature
        }
      });
    } catch (error) {
      console.error('Error analyzing prescription:', error);
      // Add failed upload to history
      const failedUpload: UploadHistoryType = {
        id: Date.now().toString(),
        patientId: activePatient.id,
        imageUrl: image,
        uploadedAt: new Date().toISOString(),
        prescriptionId: Date.now().toString(),
        status: 'failed'
      };
      setUploadHistory(prev => [failedUpload, ...prev]);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50">
      <main className="p-8">
        <div className="max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-semibold text-pink-900">Patient Overview</h1>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-lg hover:bg-pink-700"
              >
                {showHistory ? 'New Prescription' : 'View History'}
              </button>
            </div>
          </header>

          {showHistory ? (
            <UploadHistory 
              history={uploadHistory} 
              onSelect={(upload) => {
                setShowHistory(false);
                setAnalysis({
                  ...analysis,
                  imageUrl: upload.imageUrl
                });
              }} 
            />
          ) : (
            <div className="grid grid-cols-12 gap-6">
              {/* Patient Info */}
              <div className="col-span-4 bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-4 mb-6">
                  <img
                    src="./IMG_5639.jpg"
                    alt="Patient"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{activePatient.name}</h2>
                    <p className="text-sm text-gray-500">Patient ID: #{activePatient.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-500">Age</p>
                    <p className="text-lg font-medium text-gray-900">{activePatient.age}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50">
                    <p className="text-sm text-gray-500">Blood Type</p>
                    <p className="text-lg font-medium text-gray-900">{activePatient.bloodType}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50">
                    <div>
                      <p className="text-sm text-blue-600">Last Visit</p>
                      <p className="text-sm font-medium text-blue-900">{activePatient.lastVisit}</p>
                    </div>
                    <Activity className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="col-span-8 bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Vitals</h3>
                <div className="grid grid-cols-3 gap-6">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">Blood Pressure</span>
                    </div>
                    <p className="text-2xl font-semibold text-blue-900">{activePatient.vitals.bp}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-red-50 to-red-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-red-600" />
                      </div>
                      <span className="text-sm font-medium text-red-900">Heart Rate</span>
                    </div>
                    <p className="text-2xl font-semibold text-red-900">{activePatient.vitals.heartRate} bpm</p>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100/50">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Activity className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-blue-900">Temperature</span>
                    </div>
                    <p className="text-2xl font-semibold text-blue-900">{activePatient.vitals.temperature}</p>
                  </div>
                </div>
              </div>

              {/* Prescription Scanner */}
              <div className="col-span-6 bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Scan Prescription</h2>
                <PrescriptionScanner onScan={handleScan} />
              </div>

              {/* AI Analysis */}
              <div className="col-span-6">
                {(isAnalyzing || analysis) && (
                  <AIAnalysis 
                    analysis={analysis || {
                      confidence: 0,
                      warnings: [],
                      suggestions: []
                    }}
                    isLoading={isAnalyzing}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;