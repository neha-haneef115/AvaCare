// components/nearbydoctors.tsx
import { 
  MapPin, 
  Star, 
  Phone, 
  Calendar,
  AlertCircle
} from "lucide-react";
import { useState, useEffect } from 'react';
import { FaUserDoctor } from "react-icons/fa6";

interface Doctor {
  id: number;
  Name: string;
  Category: string;
  Address: string;
  City: string;
  Rating: number;
  distance: number;
  available?: boolean;
  nextAvailable?: string;
}

interface NearbyDoctorsProps {
  userLocation: boolean;
  onLocationDetect: () => void;
  conditions: {
    name: string;
    confidence: "High" | "Medium" | "Low";
  }[];
  userCoords?: {
    latitude: number;
    longitude: number;
    city: string;
  };
}

// Comprehensive mapping of conditions to doctor specialties
const CONDITION_TO_SPECIALTY: Record<string, string[]> = {
  // Gastroenterology
  'ulcer': ['Gastroenterologist', 'General Physician'],
  'gastritis': ['Gastroenterologist', 'General Physician'],
  'acid reflux': ['Gastroenterologist', 'General Physician'],
  'heartburn': ['Gastroenterologist', 'General Physician'],
  'stomach pain': ['Gastroenterologist', 'General Physician'],
  'abdominal pain': ['Gastroenterologist', 'General Physician'],
  'constipation': ['Gastroenterologist', 'General Physician'],
  'diarrhea': ['Gastroenterologist', 'General Physician'],
  'ibs': ['Gastroenterologist', 'General Physician'],
  'crohns disease': ['Gastroenterologist', 'General Physician'],
  'inflammatory bowel disease': ['Gastroenterologist', 'General Physician'],

  // Neurology
  'migraine': ['Neurologist', 'General Physician'],
  'headache': ['Neurologist', 'General Physician'],
  'seizure': ['Neurologist', 'Emergency Medicine'],
  'epilepsy': ['Neurologist', 'General Physician'],
  'stroke': ['Neurologist', 'Emergency Medicine'],
  'parkinsons': ['Neurologist', 'General Physician'],
  'alzheimers': ['Neurologist', 'Geriatrician'],
  'memory loss': ['Neurologist', 'Geriatrician'],
  'dizziness': ['Neurologist', 'ENT Specialist'],
  'vertigo': ['Neurologist', 'ENT Specialist'],
  'neuropathy': ['Neurologist', 'General Physician'],

  // Cardiology
  'hypertension': ['Cardiologist', 'General Physician'],
  'high blood pressure': ['Cardiologist', 'General Physician'],
  'chest pain': ['Cardiologist', 'Emergency Medicine'],
  'heart attack': ['Cardiologist', 'Emergency Medicine'],
  'heart disease': ['Cardiologist', 'General Physician'],
  'arrhythmia': ['Cardiologist', 'General Physician'],
  'palpitations': ['Cardiologist', 'General Physician'],
  'heart murmur': ['Cardiologist', 'General Physician'],
  'angina': ['Cardiologist', 'General Physician'],
  'atherosclerosis': ['Cardiologist', 'General Physician'],

  // Pulmonology/Respiratory
  'asthma': ['Pulmonologist', 'General Physician'],
  'copd': ['Pulmonologist', 'General Physician'],
  'pneumonia': ['Pulmonologist', 'General Physician'],
  'bronchitis': ['Pulmonologist', 'General Physician'],
  'shortness of breath': ['Pulmonologist', 'General Physician'],
  'cough': ['Pulmonologist', 'General Physician'],
  'lung infection': ['Pulmonologist', 'General Physician'],
  'tuberculosis': ['Pulmonologist', 'Infectious Disease'],
  'sleep apnea': ['Pulmonologist', 'ENT Specialist'],

  // Endocrinology
  'diabetes': ['Endocrinologist', 'General Physician'],
  'thyroid': ['Endocrinologist', 'General Physician'],
  'hyperthyroidism': ['Endocrinologist', 'General Physician'],
  'hypothyroidism': ['Endocrinologist', 'General Physician'],
  'hormone imbalance': ['Endocrinologist', 'General Physician'],
  'insulin resistance': ['Endocrinologist', 'General Physician'],
  'metabolic syndrome': ['Endocrinologist', 'General Physician'],
  'obesity': ['Endocrinologist', 'General Physician'],

  // Mental Health
  'depression': ['Psychiatrist', 'Psychologist', 'General Physician'],
  'anxiety': ['Psychiatrist', 'Psychologist', 'General Physician'],
  'panic disorder': ['Psychiatrist', 'Psychologist'],
  'bipolar disorder': ['Psychiatrist', 'General Physician'],
  'schizophrenia': ['Psychiatrist', 'General Physician'],
  'ptsd': ['Psychiatrist', 'Psychologist'],
  'ocd': ['Psychiatrist', 'Psychologist'],
  'adhd': ['Psychiatrist', 'Neurologist'],
  'eating disorder': ['Psychiatrist', 'Psychologist'],
  'substance abuse': ['Psychiatrist', 'Addiction Medicine'],

  // Orthopedics/Musculoskeletal
  'fracture': ['Orthopedic Surgeon', 'Emergency Medicine'],
  'arthritis': ['Rheumatologist', 'Orthopedic Surgeon'],
  'joint pain': ['Rheumatologist', 'Orthopedic Surgeon'],
  'back pain': ['Orthopedic Surgeon', 'Neurologist'],
  'neck pain': ['Orthopedic Surgeon', 'Neurologist'],
  'muscle pain': ['Orthopedic Surgeon', 'General Physician'],
  'sports injury': ['Sports Medicine', 'Orthopedic Surgeon'],
  'osteoporosis': ['Rheumatologist', 'Endocrinologist'],
  'fibromyalgia': ['Rheumatologist', 'General Physician'],
  'tendonitis': ['Orthopedic Surgeon', 'Sports Medicine'],

  // Dermatology
  'skin rash': ['Dermatologist', 'General Physician'],
  'acne': ['Dermatologist', 'General Physician'],
  'eczema': ['Dermatologist', 'Allergist'],
  'psoriasis': ['Dermatologist', 'Rheumatologist'],
  'skin cancer': ['Dermatologist', 'Oncologist'],
  'mole': ['Dermatologist', 'General Physician'],
  'warts': ['Dermatologist', 'General Physician'],
  'skin infection': ['Dermatologist', 'General Physician'],

  // Allergy/Immunology
  'allergy': ['Allergist', 'General Physician'],
  'allergic reaction': ['Allergist', 'Emergency Medicine'],
  'food allergy': ['Allergist', 'General Physician'],
  'hay fever': ['Allergist', 'ENT Specialist'],
  'hives': ['Allergist', 'Dermatologist'],
  'anaphylaxis': ['Allergist', 'Emergency Medicine'],

  // ENT (Ear, Nose, Throat)
  'sore throat': ['ENT Specialist', 'General Physician'],
  'ear infection': ['ENT Specialist', 'General Physician'],
  'hearing loss': ['ENT Specialist', 'Audiologist'],
  'tinnitus': ['ENT Specialist', 'Neurologist'],
  'sinusitis': ['ENT Specialist', 'General Physician'],
  'nasal congestion': ['ENT Specialist', 'General Physician'],
  'tonsillitis': ['ENT Specialist', 'General Physician'],

  // Urology
  'kidney stones': ['Urologist', 'General Physician'],
  'uti': ['Urologist', 'General Physician'],
  'urinary tract infection': ['Urologist', 'General Physician'],
  'bladder infection': ['Urologist', 'General Physician'],
  'prostate': ['Urologist', 'General Physician'],
  'kidney disease': ['Nephrologist', 'General Physician'],

  // Gynecology
  'menstrual problems': ['Gynecologist', 'General Physician'],
  'pcos': ['Gynecologist', 'Endocrinologist'],
  'endometriosis': ['Gynecologist', 'General Physician'],
  'pregnancy': ['Obstetrician', 'General Physician'],
  'menopause': ['Gynecologist', 'Endocrinologist'],

  // Infectious Diseases
  'flu': ['General Physician', 'Infectious Disease'],
  'cold': ['General Physician', 'ENT Specialist'],
  'fever': ['General Physician', 'Infectious Disease'],
  'infection': ['Infectious Disease', 'General Physician'],
  'viral infection': ['Infectious Disease', 'General Physician'],
  'bacterial infection': ['Infectious Disease', 'General Physician'],
  'covid': ['Infectious Disease', 'Pulmonologist'],

  // Ophthalmology
  'eye pain': ['Ophthalmologist', 'General Physician'],
  'vision problems': ['Ophthalmologist', 'Optometrist'],
  'glaucoma': ['Ophthalmologist', 'General Physician'],
  'cataracts': ['Ophthalmologist', 'General Physician'],
  'dry eyes': ['Ophthalmologist', 'General Physician'],
  'pink eye': ['Ophthalmologist', 'General Physician'],

  // Hematology/Oncology
  'anemia': ['Hematologist', 'General Physician'],
  'cancer': ['Oncologist', 'General Physician'],
  'leukemia': ['Hematologist', 'Oncologist'],
  'lymphoma': ['Hematologist', 'Oncologist'],
  'blood clot': ['Hematologist', 'Vascular Surgery'],

  // Emergency/General
  'emergency': ['Emergency Medicine', 'General Physician'],
  'trauma': ['Emergency Medicine', 'Trauma Surgery'],
  'poisoning': ['Emergency Medicine', 'Toxicologist'],
  'burns': ['Emergency Medicine', 'Plastic Surgery'],
  'wound': ['General Physician', 'Surgery'],
};

