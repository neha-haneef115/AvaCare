"use client"
import React, { useEffect, useState } from 'react';
import { 
  Download, 
  AlertTriangle, 
  Shield, 
  Clock, 
  TrendingUp,
  FileText
} from "lucide-react";
import { useRouter } from 'next/navigation';

type ConfidenceLevel = "High" | "Medium" | "Low";
type SeverityLevel = "Emergency" | "Urgent" | "Moderate" | "Mild";

interface Condition {
  name: string;
  confidence: ConfidenceLevel;
  description: string;
  symptoms: string[];
  advice: string;
  severity: SeverityLevel;
}

interface AnalysisResult {
  conditions: Condition[];
  timestamp?: string;
  reportId?: string;
}

export default function MedicalReportPage() {
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const router = useRouter();

  useEffect(() => {
    const isFreshReport = sessionStorage.getItem('isFreshReport') === 'true';
    
    if (isFreshReport) {
      const storedData = sessionStorage.getItem('medicalReportData');
      if (storedData) {
        setAnalysisData(JSON.parse(storedData));
      }
      sessionStorage.removeItem('isFreshReport');
    } else {
      sessionStorage.removeItem('medicalReportData');
    }
  }, []);

  const getSeverityColor = (severity: SeverityLevel): string => {
    switch (severity) {
      case "Emergency": return "bg-red-200 text-red-900 border-red-400";
      case "Urgent": return "bg-orange-200 text-orange-900 border-orange-400";
      case "Moderate": return "bg-yellow-200 text-yellow-900 border-yellow-400";
      case "Mild": return "bg-green-200 text-green-900 border-green-400";
      default: return "bg-gray-200 text-gray-900 border-gray-400";
    }
  };

  const getSeverityIcon = (severity: SeverityLevel): React.ReactElement => {
    switch (severity) {
      case "Emergency": return <AlertTriangle className="text-red-600" size={16} />;
      case "Urgent": return <Clock className="text-orange-600" size={16} />;
      case "Moderate": return <TrendingUp className="text-yellow-600" size={16} />;
      case "Mild": return <Shield className="text-green-600" size={16} />;
      default: return <Shield className="text-gray-600" size={16} />;
    }
  };

  const handleDownloadPDF = (): void => {
    if (!analysisData) return;

    const { jsPDF } = require("jspdf");
    const doc = new jsPDF();

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text("MEDICAL ANALYSIS REPORT", 105, 20, { align: 'center' });

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(20, 26, 190, 26);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Report ID: ${analysisData.reportId || 'AUTO-' + Date.now()}`, 20, 38);
    doc.text(`Generated: ${analysisData.timestamp || new Date().toLocaleDateString()}`, 20, 44);
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 50);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text("CLINICAL FINDINGS", 20, 65);
    
    doc.setLineWidth(0.3);
    doc.line(20, 68, 75, 68);

    let yPos = 85;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    
    doc.setFillColor(250, 250, 250);
    doc.rect(20, yPos - 2, 170, 10, 'F');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPos - 2, 170, 10, 'S');
    
    doc.text("CONDITION", 25, yPos + 4);
    doc.text("CONFIDENCE", 85, yPos + 4);
    doc.text("PRIORITY", 125, yPos + 4);

    yPos += 15;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);

    analysisData.conditions.forEach((condition: Condition, index: number) => {
      const conditionName = `${index + 1}. ${condition.name}`;
      const symptoms = condition.symptoms?.join(', ') || 'None listed';
      
      const maxConditionWidth = 55;
      const conditionLines = doc.splitTextToSize(conditionName, maxConditionWidth);
      
      const maxSymptomsWidth = 165;
      const symptomLines = doc.splitTextToSize(`Symptoms: ${symptoms}`, maxSymptomsWidth);
      
      const rowHeight = Math.max(conditionLines.length * 4, symptomLines.length * 4, 12);

      if (index % 2 === 1) {
        doc.setFillColor(248, 248, 248);
        doc.rect(20, yPos - 3, 170, rowHeight + 4, 'F');
      }

      doc.setFont("helvetica", "bold");
      doc.text(conditionLines, 25, yPos + 2);

      doc.setFont("helvetica", "normal");
      doc.text(condition.confidence || 'N/A', 85, yPos + 2);

      const priorityText = condition.severity === "Emergency" ? "URGENT" :
                          condition.severity === "Urgent" ? "HIGH" :
                          condition.severity === "Moderate" ? "MEDIUM" : "LOW";
      doc.text(priorityText, 125, yPos + 2);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(symptomLines, 25, yPos + (conditionLines.length * 4) + 6);

      yPos += rowHeight + 8;

      if (yPos > 240) {
        doc.addPage();
        yPos = 30;
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(11);
        doc.setFillColor(250, 250, 250);
        doc.rect(20, yPos - 2, 170, 10, 'F');
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, yPos - 2, 170, 10, 'S');
        
        doc.text("CONDITION", 25, yPos + 4);
        doc.text("CONFIDENCE", 85, yPos + 4);
        doc.text("PRIORITY", 125, yPos + 4);
        
        yPos += 15;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
      }
    });

    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("RECOMMENDATIONS", 20, yPos);
    doc.setLineWidth(0.3);
    doc.line(20, yPos + 3, 85, yPos + 3);

    yPos += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text("• This automated analysis should be reviewed by a qualified healthcare professional", 25, yPos);
    doc.text("• Clinical correlation with patient history and physical examination is essential", 25, yPos + 8);
    doc.text("• Additional diagnostic tests may be required for definitive diagnosis", 25, yPos + 16);

    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    
    const footerY = 280;
    doc.text("AUTOMATED MEDICAL ANALYSIS - FOR PROFESSIONAL REVIEW ONLY", 105, footerY, { align: 'center' });
    doc.text(`Document ID: ${analysisData.reportId || 'AUTO-' + Date.now()}`, 105, footerY + 5, { align: 'center' });

    const timestamp = new Date().toISOString().split('T')[0];
    doc.save(`Medical-Analysis-${timestamp}-${analysisData.reportId || Date.now()}.pdf`);
  };

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto p-4 md:p-6">
      {analysisData ? (
        <div className="max-w-4xl mx-auto bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="p-4 bg-[#f8fed5] border-b-2 border-black flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-lg md:text-xl font-bold flex items-center">
                <FileText className="mr-2" />
                Medical Analysis Report
              </h1>
              <div className="flex flex-col md:flex-row md:gap-4 text-sm">
                <p>Generated: {analysisData.timestamp || new Date().toLocaleString()}</p>
                <p>Report ID: {analysisData.reportId || 'N/A'}</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              className="w-full md:w-auto bg-[#f8fed5] hover:bg-[#e0f081] text-black font-bold px-4 py-2 rounded-lg 
                       border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                       hover:translate-x-[2px] hover:translate-y-[2px] transition-all
                       flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Download PDF
            </button>
          </div>
          
          <div className="p-4">
            <h2 className="text-lg font-bold mb-4">Diagnosis Summary</h2>
            
            <div className="space-y-4">
              {analysisData.conditions.map((condition, index) => (
                <div key={index} className="p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-3 gap-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className="bg-black text-white px-2 py-1 rounded-full text-xs font-bold mr-3">
                          #{index + 1}
                        </span>
                        <h3 className="font-bold text-lg">{condition.name}</h3>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">{condition.description}</p>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                        condition.confidence === "High" ? "bg-red-100 text-red-800 border-red-300" :
                        condition.confidence === "Medium" ? "bg-yellow-100 text-yellow-800 border-yellow-300" :
                        "bg-green-100 text-green-800 border-green-300"
                      }`}>
                        {condition.confidence} Confidence
                      </span>
                      <span className={`px-3 py-1 text-xs font-bold rounded-lg border-2 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center ${getSeverityColor(condition.severity)}`}>
                        {getSeverityIcon(condition.severity)}
                        <span className="ml-1">{condition.severity}</span>
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3">
                    <h4 className="text-sm font-bold mb-2">Associated Symptoms:</h4>
                    <div className="flex flex-wrap gap-2">
                      {condition.symptoms.map((symptom, i) => (
                        <span key={i} className="px-3 py-1 bg-[#f8fed5] text-xs font-bold rounded-lg border-2 border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className={`mt-4 p-3 rounded-lg border-2 ${
                    condition.severity === "Emergency" ? "bg-red-50 border-red-200" :
                    condition.severity === "Urgent" ? "bg-orange-50 border-orange-200" :
                    condition.severity === "Moderate" ? "bg-yellow-50 border-yellow-200" :
                    "bg-blue-50 border-blue-200"
                  }`}>
                    <h4 className={`text-sm font-bold mb-1 ${
                      condition.severity === "Emergency" ? "text-red-800" :
                      condition.severity === "Urgent" ? "text-orange-800" :
                      condition.severity === "Moderate" ? "text-yellow-800" :
                      "text-blue-800"
                    }`}>
                      Recommended Action:
                    </h4>
                    <p className={`text-sm ${
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
                  This analysis is for informational purposes only. It is not a substitute 
                  for professional medical advice, diagnosis, or treatment. Always seek 
                  the advice of qualified healthcare professionals for any health concerns.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 text-center">
          <div className="p-8">
            <FileText size={48} className="mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Reports Available</h2>
            <p className="text-gray-500 mb-6">
              Please generate a medical analysis first to view your report here.
            </p>
            <button 
              onClick={() => router.back()}
              className="bg-[#f8fed5] hover:bg-[#e0f081] text-black font-bold px-6 py-3 rounded-lg 
                       border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                       hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              Back to Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}