"use client";
import { useState } from "react";
import MainLayout from '@/components/MainLayout';
import ChatBox from '@/components/Chatbot'; 
import NearbyDoctors from '@/components/Nearbydoctor';
import AnalysisResults from '@/components/Results';

import { 
  MapPin
} from "lucide-react";

// Add the missing interface definitions
interface Symptom {
  name: string;
  severity?: number;
  duration?: string;
}

interface Diagnosis {
  condition: string;
  confidence: number;
}

interface MedicalRecommendation {
  action: string;
  emergencySigns: string[];
  doctors?: {
    name: string;
    specialty: string;
    phone: string;
  }[];
}

interface Condition {
  name: string;
  confidence: "High" | "Medium" | "Low";
  description: string;
  symptoms: string[];
  advice: string;
  severity: "Emergency" | "Urgent" | "Moderate" | "Mild";
}

interface AnalysisResult {
  conditions: Condition[];
}

interface Report {
  id: string;
  userId: string;
  dateTime: string;
  symptoms: Symptom[];
  analysisResults: AnalysisResult;
  riskLevel: 'low' | 'moderate' | 'high';
  nextSteps: string;
  reasoning: string;
  possibleDiagnoses: Diagnosis[];
  relatedConditions: string[];
  recommendations: MedicalRecommendation;
  userNotes?: string;
}

export default function SymptomCheckerUI() {
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const detectLocation = () => {
    setUserLocation(true);
  };

  const handleAnalysisComplete = (results: AnalysisResult) => {
    setAnalysisResults(results);
    setShowResults(true);
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b-2 border-black p-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold flex items-center">
                <span className="mr-2">🩺</span> Dr.AI
              </h1>
              <p className="text-black mt-2">Advanced AI symptom analysis with 80-95% accuracy</p>
            </div>
            {!userLocation ? (
              <button
                onClick={detectLocation}
                className="flex items-center px-6 py-3 
                         bg-[#f5ff23] 
                         text-black font-bold rounded-lg 
                         border-2 border-black 
                         shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                         hover:bg-[#E5Ef20] 
                         hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                         hover:translate-x-[2px] hover:translate-y-[2px] 
                         transition-all"
              >
                <MapPin className="mr-2" /> Find Doctors
              </button>
            ) : (
              <div className="flex items-center text-sm bg-[#f8fed5] px-4 py-2 rounded-lg border-2 border-black font-bold">
                <MapPin className="mr-2" /> Location Active
              </div>
            )}
          </div>
        </header>

        {/* Chat and Results */}
        <main className="flex-1 overflow-y-auto p-4 pb-6 bg-gradient-to-br from-blue-50 to-green-50">
          {/* Enhanced ChatBox Component */}
          <ChatBox onAnalysisComplete={handleAnalysisComplete} />

          {/* AnalysisResults Component */}
          {showResults && analysisResults && (
            <AnalysisResults analysisResults={analysisResults} />
          )}

          {/* NearbyDoctors Component */}
          <NearbyDoctors 
            userLocation={userLocation} 
            onLocationDetect={detectLocation} 
          />
        </main>

        <footer className="bg-white border-t-2 border-black p-4 text-center text-sm">
          <div className="max-w-4xl mx-auto">
            <p className="font-bold">© {new Date().getFullYear()} Dr.AI - Advanced Medical AI Platform. All rights reserved.</p>
            <div className="flex justify-center space-x-6 mt-2">
              <a href="#" className="hover:underline font-medium">Privacy Policy</a>
              <a href="#" className="hover:underline font-medium">Terms of Service</a>
              <a href="#" className="hover:underline font-medium">Medical Disclaimer</a>
              <a href="#" className="hover:underline font-medium">Contact Support</a>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}