'use client';

import { useState, useEffect } from 'react';
import type { TooltipItem } from 'chart.js';
import { PDFDownloadLink, Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Define types
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

interface Report {
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

// Mock data
const mockReport: Report = {
  id: '1',
  userId: 'user123',
  dateTime: new Date().toISOString(),
  symptoms: [
    { name: 'Headache', severity: 7, duration: '2 days' },
    { name: 'Fever', severity: 5, duration: '1 day' },
    { name: 'Fatigue', severity: 6, duration: '3 days' }
  ],
  diagnosis: 'Possible viral infection',
  riskLevel: 'moderate',
  nextSteps: 'Consult a doctor within 24-48 hours if symptoms persist',
  reasoning: 'The combination of fever with headache and fatigue suggests a possible viral infection. The moderate severity and duration warrant medical attention but don\'t indicate an emergency.',
  possibleDiagnoses: [
    { condition: 'Viral infection', confidence: 75 },
    { condition: 'Migraine', confidence: 20 },
    { condition: 'Other', confidence: 5 }
  ],
  relatedConditions: ['Influenza', 'Common cold', 'Sinusitis'],
  recommendations: {
    action: 'Rest\nStay hydrated\nTake OTC pain relievers as needed',
    emergencySigns: ['Difficulty breathing', 'Severe neck pain', 'Confusion'],
    doctors: [
      { name: 'Dr. Smith', specialty: 'General Practitioner', phone: '555-1234' },
      { name: 'Urgent Care Center', specialty: 'Walk-in Clinic', phone: '555-5678' }
    ]
  },
  userNotes: 'I\'ve been under a lot of stress at work recently.'
};

const mockHistory: Report[] = [
  mockReport,
  {
    id: '2',
    userId: 'user123',
    dateTime: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
    symptoms: [
      { name: 'Headache', severity: 4, duration: '1 day' },
      { name: 'Fatigue', severity: 3, duration: '2 days' }
    ],
    diagnosis: 'Possible tension headache',
    riskLevel: 'low',
    nextSteps: 'Monitor symptoms, rest',
    reasoning: 'Mild headache and fatigue could be related to stress or tension.',
    possibleDiagnoses: [
      { condition: 'Tension headache', confidence: 80 },
      { condition: 'Stress', confidence: 15 },
      { condition: 'Other', confidence: 5 }
    ],
    relatedConditions: ['Tension headache', 'Stress'],
    recommendations: {
      action: 'Rest\nPractice relaxation techniques',
      emergencySigns: ['Worsening symptoms', 'Visual disturbances']
    }
  }
];

// PDF Styles
const styles = StyleSheet.create({
  page: { padding: 30, fontFamily: 'Helvetica' },
  header: { marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  section: { marginBottom: 15 },
  text: { fontSize: 12, marginBottom: 5 },
  bold: { fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#e0e0e0', marginVertical: 10 },
});

// PDF Document Component
const PdfReportDocument = ({ report }: { report: Report }) => (
  <Document>
    <Page style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>AI Symptom Checker Report</Text>
        <Text style={styles.text}>Generated on: {format(new Date(report.dateTime), 'PPPpp')}</Text>
        <Text style={styles.text}>User ID: {report.userId}</Text>
      </View>

      <View style={styles.divider} />

      {/* Summary Section */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Summary</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Symptoms:</Text> {report.symptoms.map(s => s.name).join(', ')}
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Assessment:</Text> {report.diagnosis} ({report.riskLevel} risk)
        </Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Next Steps:</Text> {report.nextSteps}
        </Text>
      </View>

      {/* Detailed Symptoms */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Detailed Symptoms</Text>
        {report.symptoms.map((symptom, index) => (
          <Text key={index} style={styles.text}>
            - {symptom.name}
            {symptom.severity && ` (Severity: ${symptom.severity}/10)`}
            {symptom.duration && ` (Duration: ${symptom.duration})`}
          </Text>
        ))}
      </View>

      {/* AI Analysis */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>AI Analysis</Text>
        <Text style={styles.text}>
          <Text style={styles.bold}>Reasoning:</Text> {report.reasoning}
        </Text>
        
        <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Possible Diagnoses:</Text>
        {report.possibleDiagnoses.map((diag, index) => (
          <Text key={index} style={styles.text}>
            - {diag.condition} (confidence: {diag.confidence}%)
          </Text>
        ))}
        
        <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Related Conditions:</Text>
        {report.relatedConditions.map((condition, index) => (
          <Text key={index} style={styles.text}>
            - {condition}
          </Text>
        ))}
      </View>

      {/* Recommendations */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>Recommendations</Text>
        
        <Text style={[styles.text, styles.bold]}>Suggested Actions:</Text>
        {report.recommendations.action.split('\n').map((action, index) => (
          <Text key={index} style={styles.text}>
            - {action}
          </Text>
        ))}
        
        <Text style={[styles.text, styles.bold, { marginTop: 5 }]}>Emergency Signs:</Text>
        {report.recommendations.emergencySigns.map((sign, index) => (
          <Text key={index} style={styles.text}>
            - {sign}
          </Text>
        ))}
      </View>

      {/* User Notes */}
      {report.userNotes && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>User Notes</Text>
          <Text style={styles.text}>{report.userNotes}</Text>
        </View>
      )}
    </Page>
  </Document>
);

// Main MyReports Page Component - This should be used inside MainLayout
export default function MyReportsPage() {
  const [report, setReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        // In a real app, you would fetch from your API
        // const response = await fetch(`/api/reports`);
        // const data = await response.json();
        // setReport(data.report);
        // setHistory(data.history);
        
        // For demo purposes, use mock data
        setTimeout(() => {
          setReport(mockReport);
          setHistory(mockHistory);
          setIsLoading(false);
        }, 500); // Simulate network delay
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        // Fallback to mock data if API fails
        setReport(mockReport);
        setHistory(mockHistory);
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#e0f081] mx-auto mb-4"></div>
          <p className="text-lg font-semibold">Loading your reports...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('API Error:', error);
    // Continue to show UI with mock data
  }

  if (!report) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-gray-600">No report data found</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const chartData = {
    labels: history.map(r => format(new Date(r.dateTime), 'MMM dd')),
    datasets: [
      {
        label: 'Average Symptom Severity',
        data: history.map(r => {
          const sum = r.symptoms.reduce((total, symptom) => total + (symptom.severity || 0), 0);
          return sum / r.symptoms.length;
        }),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="bg-white border-b-2 border-black p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center">
              📊 My Health Reports
            </h1>
            <p className="text-black mt-2">View and manage your symptom analysis reports</p>
          </div>
          <PDFDownloadLink
            document={<PdfReportDocument report={report} />}
            fileName={`symptom-report-${report.id}.pdf`}
            className="bg-[#f8fed5] hover:bg-[#e0f081] text-black font-bold px-4 py-2 rounded-lg 
                     border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                     hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                     hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
          </PDFDownloadLink>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Summary Card */}
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Latest Report Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Date:</span> {format(new Date(report.dateTime), 'PPPpp')}
                </p>
                <p className="text-gray-600">
                  <span className="font-bold">Symptoms:</span> {report.symptoms.map(s => s.name).join(', ')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-2">
                  <span className="font-bold">Assessment:</span> {report.diagnosis} 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-bold border ${
                    report.riskLevel === 'high' ? 'bg-[#ff6b6b] text-white border-red-600' :
                    report.riskLevel === 'moderate' ? 'bg-[#ffd93d] text-black border-yellow-600' :
                    'bg-[#6bcf7f] text-white border-green-600'
                  }`}>
                    {report.riskLevel} risk
                  </span>
                </p>
                <p className="text-gray-600">
                  <span className="font-bold">Next Steps:</span> {report.nextSteps}
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Symptoms */}
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Detailed Symptoms</h2>
            <div className="space-y-3">
              {report.symptoms.map((symptom, index) => (
                <div key={index} className="flex justify-between items-center py-3 px-4 bg-[#f8fed5] rounded-lg border-2 border-black">
                  <div>
                    <p className="font-bold">{symptom.name}</p>
                    {symptom.duration && <p className="text-sm text-gray-600">{symptom.duration}</p>}
                  </div>
                  {symptom.severity && (
                    <div className="w-32">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-3 border-2 border-black">
                          <div 
                            className={`h-full rounded-full ${
                              symptom.severity >= 7 ? 'bg-[#ff6b6b]' :
                              symptom.severity >= 4 ? 'bg-[#ffd93d]' : 'bg-[#6bcf7f]'
                            }`} 
                            style={{ width: `${symptom.severity * 10}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-bold text-gray-700">{symptom.severity}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* AI Analysis */}
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">AI Analysis</h2>
            <div className="mb-4">
              <h3 className="font-bold text-gray-700 mb-2">Reasoning</h3>
              <p className="text-gray-600 p-4 bg-[#f8fed5] rounded-lg border-2 border-black">{report.reasoning}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-bold text-gray-700 mb-3">Possible Diagnoses</h3>
                <ul className="space-y-3">
                  {report.possibleDiagnoses.map((diag, index) => (
                    <li key={index} className="flex justify-between items-center p-3 bg-[#f8fed5] rounded-lg border-2 border-black">
                      <span className="font-medium">{diag.condition}</span>
                      <span className="flex items-center">
                        <span className="w-16 bg-gray-200 rounded-full h-3 mr-2 border border-black">
                          <div 
                            className="h-full rounded-full bg-blue-500" 
                            style={{ width: `${diag.confidence}%` }}
                          ></div>
                        </span>
                        <span className="text-sm font-bold">{diag.confidence}%</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-bold text-gray-700 mb-3">Related Conditions</h3>
                <ul className="space-y-2">
                  {report.relatedConditions.map((condition, index) => (
                    <li key={index} className="text-gray-600 p-2 bg-[#f8fed5] rounded border-2 border-black">
                      • {condition}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Recommendations</h2>
            
            <div className="mb-6">
              <h3 className="font-bold text-gray-700 mb-3">Suggested Actions</h3>
              <ul className="space-y-2">
                {report.recommendations.action.split('\n').map((action, index) => (
                  <li key={index} className="text-gray-600 p-2 bg-[#f8fed5] rounded border-2 border-black">
                    • {action}
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-gray-700 mb-3">⚠️ Emergency Signs to Watch For</h3>
              <ul className="space-y-2">
                {report.recommendations.emergencySigns.map((sign, index) => (
                  <li key={index} className="text-gray-600 p-2 bg-[#ffcccb] rounded border-2 border-red-400">
                    • {sign}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Symptom History Chart */}
          {history.length > 1 && (
            <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Symptom History Trend</h2>
              <div className="h-64">
                <Line 
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'top' as const },
                      tooltip: {
                        callbacks: {
                          label: (context: TooltipItem<'line'>) => {
                            return `Severity: ${context.parsed.y.toFixed(1)}/10`;
                          }
                        }
                      }
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        max: 10,
                        ticks: { stepSize: 1 }
                      }
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* User Notes */}
          {report.userNotes && (
            <div className="bg-white rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">Your Notes</h2>
              <div className="p-4 bg-[#f8fed5] rounded-lg border-2 border-black">
                <p className="text-gray-600 whitespace-pre-line">{report.userNotes}</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}