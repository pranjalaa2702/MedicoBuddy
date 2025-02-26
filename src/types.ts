export interface Patient {
  id: string;
  name: string;
  age: number;
  weight: number;
  allergies: string[];
  medicalHistory: string[];
}

export interface Prescription {
  id: string;
  patientId: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  createdAt: string;
  status: 'pending' | 'validated' | 'flagged';
  imageUrl?: string;
  originalText?: string;
  aiAnalysis?: {
    confidence: number;
    warnings: string[];
    suggestions: string[];
  };
}

export interface UploadHistory {
  id: string;
  patientId: string;
  imageUrl: string;
  uploadedAt: string;
  prescriptionId: string;
  status: 'processed' | 'failed';
}