export interface Symptom {
  name: string;
  severity?: number;
  duration?: string;
}

export interface Diagnosis {
  condition: string;
  confidence: number;
}

export interface MedicalRecommendation {
  action: string;
  emergencySigns: string[];
  doctors?: {
    name: string;
    specialty: string;
    phone: string;
  }[];
}

export interface Report {
  id: string;
  userId: string;
  dateTime: string;
  symptoms: Symptom[];
  diagnosis: string;
  riskLevel: 'low' | 'moderate' | 'high';
  nextSteps: string;
  reasoning: string;
  possibleDiagnoses: Diagnosis[];
  relatedConditions: string[];
  recommendations: MedicalRecommendation;
  userNotes?: string;
}

export interface ReportHistory {
  reports: Report[];
}