// Function to intelligently match conditions to specialties
const getSpecialtiesForConditions = (conditions: { name: string; confidence: string }[]): string[] => {
  const specialtySet = new Set<string>();
  
  conditions.forEach(condition => {
    const conditionName = condition.name.toLowerCase().trim();
    
    // Direct match
    if (CONDITION_TO_SPECIALTY[conditionName]) {
      CONDITION_TO_SPECIALTY[conditionName].forEach(spec => specialtySet.add(spec));
      return;
    }
    
    // Partial match - check if condition name contains any keywords
    for (const [key, specialties] of Object.entries(CONDITION_TO_SPECIALTY)) {
      if (conditionName.includes(key) || key.includes(conditionName)) {
        specialties.forEach(spec => specialtySet.add(spec));
      }
    }
  });
  
  // Always include General Physician as a fallback
  specialtySet.add('General Physician');
  
  // Convert to array and sort by relevance (specialists first, then general)
  const specialtiesArray = Array.from(specialtySet);
  return specialtiesArray.sort((a, b) => {
    if (a === 'General Physician') return 1;
    if (b === 'General Physician') return -1;
    return 0;
  });
};

export default function NearbyDoctors({ 
  userLocation, 
  onLocationDetect, 
  conditions,
  userCoords 
}: NearbyDoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLocation && userCoords && conditions.length > 0) {
      fetchNearbyDoctors();
    }
  }, [userLocation, userCoords, conditions]);

  const fetchNearbyDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get all relevant specialties for the conditions
      const specialties = getSpecialtiesForConditions(conditions);

      console.log('Searching for specialties:', specialties); // Debug log

      const response = await fetch('/api/doctors/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: userCoords?.latitude,
          longitude: userCoords?.longitude,
          city: userCoords?.city,
          specialties: specialties
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch doctors');
      }

      const data = await response.json();
      
      // Transform the API data to match our UI expectations
      const transformedDoctors = data.doctors.map((doctor: any) => ({
        id: doctor.id,
        Name: doctor.Name,
        Category: doctor.Category,
        Address: doctor['Address/Details'],
        City: doctor.City,
        Rating: doctor.Rating,
        distance: doctor.distance,
        // Mock availability data (in a real app, this would come from the API)
        available: Math.random() > 0.3,
        nextAvailable: Math.random() > 0.5 ? 
          `Today ${Math.floor(Math.random() * 12) + 1}:${Math.random() > 0.5 ? '00' : '30'} ${Math.random() > 0.5 ? 'AM' : 'PM'}` : 
          `Tomorrow ${Math.floor(Math.random() * 12) + 1}:00 ${Math.random() > 0.5 ? 'AM' : 'PM'}`
      }));

      // Sort doctors by specialty relevance (specialists first) and then by distance
      const sortedDoctors = transformedDoctors.sort((a: Doctor, b: Doctor) => {
        const aIsGeneral = a.Category.toLowerCase().includes('general');
        const bIsGeneral = b.Category.toLowerCase().includes('general');
        
        if (aIsGeneral && !bIsGeneral) return 1;
        if (!aIsGeneral && bIsGeneral) return -1;
        
        return a.distance - b.distance;
      });

      setDoctors(sortedDoctors.slice(0, 8)); // Increased to 8 doctors to show more variety
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load nearby doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <div className="max-w-5xl mt-10 mx-auto bg-white border-2 border-black rounded-lg overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
      <div className="p-4 bg-black text-white border-b-2 border-black">
        <div className="flex items-center space-x-3">
                     <div className="p-2 md:p-3 bg-white/20 dark:bg-gray-600/20 rounded-xl">
                       <FaUserDoctor className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-white" />
                     </div>
                     <div>
                       <h1 className="text-xl md:text-2xl font-bold">Recommended Healthcare Providers</h1>
                      
        <p className="text-sm font-medium">
          {userLocation ? 
            `Based on your symptoms: ${conditions.map(c => c.name).join(', ')}` : 
            "Enable location to find doctors near you"}
        </p>
                     </div>
        
                   </div>
        {userLocation && conditions.length > 0 && (
          <p className="text-xs text-gray-100 mt-3">
            Suggested doctors will appear based on your reported symptoms.
          </p>
        )}
      </div>
      
      <div className="p-4">
        {!userLocation ? (
          <div className="text-center py-8">
            <button
              onClick={onLocationDetect}
              className="flex items-center px-8 py-4 
                       bg-[#f5ff23] 
                       text-black font-bold rounded-lg 
                       border-2 border-black 
                       shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                       hover:bg-[#E5Ef20] 
                       hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                       hover:translate-x-[2px] hover:translate-y-[2px] 
                       transition-all mx-auto"
            >
              <MapPin className="mr-2" /> Find Healthcare Providers
            </button>
          </div>
        ) : loading ? (
          <div className="text-center py-8">
            <p>Loading recommended doctors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="flex items-center justify-center text-red-600">
              <AlertCircle className="mr-2" />
              <p>{error}</p>
            </div>
            <button
              onClick={fetchNearbyDoctors}
              className="mt-4 px-4 py-2 bg-[#f8fed5] border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#e0f081]"
            >
              Retry
            </button>
          </div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-8">
            <p>Suggested doctors will appear based on your reported symptoms.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="border-2 border-black rounded-lg p-4 bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all"
              >
                <h3 className="font-bold text-sm">{doctor.Name}</h3>
                <p className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded mt-1 inline-block">
                  {doctor.Category}
                </p>
                <p className="text-xs text-gray-500 mt-2">{doctor.Address}, {doctor.City}</p>
                
                <div className="flex items-center text-sm font-medium my-3">
                  <Star className="text-yellow-500 mr-1" size={14} />
                  <span>{doctor.Rating}</span>
                 
                </div>
                
                
                
                
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}