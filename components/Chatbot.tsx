"use client";
import { useState, useEffect } from "react";
import { Send, Tag, Stethoscope, Activity, AlertCircle, Clock, User, Bot } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  tags?: string[];
  timestamp?: string;
}

interface AnalysisResult {
  conditions: Array<{
    name: string;
    confidence: "High" | "Medium" | "Low";
    description: string;
    symptoms: string[];
    advice: string;
    severity: "Emergency" | "Urgent" | "Moderate" | "Mild";
  }>;
}

interface ChatBoxProps {
  onAnalysisComplete?: (results: AnalysisResult) => void;
}

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

export default function ChatBox({ onAnalysisComplete }: ChatBoxProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTags, setShowTags] = useState(false);

  useEffect(() => {
    setMessages([
      {
        id: 1,
        text: "Hello! I'm your AI-powered health assistant. Please describe your main symptom or health concern in detail. I'll ask you a series of questions to better understand your condition.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString()
      }
    ]);
  }, []);

  const callGeminiAPI = async (prompt: string) => {
    try {
      const response = await fetch(GEMINI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error;
    }
  };

  const getRelevantTags = (symptom: string) => {
    const symptomLower = symptom.toLowerCase();
    let tags: string[] = [];

    if (symptomLower.includes('pain') || symptomLower.includes('hurt')) {
      tags = ["Sharp pain", "Dull ache", "Severe (8-10)", "Moderate (4-7)"];
    } else if (symptomLower.includes('headache') || symptomLower.includes('head')) {
      tags = ["Throbbing", "Pressure", "One side", "Both sides"];
    } else if (symptomLower.includes('stomach') || symptomLower.includes('nausea')) {
      tags = ["After eating", "Empty stomach", "Cramping", "Burning"];
    } else if (symptomLower.includes('cough') || symptomLower.includes('throat')) {
      tags = ["Dry cough", "With phlegm", "Sore throat", "Fever"];
    } else if (symptomLower.includes('chest')) {
      tags = ["Pressure", "Sharp", "Shortness of breath", "Heart racing"];
    } else if (symptomLower.includes('back')) {
      tags = ["Lower back", "Upper back", "Radiating", "Muscle spasm"];
    }

    return tags;
  };

  const analyzeSymptoms = async (fullConversation: string) => {
    const medicalPrompt = `
You are a highly experienced emergency physician with 20+ years of clinical experience. Analyze these symptoms with extreme precision.

PATIENT PRESENTATION:
${fullConversation}
Selected descriptors: ${selectedTags.join(', ')}

DIAGNOSTIC ANALYSIS INSTRUCTIONS:
1. Apply systematic clinical reasoning using medical knowledge
2. Consider differential diagnosis with specific conditions
3. Use symptom patterns, timing, and severity to narrow diagnosis
4. Prioritize most likely conditions based on clinical presentation
5. Consider both common and serious conditions
6. Match exact symptom clusters to specific diseases

CRITICAL ACCURACY REQUIREMENTS:
- Provide EXACTLY 3-4 most likely conditions
- Use PRECISE medical condition names (not generic terms)
- Base confidence on actual symptom match and clinical likelihood
- Emergency = immediate life threat requiring ER (MI, stroke, sepsis, etc.)
- Urgent = needs medical care within 24 hours
- Moderate = needs care within 2-3 days
- Mild = can monitor or self-manage

EXAMPLES OF SPECIFIC DIAGNOSES:
- "Acute Coronary Syndrome" not "Heart problems"
- "Acute Appendicitis" not "Stomach inflammation"  
- "Migraine with Aura" not "Bad headache"
- "Community-Acquired Pneumonia" not "Lung infection"
- "Gastroesophageal Reflux Disease" not "Acid reflux"

Provide EXACTLY this JSON format:
{
  "conditions": [
    {
      "name": "Specific Medical Diagnosis",
      "confidence": "High|Medium|Low", 
      "description": "Brief clinical explanation with key diagnostic features",
      "symptoms": ["specific symptoms that strongly suggest this condition"],
      "advice": "Specific action with clear timeframe",
      "severity": "Emergency|Urgent|Moderate|Mild"
    }
  ]
}

Return exactly 3-4 conditions ranked by clinical probability. JSON only.`;

    try {
      const response = await callGeminiAPI(medicalPrompt);
      
      let jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.conditions && parsed.conditions.length >= 3) {
          parsed.conditions = parsed.conditions.slice(0, 4);
          return parsed;
        }
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      return {
        conditions: [
          {
            name: "Comprehensive Medical Evaluation Required",
            confidence: "High" as const,
            description: "Complex symptom pattern requires professional clinical assessment",
            symptoms: selectedTags.length > 0 ? selectedTags : ["Multiple symptoms"],
            advice: "Schedule appointment with primary care physician within 24-48 hours",
            severity: "Moderate" as const
          },
          {
            name: "Viral Upper Respiratory Infection",
            confidence: "Medium" as const,
            description: "Common viral illness affecting respiratory system",
            symptoms: ["Fatigue", "Body aches", "Possible congestion"],
            advice: "Rest, fluids, over-the-counter symptom relief. Monitor for worsening",
            severity: "Mild" as const
          },
          {
            name: "Stress-Related Physical Symptoms",
            confidence: "Low" as const,
            description: "Physical manifestations of psychological stress",
            symptoms: ["Tension", "Sleep disturbance", "General discomfort"],
            advice: "Stress management techniques, adequate rest. Follow up if persists",
            severity: "Mild" as const
          }
        ]
      };
    }
  };

  const generateMedicalQuestion = async (userInput: string, history: string[], questionNum: number) => {
    const questionPrompt = `
You are an experienced physician conducting a systematic medical interview. Based on the conversation, ask the MOST clinically relevant question to narrow the differential diagnosis.

CONVERSATION HISTORY:
${history.join('\n')}

CURRENT RESPONSE: "${userInput}"
QUESTION NUMBER: ${questionNum + 1}

CLINICAL INTERVIEW PROTOCOL:
Questions 1-3: Core symptom characterization (onset, duration, quality, severity, location)
Questions 4-6: Associated symptoms and modifying factors  
Questions 7-8: Past medical history, medications, recent changes
Questions 9+: Risk factors, family history, lifestyle factors

Ask ONE specific diagnostic question (under 20 words) that will provide the most valuable clinical information:

GOOD EXAMPLES:
"When exactly did this pain first start?"
"On a scale of 1-10, how severe is the pain right now?"
"Does the pain radiate or spread anywhere else?"
"Any nausea, vomiting, fever, or chills?"
"What makes the pain better or worse?"
"Have you taken any medications for this?"
"Any similar episodes in the past?"
"Any recent injuries, travel, or illness?"

Focus on the most diagnostically important question based on their symptoms. No explanations or preamble.`;

    try {
      const response = await callGeminiAPI(questionPrompt);
      return response.trim().replace(/['"]/g, '');
    } catch (error) {
      const clinicalQuestions = [
        "When did this symptom first start - today, yesterday, or longer ago?",
        "How would you rate the severity from 1-10 right now?", 
        "Does the pain/discomfort stay in one area or spread elsewhere?",
        "Any nausea, fever, dizziness, or shortness of breath?",
        "What makes it feel better or worse?",
        "Have you taken any medications or treatments for this?",
        "Have you experienced anything like this before?",
        "Any recent changes in diet, activity, stress, or medications?",
        "Do you have any ongoing medical conditions or take regular medications?"
      ];
      return clinicalQuestions[questionNum % clinicalQuestions.length];
    }
  };

  const shouldAnalyze = (count: number, message: string) => {
    const analysisKeywords = ['analyze', 'diagnose', 'what is it', 'ready', 'enough questions', 'diagnosis'];
    return count >= 7 || analysisKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else if (selectedTags.length < 3) {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAnalyzing) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      tags: [...selectedTags],
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, newMessage]);
    
    const messageWithTags = selectedTags.length > 0 
      ? `${inputMessage} [${selectedTags.join(', ')}]`
      : inputMessage;
    
    const newHistory = [...conversationHistory, `Patient: ${messageWithTags}`];
    setConversationHistory(newHistory);
    
    const currentInput = inputMessage;
    setInputMessage("");
    setIsAnalyzing(true);

    if (questionCount === 0) {
      const tags = getRelevantTags(currentInput);
      if (tags.length > 0) {
        setSuggestedTags(tags);
        setShowTags(true);
      }
    }

    try {
      if (shouldAnalyze(questionCount, currentInput)) {
        const analysisMessage: Message = {
          id: messages.length + 2,
          text: "Analyzing your symptoms using advanced clinical diagnostic protocols. This may take a moment...",
          sender: "bot",
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, analysisMessage]);
        
        const fullHistory = newHistory.join(' ');
        const results = await analyzeSymptoms(fullHistory);
        onAnalysisComplete?.(results);
        setShowTags(false);
      } else {
        const question = await generateMedicalQuestion(currentInput, newHistory, questionCount);
        
        const botMessage: Message = {
          id: messages.length + 2,
          text: question,
          sender: "bot",
          timestamp: new Date().toLocaleTimeString()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setConversationHistory(prev => [...prev, `Doctor: ${question}`]);
        setQuestionCount(prev => prev + 1);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm having trouble processing your request. Please consult a healthcare professional for proper evaluation.",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
      setSelectedTags([]);
    }
  };

  return (
    <div className="max-w-5xl text-white font-bold rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mx-auto">
      
      <div className="bg-black rounded-t-md border-b border-b-white p-4 md:p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 md:p-3 bg-white/20 rounded-xl">
                <Stethoscope className="h-6 w-6 md:h-8 md:w-8 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold">AI Health Assistant</h1>
                <p className="text-white text-xs md:text-sm">Advanced symptom analysis powered by AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-4 text-xs md:text-sm">
              <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                <Activity className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Active Session</span>
                <span className="sm:hidden">Active</span>
              </div>
              {questionCount > 0 && (
                <div className="flex items-center space-x-2 bg-white/20 rounded-lg px-2 md:px-3 py-1 md:py-2">
                  <Clock className="h-3 w-3 md:h-4 md:w-4" />
                  <span>{questionCount}/7+</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-b-2xl shadow-2xl border border-gray-200 overflow-hidden">
        
        {questionCount > 0 && questionCount < 7 && (
          <div className="bg-[#f8fed5] px-4 md:px-6 py-3 border-b border-gray-200">
            <div className="flex items-center justify-between text-xs md:text-sm text-black mb-2">
              <span className="font-medium">Clinical Assessment Progress</span>
              <span>{questionCount}/7 questions</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#bccc5c] h-2 rounded-full transition-all duration-500"
                style={{ width: `${(questionCount / 7) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
        
        <div className="h-64 md:h-96 overflow-y-auto p-4 md:p-6 space-y-4 bg-white">
          {messages.map((message) => (
            <div key={message.id} className="space-y-2">
              <div className={`flex items-end space-x-3 ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                {message.sender === "bot" && (
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-[#f8fed5] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center">
                    <Bot className="h-3 w-3 md:h-4 md:w-4 text-black" />
                  </div>
                )}
                
                <div className={`max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl rounded-2xl px-3 md:px-4 py-2 md:py-3 ${
                  message.sender === "user" 
                    ? "bg-[#f8fed5] text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-br-md" 
                    : "bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-bl-md"
                }`}>
                  <p className="text-xs md:text-sm leading-relaxed">{message.text}</p>
                  {message.timestamp && (
                    <p className="text-xs mt-2 text-gray-600">
                      {message.timestamp}
                    </p>
                  )}
                </div>
                
                {message.sender === "user" && (
                  <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-[#e0f081] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center">
                    <User className="h-3 w-3 md:h-4 md:w-4 text-black" />
                  </div>
                )}
              </div>
              
              {message.tags && message.tags.length > 0 && (
                <div className="flex justify-end">
                  <div className="flex flex-wrap gap-1 max-w-xs sm:max-w-sm md:max-w-md">
                    {message.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-[#f8fed5] text-black text-xs font-medium rounded-full border border-black">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isAnalyzing && (
            <div className="flex items-end space-x-3">
              <div className="flex-shrink-0 w-6 h-6 md:w-8 md:h-8 bg-[#f8fed5] border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-full flex items-center justify-center">
                <Bot className="h-3 w-3 md:h-4 md:w-4 text-black" />
              </div>
              <div className="bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-2xl rounded-bl-md px-3 md:px-4 py-2 md:py-3">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                    <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                  </div>
                  <span className="text-xs md:text-sm text-black">Analyzing symptoms...</span>
                </div>
              </div>
            </div>
          )}
        </div>
        {showTags && suggestedTags.length > 0 && questionCount < 4 && (
          <div className="px-4 md:px-6 py-4 bg-[#f8fed5] border-t border-black">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-white/20 rounded-lg mr-3">
                <Tag className="h-4 w-4 text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-black text-sm md:text-base">Add specific details</h3>
                <p className="text-xs md:text-sm text-black">Select up to 3 that best describe your symptoms</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {suggestedTags.map((tag, index) => (
                <button
                  key={index}
                  onClick={() => handleTagSelect(tag)}
                  disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
                  className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-full border-2 transition-all duration-200 ${
                    selectedTags.includes(tag)
                      ? "bg-[#e0f081] text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white text-black border-black hover:bg-[#f8fed5] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] disabled:opacity-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            {selectedTags.length > 0 && (
              <div className="mt-3 p-3 bg-white rounded-lg border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xs md:text-sm text-black">
                  <strong>Selected:</strong> {selectedTags.join(', ')}
                </p>
              </div>
            )}
          </div>
        )}
        
        <div className="p-4 md:p-6 bg-[#f8fed5] border-t border-black">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe your symptoms in detail..."
                className="w-full p-3 md:p-4 pr-10 md:pr-12 border-2 border-black rounded-xl bg-white text-black placeholder-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 text-sm md:text-base"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isAnalyzing}
              />
            </div>
           
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isAnalyzing}
              className={`px-4 md:px-6 py-3 md:py-4 font-bold rounded-xl border-2 border-black transition-all duration-200 flex items-center justify-center space-x-2 ${
                !inputMessage.trim() || isAnalyzing
                  ? "bg-[#c6e300] text-gray-500 cursor-not-allowed shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]"
                  : "bg-[#f5ff23] text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-[#E5Ef20] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
              }`}
            >
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline text-sm md:text-base">Send</span>
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-4 space-y-2 sm:space-y-0 text-xs md:text-sm">
            <div className="flex items-center space-x-2 text-black">
              <AlertCircle className="h-3 w-3 md:h-4 md:w-4" />
              <span>Be specific about timing, location, severity, and triggers</span>
            </div>
            {questionCount < 7 && (
              <div className="flex items-center space-x-2 text-black bg-white/20 rounded-full px-3 py-1">
                <Activity className="h-3 w-3 md:h-4 md:w-4" />
                <span className="font-medium">Assessment in progress</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}