'use client';
import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import { Star,  Loader2, Navigation, MapPin } from 'lucide-react';

interface Doctor {
  id: number;
  Name: string;
  Category: string;
  "Address/Details": string;
  City: string;
  Rating: number;
  distance?: number;
}

interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const detectLocation = async (): Promise<void> => {
    setLoading(true);
    setError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Geolocation is not supported by this browser'));
          return;
        }

        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
        );
      });

      const { latitude, longitude } = position.coords;
      
      let cityName = '';
      try {
        const geocodeResponse = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const geocodeData = await geocodeResponse.json();
        cityName = geocodeData.city || geocodeData.locality || geocodeData.principalSubdivision || 'Unknown';
      } catch (geocodeError) {
        console.warn('Failed to get city name:', geocodeError);
        cityName = 'Unknown';
      }

      setUserLocation({ latitude, longitude, city: cityName });
      await fetchNearbyDoctors(latitude, longitude, cityName);
      
    } catch (error) {
      console.error('Location detection failed:', error);
      setError('Failed to detect location. Please try again or enable location services.');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyDoctors = async (lat: number, lng: number, city: string): Promise<void> => {
    try {
      const response = await fetch('/api/doctors/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: lat,
          longitude: lng,
          city: city
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch doctors');
      }

      const data = await response.json();
      console.log('API Response:', data);
      setDoctors(data.doctors || []);
    } catch (error) {
      console.error('Failed to fetch doctors:', error);
      setError(error instanceof Error ? error.message : 'Failed to load nearby doctors. Please try again.');
    }
  };

  return (
    <MainLayout>
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#f8fed5]">
        
        <header className="bg-black  border-b-2 border-black p-6 flex-shrink-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-6">
               <div className="p-2 md:p-3 bg-white/20 mr-3 dark:bg-gray-600/20 rounded-xl">
                              <MapPin className="h-6 w-6 md:h-8 md:w-8 text-white dark:text-white" />
                            </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Nearby Doctors</h1>
                <p className="text-white font-medium text-lg">Find healthcare providers in your area</p>
              </div>
            </div>
            
            <div className="mt-6">
              {!userLocation ? (
                <button
                  onClick={detectLocation}
                  disabled={loading}
                  className="flex items-center px-6 py-4 
                           text-black font-bold rounded-lg 
                           border-2 border-white bg-[#f5ff23]
                           shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                           hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                           hover:translate-x-[2px] hover:translate-y-[2px] 
                           hover:bg-[#e0f081] transition-all
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="mr-3 animate-spin" size={20} />
                  ) : (
                    <Navigation className="mr-3" size={20} />
                  )}
                  {loading ? 'Detecting Location...' : 'Find Doctors Near Me'}
                </button>
              ) : (
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center px-6 py-3 bg-[#e0f081] text-black rounded-lg 
                                 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin size={18} className="mr-3" /> 
                    <span className="font-bold">
                      {userLocation.city} • {doctors.length} doctors found
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setUserLocation(null);
                      setDoctors([]);
                      setError('');
                    }}
                    className="px-4 py-2 text-black font-bold rounded-lg 
                             border-2 border-black bg-[#f8fed5]
                             shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
                             hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] 
                             hover:translate-x-[1px] hover:translate-y-[1px] 
                             hover:bg-[#e0f081] transition-all"
                  >
                    Change Location
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="mt-6 p-4 bg-red-200 border-2 border-black rounded-lg 
                             shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black font-bold">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-600 rounded-full mr-3"></div>
                  {error}
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Main Content - Scrollable */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {loading && userLocation && (
              <div className="flex justify-center py-12">
                <div className="text-center p-8 bg-white rounded-lg border-2 border-black 
                               shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="p-4 bg-[#e0f081] rounded-full w-fit mx-auto mb-4 
                                 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Loader2 className="animate-spin text-black" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">Searching for doctors</h3>
                  <p className="text-black font-medium">This may take a few moments</p>
                </div>
              </div>
            )}

            {doctors.length === 0 && userLocation && !loading && (
              <div className="flex justify-center py-12">
                <div className="text-center p-8 bg-white rounded-lg border-2 border-black 
                               shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-md">
                  <div className="p-4 bg-[#f8fed5] rounded-full w-fit mx-auto mb-4 
                                 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <MapPin className="text-black" size={32} />
                  </div>
                  <h3 className="text-xl font-bold text-black mb-2">No doctors found</h3>
                  <p className="text-black font-medium">Try checking your location settings or contact support for assistance.</p>
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {doctors.map((doctor: Doctor) => (
                <div
                  key={doctor.id}
                  className="bg-white border-2 border-black rounded-lg p-6 
                           shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] 
                           hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] 
                           hover:translate-x-[-2px] hover:translate-y-[-2px] 
                           transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-lg text-black leading-tight pr-2">{doctor.Name}</h3>
                    
                  </div>
                  
                  <div className="space-y-3 mb-5">
                    <div className="inline-flex items-center px-3 py-1 bg-[#f8fed5] text-black 
                                  rounded-lg text-sm font-bold border-2 border-black 
                                  shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]">
                      {doctor.Category}
                    </div>
                    <p className="text-black font-medium text-sm leading-relaxed">{doctor["Address/Details"]}</p>
                    <div className="flex items-center text-sm text-black font-medium">
                      <MapPin size={14} className="mr-2" />
                      <span>{doctor.City}</span>
                    </div>
                  </div>

                  <div className="flex items-center p-3 bg-yellow-200 rounded-lg 
                                 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <Star className="text-black mr-2" size={16} fill="currentColor" />
                    <span className="text-sm font-bold text-black">{doctor.Rating.toFixed(1)}</span>
                    <span className="text-black mx-2 font-bold">•</span>
                    <span className="text-sm text-black font-medium">{doctor.Category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

    </MainLayout>
  );
}