import { GoogleGenerativeAI } from '@google/generative-ai';
import { supabase } from './supabase';
import { Trie } from '../dataStructures/Trie';
import { DrugInteractionGraph, DrugNode, DrugInteraction } from '../dataStructures/Graph';
import { PatientHashMap, PatientData } from '../dataStructures/PatientHashMap';

export class PrescriptionAnalyzer {
  private drugTrie = new Trie();
  private interactionGraph = new DrugInteractionGraph();
  private patientData = new PatientHashMap();
  private genAI: GoogleGenerativeAI;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) console.error('VITE_GEMINI_API_KEY is not set in environment variables');
    this.genAI = new GoogleGenerativeAI(apiKey || '');
    this.initializeDrugDatabase();
    this.initializePatientData();
  }

  private initializePatientData(): void {
    this.patientData.addPatient({
      id: '1',
      name: 'John Smith',
      dateOfBirth: new Date('1979-03-15'),
      weight: 75,
      height: 180,
      allergies: ['penicillin-allergy'],
      conditions: ['hypertension'],
      vitals: { bloodPressure: '120/80', heartRate: 72, temperature: 36.8, oxygenSaturation: 98, lastUpdated: new Date() },
      medications: [{ medicationId: 'metformin', startDate: new Date('2024-01-01'), dosage: '500mg', frequency: 'twice daily' }]
    });
  }

  private initializeDrugDatabase(): void {
    const drugs = [
      { id: 'amoxicillin', name: 'Amoxicillin', category: 'antibiotic', dosageRange: { min: 250, max: 875 }, contraindications: ['penicillin-allergy'] },
      { id: 'metformin', name: 'Metformin', category: 'antidiabetic', dosageRange: { min: 500, max: 2000 }, contraindications: ['kidney-disease'] },
      { id: 'lisinopril', name: 'Lisinopril', category: 'ace-inhibitor', dosageRange: { min: 5, max: 40 }, contraindications: ['pregnancy', 'angioedema'] }
    ];
    
    drugs.forEach(drug => {
      this.drugTrie.insert(drug.name, drug);
      this.interactionGraph.addDrug(new DrugNode(drug.id, drug.name, drug.category, drug.dosageRange, drug.contraindications));
    });
    
    this.interactionGraph.addInteraction('amoxicillin', 'metformin', new DrugInteraction(3, 'Moderate interaction risk', ['Monitor blood glucose more frequently']));
    this.interactionGraph.addInteraction('lisinopril', 'metformin', new DrugInteraction(2, 'Minor interaction risk', ['Monitor blood pressure regularly']));
  }

  private async analyzeWithAI(prescriptionText: string) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = `Extract medication information from this prescription text. Return ONLY a JSON object with these exact keys: medication, dosage, frequency, duration. Example: {"medication": "Amoxicillin", "dosage": "500mg", "frequency": "twice daily", "duration": "7 days"}. Here's the prescription text to analyze: "${prescriptionText}"`;
      const result = await model.generateContent(prompt);
      if (!result?.response) throw new Error('No response from AI model');
      let text = result.response.text();
      if (!text) throw new Error('Empty response from AI model');
      text = text.replace(/```json\n?|```/g, '').trim(); 
      return JSON.parse(text);
    } catch (error) {
      console.error('AI Analysis Error:', error instanceof Error ? error.message : 'Unknown error occurred');
      throw error;
    }
  }

  async analyzePrescription(prescriptionText: string, patientId: string) {
    try {
      if (!prescriptionText.trim()) throw new Error('Prescription text is required');
      if (!patientId) throw new Error('Patient ID is required');

      const analysis = await this.analyzeWithAI(prescriptionText);
      const medicationMatches = this.drugTrie.findSimilar(analysis.medication);
      const medicationMatch = medicationMatches[0];
      if (!medicationMatch) {
        return { confidence: 30, medication: analysis.medication, dosage: analysis.dosage, warnings: ['Medication not recognized in our database'], suggestions: ['Please verify the medication name with a pharmacist'] };
      }

      const patient = this.patientData.getPatient(patientId);
      if (!patient) throw new Error(`Patient not found: ${patientId}`);

      const warnings: string[] = [];
      const suggestions: string[] = [];
      if (patient.allergies.some(allergy => medicationMatch.data.contraindications.includes(allergy))) {
        warnings.push(`Patient has a known allergy to ${medicationMatch.data.category}`);
        suggestions.push('Consider alternative medication');
      }
      
      patient.medications.forEach(med => {
        const interaction = this.interactionGraph.findInteractions(medicationMatch.data.id).get(med.medicationId);
        if (interaction) {
          warnings.push(interaction.description);
          suggestions.push(...interaction.recommendations);
        }
      });

      let confidence = 85;
      if (warnings.length) confidence -= 10;
      if (!analysis.frequency || !analysis.duration) confidence -= 5;
      
      return { confidence, medication: medicationMatch.data.name, dosage: analysis.dosage, warnings, suggestions };
    } catch (error) {
      console.error('Prescription Analysis Error:', error instanceof Error ? error.message : 'Unknown error occurred');
      return { confidence: 0, medication: '', dosage: '', warnings: [`Error analyzing prescription: ${error instanceof Error ? error.message : 'Unknown error occurred'}`], suggestions: ['Please try again or contact support'] };
    }
  }
}
