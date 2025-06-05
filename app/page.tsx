"use client";
import { useState } from "react";
import {Stethoscope} from "lucide-react";
import MainLayout from '@/components/MainLayout';
import ChatBox from '@/components/Chatbot'; 
import Footer from "@/components/Footer";
import NearbyDoctors from '@/components/Nearbydoctor';
import AnalysisResults from '@/components/Results';
import { MapPin } from "lucide-react";

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
  const [userCoordinates, setUserCoordinates] = useState<{
    latitude: number;
    longitude: number;
    city: string;
  } | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);

  const handleLocationDetection = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation(true);
          setUserCoordinates({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            city: "Unknown" 
          });
        },
        (error) => {
          console.error("Error getting location:", error);
          setUserLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  const handleAnalysisComplete = (results: AnalysisResult) => {
    setAnalysisResults(results);
    setShowResults(true);
  };

  return (
    <MainLayout>
      <div className="flex flex-col h-[calc(100vh-0rem)]">
        
        <header className="bg-white border-b-2 border-black p-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Title section - now centered on mobile */}
        <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
          <h1 className="text-xl md:text-2xl font-bold flex items-center">
            <Stethoscope className="w-4 h-4 md:w-5 md:h-5" />
            <span className="mr-2"></span>AvaCare
          </h1>
          <h3 className="text-black font-bold text-xs md:text-sm">
            Driven results with up to 90% accuracy
          </h3>
        </div>

        {/* Buttons - centered on mobile */}
        <div className="w-full sm:w-auto flex justify-center sm:block">
          {!userLocation ? (
            <button
              onClick={handleLocationDetection}
              className="flex items-center justify-center 
                       px-4 py-2 md:px-6 md:py-3 
                       text-sm md:text-base 
                       bg-[#f5ff23] text-black font-bold 
                       rounded-lg border-2 border-black 
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                       hover:bg-[#E5Ef20] 
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                       hover:translate-x-[2px] hover:translate-y-[2px] 
                       transition-all 
                       w-full sm:w-auto"
            >
              <MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              <span>Find Doctors</span>
            </button>
          ) : (
            <div
              className="flex items-center justify-center 
                       text-xs sm:text-sm 
                       bg-[#f8fed5] text-black 
                       px-3 py-1 sm:px-4 sm:py-2 
                       rounded-lg border-2 border-black 
                       font-bold w-full sm:w-auto"
            >
              <MapPin className="mr-2 w-4 h-4 md:w-5 md:h-5" />
              <span>Location Active</span>
            </div>
          )}
        </div>
      </div>
    </header>
        <main className="flex-1 overflow-y-auto p-4 bg-white">
          <ChatBox onAnalysisComplete={handleAnalysisComplete} />

          {showResults && analysisResults && (
            <AnalysisResults analysisResults={analysisResults} />
          )}

          <NearbyDoctors 
            userLocation={userLocation}
            onLocationDetect={handleLocationDetection}
            conditions={analysisResults?.conditions || []}
            userCoords={userCoordinates || undefined}
          />
          
          <Footer/>
        </main>
      </div>
    </MainLayout>
  );
}