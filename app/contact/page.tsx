"use client";
import { useState } from "react";
import MainLayout from '@/components/MainLayout';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageSquare,
  Clock,
  Users,
  AlertCircle,
  CheckCircle
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Reset form after successful submission
      setTimeout(() => {
        setIsSubmitted(false);
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          category: "general"
        });
      }, 3000);
    }, 2000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Support",
      value: "support@symptomcheck.ai",
      description: "Get help within 24 hours",
      color: "bg-blue-100"
    },
    {
      icon: Phone,
      title: "Phone Support",
      value: "+1 (555) 123-4567",
      description: "Mon-Fri, 9AM-6PM EST",
      color: "bg-green-100"
    },
    {
      icon: MapPin,
      title: "Office Location",
      value: "123 Health Tech Ave",
      description: "San Francisco, CA 94105",
      color: "bg-purple-100"
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      value: "Available 24/7",
      description: "Instant support online",
      color: "bg-yellow-100"
    }
  ];

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
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="bg-white border-b-2 border-black p-6">
          <div className="max-w-6xl mx-auto text-center">
            <h1 className="text-4xl font-black mb-2">Contact Us</h1>
            <p className="text-lg font-medium text-gray-700">
              Get in touch with our support team - we're here to help!
            </p>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 bg-gradient-to-br from-blue-50 to-green-50 p-6">
          <div className="max-w-6xl mx-auto">
            
            {/* Contact Methods Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {contactMethods.map((method, index) => (
                <div 
                  key={index}
                  className="bg-white border-2 border-black rounded-lg p-6 text-center
                           shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                           hover:translate-x-[2px] hover:translate-y-[2px]
                           transition-all duration-200"
                >
                  <div className={`${method.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-black`}>
                    <method.icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{method.title}</h3>
                  <p className="font-bold text-black mb-1">{method.value}</p>
                  <p className="text-sm text-gray-600">{method.description}</p>
                </div>
              ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Contact Form */}
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
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                        <label className="block text-sm font-bold mb-2">Category</label>
                        <select
                          name="category"
                          value={formData.category}
                          onChange={handleInputChange}
                          className="w-full p-3 border-2 border-black rounded-lg focus:outline-none font-medium
                                   shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        >
                          <option value="general">General Inquiry</option>
                          <option value="technical">Technical Support</option>
                          <option value="medical">Medical Questions</option>
                          <option value="privacy">Privacy & Security</option>
                          <option value="billing">Billing & Payments</option>
                          <option value="partnership">Partnership</option>
                        </select>
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
                        Call 911 immediately or go to your nearest emergency room.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Support Hours */}
                <div className="bg-white border-2 border-black rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center mb-4">
                    <Clock className="w-6 h-6 mr-3" />
                    <h3 className="font-bold text-lg">Support Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Monday - Friday:</span>
                      <span>9:00 AM - 6:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Saturday:</span>
                      <span>10:00 AM - 4:00 PM EST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Sunday:</span>
                      <span>Closed</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-300">
                      <p className="text-xs text-gray-600">
                        <strong>Live Chat:</strong> Available 24/7 for urgent technical issues
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t-2 border-black p-6">
          <div className="max-w-6xl mx-auto text-center">
            <p className="font-bold text-lg mb-3">
              © {new Date().getFullYear()} SymptomCheck AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <a href="#" className="hover:underline font-medium text-black 
                                   hover:text-gray-700 transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:underline font-medium text-black 
                                   hover:text-gray-700 transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:underline font-medium text-black 
                                   hover:text-gray-700 transition-colors">
                About Us
              </a>
              <a href="#" className="hover:underline font-medium text-black 
                                   hover:text-gray-700 transition-colors">
                Careers
              </a>
            </div>
          </div>
        </footer>
      </div>
    </MainLayout>
  );
}