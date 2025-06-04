import { 
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp,
  Zap,
  Activity,
  Download,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import { LuClipboardList } from "react-icons/lu";
import { useState } from "react";
import { useRouter } from 'next/navigation';

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
  timestamp?: string;
  reportId?: string;
}

interface AnalysisResultsProps {
  analysisResults: AnalysisResult;
}

export default function AnalysisResults({ analysisResults }: AnalysisResultsProps) {
  const [expandedCard, setExpandedCard] = useState<number | null>(0);
  const router = useRouter();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Emergency": return "bg-red-100 text-red-900 border-red-400";
      case "Urgent": return "bg-orange-100 text-orange-900 border-orange-400";
      case "Moderate": return "bg-yellow-100 text-yellow-900 border-yellow-400";
      case "Mild": return "bg-green-100 text-green-900 border-green-400";
      default: return "bg-gray-100 text-gray-900 border-gray-400";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High": return "bg-red-50 text-red-800 border-red-300";
      case "Medium": return "bg-yellow-50 text-yellow-800 border-yellow-300";
      case "Low": return "bg-green-50 text-green-800 border-green-300";
      default: return "bg-gray-50 text-gray-800 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "Emergency": return <AlertTriangle className="text-red-600" size={16} />;
      case "Urgent": return <Clock className="text-orange-600" size={16} />;
      case "Moderate": return <TrendingUp className="text-yellow-600" size={16} />;
      case "Mild": return <Shield className="text-green-600" size={16} />;
      default: return <Shield className="text-gray-600" size={16} />;
    }
  };

  const handleGenerateReport = () => {
    const reportData = {
      ...analysisResults,
      timestamp: new Date().toLocaleString(),
      reportId: `RPT-${Date.now()}`
    };
    
    // Store data with a flag indicating fresh generation
    sessionStorage.setItem('medicalReportData', JSON.stringify(reportData));
    sessionStorage.setItem('isFreshReport', 'true');
    
    // Navigate to report page
    router.push('/Myreports');
  };

  const toggleCard = (index: number) => {
    setExpandedCard(expandedCard === index ? null : index);
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 text-white dark:text-white font-bold rounded-lg border-2 border-black dark:border-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(156,163,175,1)]">
      
      <div className="bg-black dark:bg-gray-700 rounded-t-md border-b border-b-white p-4 md:p-6 text-white dark:text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 dark:bg-white/5"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 md:p-3 bg-white/20 dark:bg-gray-600/20 rounded-xl">
                <Activity className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">Analysis Results</h1>
                <p className="text-white dark:text-gray-300 text-xs md:text-sm">AI-powered differential diagnosis</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm">
              <div className="flex items-center space-x-2 bg-white/20 dark:bg-gray-600/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                <Zap className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">AI Analysis</span>
                <span className="sm:hidden">AI</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/20 dark:bg-gray-600/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                <LuClipboardList className="h-3 w-3 md:h-4 md:w-4" />
                <span>{analysisResults.conditions.length} Conditions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-b-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden">
        
        <div className="bg-[#f8fed5] dark:bg-gray-700 px-4 md:px-6 py-4 border-b border-gray-200 dark:border-gray-600">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-black dark:text-white mb-1">Diagnostic Assessment</h2>
              <p className="text-sm text-black dark:text-gray-300">Conditions ranked by clinical probability</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleGenerateReport}
                className="flex items-center space-x-2 px-3 md:px-4 py-2 bg-[#ddf085] hover:bg-[#a1b339] text-black font-bold rounded-lg border-2 border-black dark:border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(156,163,175,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-xs md:text-sm"
              >
                <Download className="h-3 w-3 md:h-4 md:w-4" />
                <span>Generate Report</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6 space-y-4 bg-white dark:bg-gray-800">
          {analysisResults.conditions.map((condition, index) => (
            <div 
              key={index} 
              className="bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(156,163,175,1)] rounded-2xl overflow-hidden hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[4px_4px_0px_0px_rgba(156,163,175,1)] transition-all duration-200"
            >
              <div 
                onClick={() => toggleCard(index)}
                className="cursor-pointer p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-6 h-6 md:w-8 md:h-8 bg-black dark:bg-gray-600 text-white rounded-full border border-gray-300 dark:border-gray-500 font-bold text-xs md:text-sm">
                        #{index + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg font-bold text-black dark:text-white leading-tight">
                          {condition.name}
                        </h3>
                        <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 font-medium mt-1">
                          {condition.description}
                        </p>
                      </div>
                      <div className="flex lg:hidden">
                        {expandedCard === index ? 
                          <ChevronUp className="h-4 w-4 text-gray-400" /> : 
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 lg:flex-col lg:items-end">
                    <div className={`px-2 md:px-3 py-1 text-xs font-bold rounded-lg border-2 ${getConfidenceColor(condition.confidence)} shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]`}>
                      <div className="flex items-center space-x-1">
                        <Zap className="h-3 w-3" />
                        <span>{condition.confidence}</span>
                      </div>
                    </div>
                    <div className={`px-2 md:px-3 py-1 text-xs font-bold rounded-lg border-2 ${getSeverityColor(condition.severity)} shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]`}>
                      <div className="flex items-center space-x-1">
                        {getSeverityIcon(condition.severity)}
                        <span>{condition.severity}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {expandedCard === index && (
                <div className="border-t-2 border-black dark:border-gray-500 bg-gray-50 dark:bg-gray-800 p-4 space-y-4">
                  {condition.symptoms?.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm md:text-base font-bold text-black dark:text-white flex items-center">
                        <Activity className="h-4 w-4 mr-2" />
                        Associated Symptoms
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {condition.symptoms.map((symptom, i) => (
                          <div key={i} className="px-3 py-2 bg-[#f8fed5] dark:bg-gray-700 text-xs font-medium rounded-lg border border-black dark:border-gray-500 shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)]">
                            <div className="flex items-center space-x-2">
                              <div className="w-1.5 h-1.5 bg-black dark:bg-white rounded-full"></div>
                              <span className="text-black dark:text-white">{symptom}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className={`p-4 rounded-lg border-2 border-black dark:border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] ${
                    condition.severity === "Emergency" ? "bg-red-50 dark:bg-red-900/20" :
                    condition.severity === "Urgent" ? "bg-orange-50 dark:bg-orange-900/20" :
                    condition.severity === "Moderate" ? "bg-yellow-50 dark:bg-yellow-900/20" :
                    "bg-blue-50 dark:bg-blue-900/20"
                  }`}>
                    <div className="flex items-start space-x-3">
                      <div className={`p-2 rounded-lg border border-black dark:border-gray-500 ${
                        condition.severity === "Emergency" ? "bg-red-200 dark:bg-red-800" :
                        condition.severity === "Urgent" ? "bg-orange-200 dark:bg-orange-800" :
                        condition.severity === "Moderate" ? "bg-yellow-200 dark:bg-yellow-800" :
                        "bg-blue-200 dark:bg-blue-800"
                      }`}>
                        {getSeverityIcon(condition.severity)}
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-sm font-bold mb-2 ${
                          condition.severity === "Emergency" ? "text-red-800 dark:text-red-300" :
                          condition.severity === "Urgent" ? "text-orange-800 dark:text-orange-300" :
                          condition.severity === "Moderate" ? "text-yellow-800 dark:text-yellow-300" :
                          "text-blue-800 dark:text-blue-300"
                        }`}>
                          Recommended Action:
                        </h5>
                        <p className={`text-xs md:text-sm font-medium leading-relaxed ${
                          condition.severity === "Emergency" ? "text-red-700 dark:text-red-400" :
                          condition.severity === "Urgent" ? "text-orange-700 dark:text-orange-400" :
                          condition.severity === "Moderate" ? "text-yellow-700 dark:text-yellow-400" :
                          "text-blue-700 dark:text-blue-400"
                        }`}>
                          {condition.advice}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="p-4 md:p-6 bg-[#f8fed5] dark:bg-gray-700 border-t border-black dark:border-gray-600">
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 p-2 bg-red-200 dark:bg-red-800 border border-red-400 dark:border-red-600 rounded-lg">
                <AlertTriangle className="text-red-700 dark:text-red-300 h-4 w-4" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm md:text-base font-bold text-red-800 dark:text-red-300 mb-1">Important Medical Disclaimer</h4>
                <p className="text-xs md:text-sm text-red-700 dark:text-red-400 font-medium leading-relaxed">
                  This AI analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult qualified healthcare professionals for any health concerns or before making medical decisions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}