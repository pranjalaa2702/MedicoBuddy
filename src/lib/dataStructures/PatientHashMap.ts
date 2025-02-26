export interface PatientVitals {
  bloodPressure: string;
  heartRate: number;
  temperature: number;
  oxygenSaturation: number;
  lastUpdated: Date;
}

export interface MedicationHistory {
  medicationId: string;
  startDate: Date;
  endDate?: Date;
  dosage: string;
  frequency: string;
  reactions?: string[];
}

export interface PatientData {
  id: string;
  name: string;
  dateOfBirth: Date;
  weight: number;
  height: number;
  allergies: string[];
  conditions: string[];
  vitals: PatientVitals;
  medications: MedicationHistory[];
}

export class PatientHashMap {
  private data: Map<string, PatientData>;
  private vitalThresholds: Map<string, { min: number; max: number }>;

  constructor() {
    this.data = new Map();
    this.vitalThresholds = new Map([
      ['heartRate', { min: 60, max: 100 }],
      ['temperature', { min: 36.5, max: 37.5 }],
      ['oxygenSaturation', { min: 95, max: 100 }]
    ]);
  }

  addPatient(patient: PatientData): void {
    this.data.set(patient.id, patient);
  }

  getPatient(id: string): PatientData | undefined {
    return this.data.get(id);
  }

  updateVitals(id: string, vitals: Partial<PatientVitals>): void {
    const patient = this.data.get(id);
    if (!patient) throw new Error('Patient not found');

    patient.vitals = {
      ...patient.vitals,
      ...vitals,
      lastUpdated: new Date()
    };
  }

  addMedication(id: string, medication: MedicationHistory): void {
    const patient = this.data.get(id);
    if (!patient) throw new Error('Patient not found');

    patient.medications.push(medication);
  }

  checkVitalWarnings(id: string): Array<{ vital: string; value: number; status: 'high' | 'low' }> {
    const patient = this.data.get(id);
    if (!patient) throw new Error('Patient not found');

    const warnings = [];
    const vitals = patient.vitals;

    for (const [vital, threshold] of this.vitalThresholds) {
      const value = vitals[vital as keyof PatientVitals] as number;
      if (value < threshold.min) {
        warnings.push({ vital, value, status: 'low' });
      } else if (value > threshold.max) {
        warnings.push({ vital, value, status: 'high' });
      }
    }

    return warnings;
  }

  getMedicationHistory(id: string): MedicationHistory[] {
    const patient = this.data.get(id);
    if (!patient) throw new Error('Patient not found');

    return patient.medications;
  }

  hasAllergy(id: string, allergen: string): boolean {
    const patient = this.data.get(id);
    if (!patient) throw new Error('Patient not found');

    return patient.allergies.some(a => 
      a.toLowerCase().includes(allergen.toLowerCase())
    );
  }

  hasCondition(id: string, condition: string): boolean {
    const patient = this.data.get(id);
    if (!patient) throw new Error('Patient not found');

    return patient.conditions.some(c => 
      c.toLowerCase().includes(condition.toLowerCase())
    );
  }
}