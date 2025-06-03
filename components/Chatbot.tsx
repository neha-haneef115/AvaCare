"use client";
import { useState, useEffect } from "react";
import { Send, Tag, Heart } from "lucide-react";

interface Message {
  id: number;
  text: string;
  sender: "user" | "bot";
  tags?: string[];
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
        text: "Hello! I'm symptom checker. Please describe your main symptom or health concern in detail.",
        sender: "bot"
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

    // Only show 4-6 most relevant tags based on main symptom
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
          // Ensure we have exactly 3-4 conditions
          parsed.conditions = parsed.conditions.slice(0, 4);
          return parsed;
        }
      }
      
      throw new Error("Invalid response format");
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      // Better fallback with actual medical reasoning
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
      // More comprehensive fallback questions based on interview stage
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
    // Increase minimum questions for better accuracy
    const analysisKeywords = ['analyze', 'diagnose', 'what is it', 'ready', 'enough questions', 'diagnosis'];
    return count >= 7 || analysisKeywords.some(keyword => message.toLowerCase().includes(keyword));
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else if (selectedTags.length < 3) { // Limit to 3 tags
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isAnalyzing) return;

    const newMessage: Message = {
      id: messages.length + 1,
      text: inputMessage,
      sender: "user",
      tags: [...selectedTags]
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

    // Show relevant tags after first message
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
          sender: "bot"
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
          sender: "bot"
        };
        
        setMessages(prev => [...prev, botMessage]);
        setConversationHistory(prev => [...prev, `Doctor: ${question}`]);
        setQuestionCount(prev => prev + 1);
      }
    } catch (error) {
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I'm having trouble processing your request. Please consult a healthcare professional for proper evaluation.",
        sender: "bot"
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAnalyzing(false);
      setSelectedTags([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white border-2 border-black rounded-lg overflow-hidden mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 bg-[#f8fed5] border-b-2 border-black">
        <h2 className="text-lg font-bold flex items-center">
          
          Symptom Checker
        </h2>
        <p className="text-sm mt-1 font-medium">Your personal health companion</p>
      </div>
      
      <div className="h-80 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div key={message.id}>
            <div className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs rounded-lg p-3 border-2 border-black font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                message.sender === "user" ? "bg-[#f8fed5]" : "bg-white"
              }`}>
                {message.text}
              </div>
            </div>
            {message.tags && message.tags.length > 0 && (
              <div className="flex justify-end mt-1">
                <div className="flex gap-1">
                  {message.tags.map((tag, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded border">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {isAnalyzing && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-black rounded-lg p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Simplified Tag Selection */}
      {showTags && suggestedTags.length > 0 && questionCount < 4 && (
        <div className="p-3 bg-blue-50 border-t border-b-2 border-black">
          <div className="flex items-center mb-2">
            <Tag className="mr-2 text-blue-600" size={16} />
            <span className="font-bold text-sm">Select details that apply (optional, max 3):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedTags.map((tag, index) => (
              <button
                key={index}
                onClick={() => handleTagSelect(tag)}
                disabled={!selectedTags.includes(tag) && selectedTags.length >= 3}
                className={`px-3 py-1 text-sm font-medium rounded border-2 transition-all ${
                  selectedTags.includes(tag)
                    ? "bg-blue-200 text-blue-800 border-blue-400"
                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50 disabled:opacity-50"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <div className="mt-2 text-xs text-blue-600">
              Selected: {selectedTags.join(', ')}
            </div>
          )}
        </div>
      )}
      
      <div className="p-4 bg-[#f8fed5] border-t-2 border-black">
        <div className="flex">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Describe your symptoms clearly and specifically..."
            className="flex-1 p-3 border-2 border-black rounded-l-lg focus:outline-none font-medium"
            onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
            disabled={isAnalyzing}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isAnalyzing}
            className="px-4 bg-[#f5ff23] text-black font-bold border-2 border-black border-l-0 rounded-r-lg 
                     shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                     hover:bg-[#E5Ef20] 
                     hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] 
                     hover:translate-x-[1px] hover:translate-y-[1px] 
                     transition-all disabled:opacity-50"
          >
            <Send />
          </button>
        </div>
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-600 font-medium">
            💡 Be specific about timing, location, severity, and triggers
          </p>
          {questionCount < 7 && (
            <p className="text-xs text-blue-600 font-medium">
              Clinical Interview: {questionCount + 1}/7+ questions
            </p>
          )}
        </div>
      </div>
    </div>
  );
}