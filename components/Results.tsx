import { 
  AlertTriangle,
  Shield,
  Clock,
  TrendingUp,
  FileText
} from "lucide-react";
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
  const router = useRouter();

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Emergency": return "bg-red-200 text-red-900 border-red-400";
      case "Urgent": return "bg-orange-200 text-orange-900 border-orange-400";
      case "Moderate": return "bg-yellow-200 text-yellow-900 border-yellow-400";
      case "Mild": return "bg-green-200 text-green-900 border-green-400";
      default: return "bg-gray-200 text-gray-900 border-gray-400";
    }
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case "High": return "bg-red-100 text-red-800 border-red-300";
      case "Medium": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "Low": return "bg-green-100 text-green-800 border-green-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
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

  return (
    <div className="max-w-4xl mx-auto bg-white border-2 border-black rounded-lg overflow-hidden mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 bg-[#f8fed5] border-b-2 border-black">
        <h2 className="text-lg font-bold flex items-center">
          <AlertTriangle className="mr-2" />
          Medical Analysis Results
        </h2>
        <p className="text-sm font-medium">Differential diagnosis with confidence scoring</p>
      </div>
      
      <div className="p-4">
        <div className="mb-6">
          <h3 className="font-bold mb-4 text-lg">Possible Conditions (Ranked by Likelihood)</h3>
          <div className="space-y-4">
            {analysisResults.conditions.map((condition, index) => (
              <div key={index} className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold mr-3">
                        #{index + 1}
                      </span>
                      <h4 className="font-bold text-lg">{condition.name}</h4>
                    </div>
                    <p className="text-sm font-medium text-gray-700 mt-1">{condition.description}</p>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${getConfidenceColor(condition.confidence)}`}>
                      {condition.confidence} Confidence
                    </span>
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center ${getSeverityColor(condition.severity)}`}>
                      {getSeverityIcon(condition.severity)}
                      <span className="ml-1">{condition.severity}</span>
                    </span>
                  </div>
                </div>
                
                {condition.symptoms?.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-bold mb-2">Associated Symptoms:</h5>
                    <div className="flex flex-wrap gap-2">
                      {condition.symptoms.map((symptom, i) => (
                        <span key={i} className="px-3 py-1 bg-[#f8fed5] text-xs font-bold rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className={`mt-4 p-3 rounded-lg border-2 ${
                  condition.severity === "Emergency" ? "bg-red-50 border-red-200" :
                  condition.severity === "Urgent" ? "bg-orange-50 border-orange-200" :
                  condition.severity === "Moderate" ? "bg-yellow-50 border-yellow-200" :
                  "bg-blue-50 border-blue-200"
                }`}>
                  <h5 className={`text-sm font-bold mb-1 ${
                    condition.severity === "Emergency" ? "text-red-800" :
                    condition.severity === "Urgent" ? "text-orange-800" :
                    condition.severity === "Moderate" ? "text-yellow-800" :
                    "text-blue-800"
                  }`}>
                    Recommended Action:
                  </h5>
                  <p className={`text-sm font-medium ${
                    condition.severity === "Emergency" ? "text-red-700" :
                    condition.severity === "Urgent" ? "text-orange-700" :
                    condition.severity === "Moderate" ? "text-yellow-700" :
                    "text-blue-700"
                  }`}>
                    {condition.advice}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg text-sm font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex items-start">
            <AlertTriangle className="text-red-600 mr-2 mt-0.5 flex-shrink-0" size={16} />
            <div>
              <p className="text-red-800 font-bold">Medical Disclaimer</p>
              <p className="text-red-700 mt-1">
                This analysis is for informational purposes only. It is not a substitute for 
                professional medical advice, diagnosis, or treatment. Always seek the advice 
                of qualified healthcare professionals for any health concerns.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <button
        onClick={handleGenerateReport}
        className="bg-[#f8fed5] hover:bg-[#e0f081] text-black font-bold px-6 py-3 rounded-lg 
                 border-2 m-auto mb-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                 hover:translate-x-[2px] hover:translate-y-[2px] transition-all
                 flex items-center gap-2 w-full justify-center"
      >
        Generate Report
      </button>
    </div>
  );
}