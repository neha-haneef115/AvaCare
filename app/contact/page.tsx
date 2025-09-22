"use client";
import { useState } from "react";
import Link from "next/link";
import { IoLogoWhatsapp } from "react-icons/io";
import MainLayout from '@/components/MainLayout';
import { MdEmail } from "react-icons/md";
import Footer from "@/components/Footer";
import { TiSocialLinkedin } from "react-icons/ti";
import { 
  Send,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactForm>({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch("https://formspree.io/f/xkgbnwep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        // Reset form after successful submission
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          category: "general"
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

 

  const faqItems = [
    {
      question: "How accurate is the AI symptom analysis?",
      answer: "Our AI provides preliminary insights based on medical data, but it's not a substitute for professional medical diagnosis. Always consult healthcare professionals for medical advice."
    },
    {
      question: "Is my health data secure and private?",
      answer: "Yes, we use enterprise-grade encryption and follow HIPAA compliance standards to protect your health information. Your data is never shared without consent."
    },
    {
      question: "How do I find doctors in my area?",
      answer: "Enable location services or manually enter your location to find qualified healthcare providers nearby with real-time availability."
    },
    {
      question: "Can I use SymptomCheck AI for emergencies?",
      answer: "No, never use our service for medical emergencies. For urgent medical situations, call 911 or go to your nearest emergency room immediately."
    }
  ];

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col min-h-screen overflow-y-auto">
      
        <header className="bg-black text-white border-b-2 border-black p-6">
<div className="max-w-6xl mx-auto text-center">
    <h1 className="text-4xl font-black mb-2">Contact Us</h1>
    <p className="text-lg font-medium text-white mb-4">
      Get in touch with us - we're here to help!
    </p>
    <div className="flex flex-col sm:flex-row justify-center items-center gap-5 text-white">
<div className="flex items-center gap-2 ">
      <MdEmail className="w-6 h-6 text-white" />
      <div>
      
      nehahaneef203@gmail.com
      </div>
  </div>
    <Link 
      href="https://wa.me/923257220057" 
      className="flex items-center gap-2 hover:underline"
    >
      <IoLogoWhatsapp className="w-6 h-6 text-white" />
      <div>
       
        <p className="text-white">+92 314 2959462</p>
      </div>
    </Link>

    
    <Link 
      href="https://www.linkedin.com/in/neha-haneef115" 
      className="flex items-center gap-2 hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      <TiSocialLinkedin className="w-6 h-6 text-white" />
      <div>
       
        <p className="text-white">@neha-haneef115</p>
      </div>
    </Link>
    </div>
  </div>
</header>
      
        <main className="flex-1 bg-white p-6">
          <div className="max-w-6xl mx-auto">
            
            
            

            <div className="grid lg:grid-cols-2 gap-8">
              
              <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-4 bg-[#f8fed5] border-b-2 border-black">
                  <h2 className="text-xl font-bold">Send us a Message</h2>
                  <p className="text-sm font-medium">We'll get back to you within 24 hours</p>
                </div>
                
                <div className="p-6">
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                      <p className="text-gray-600">Thank you for contacting us. We'll respond soon.</p>
                      <button
                        onClick={() => setIsSubmitted(false)}
                        className="mt-4 px-4 py-2 bg-[#f5ff23] text-black font-bold rounded-lg 
                                 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                                 hover:bg-[#E5Ef20] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                                 hover:translate-x-[2px] hover:translate-y-[2px] 
                                 transition-all duration-200"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {error && (
                        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-4 flex items-start">
                          <XCircle className="w-5 h-5 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      )}
                      
                      <div>
                        <label className="block text-sm font-bold mb-2">Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border-2 border-black rounded-lg focus:outline-none font-medium
                                   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="Your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border-2 border-black rounded-lg focus:outline-none font-medium
                                   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="your@email.com"
                        />
                      </div>

                    

                      <div>
                        <label className="block text-sm font-bold mb-2">Subject *</label>
                        <input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          required
                          className="w-full p-3 border-2 border-black rounded-lg focus:outline-none font-medium
                                   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="Brief description of your inquiry"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold mb-2">Message *</label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          required
                          rows={5}
                          className="w-full p-3 border-2 border-black rounded-lg focus:outline-none font-medium resize-none
                                   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          placeholder="Tell us how we can help you..."
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-[#f5ff23] text-black font-bold rounded-lg 
                                 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                                 hover:bg-[#E5Ef20] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                                 hover:translate-x-[2px] hover:translate-y-[2px] 
                                 transition-all duration-200 disabled:opacity-50
                                 disabled:hover:transform-none disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        {isSubmitting ? (
                          <div className="flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                            Sending...
                          </div>
                        ) : (
                          <>
                            <Send className="inline mr-2 w-4 h-4" />
                            Send Message
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* FAQ Section */}
              <div className="space-y-6">
                <div className="bg-white border-2 border-black rounded-lg overflow-hidden shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="p-4 bg-[#f8fed5] border-b-2 border-black">
                    <h2 className="text-xl font-bold">Frequently Asked Questions</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    {faqItems.map((faq, index) => (
                      <div key={index} className="border-2 border-black rounded-lg p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <h3 className="font-bold mb-2">{faq.question}</h3>
                        <p className="text-sm text-gray-700 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Emergency Notice */}
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-800 mb-2">Medical Emergency Notice</h3>
                      <p className="text-sm text-red-700 leading-relaxed">
                        If you're experiencing a medical emergency, do not use this contact form. 
                        Call 115 immediately or go to your nearest emergency room.
                      </p>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
          
       <Footer/>
        </main>

      </div>
    </MainLayout>
  );
}
