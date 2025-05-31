// app/api/doctors/route.ts
import { NextRequest, NextResponse } from 'next/server';

interface DoctorSearchParams {
  lat: number;
  lon: number;
  condition?: string;
  radius?: number;
}

interface GeoapifyPlace {
  properties: {
    place_id?: string;
    name?: string;
    formatted?: string;
    address_line1?: string;
    street?: string;
    contact?: {
      phone?: string;
      website?: string;
    };
    phone?: string;
    website?: string;
    datasource?: {
      sourcename?: string;
      raw?: {
        rating?: number;
      };
    };
  };
  geometry: {
    coordinates: [number, number]; // [lon, lat]
  };
}

interface ProcessedDoctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  distance: string;
  available: boolean;
  nextAvailable: string;
  address: string;
  phone: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  website?: string;
  placeId?: string;
}

const GEOAPIFY_API_KEY = process.env.GEOAPIFY_API_KEY!;

// Calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): string {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance < 1 ? `${(distance * 5280).toFixed(0)} ft` : `${distance.toFixed(1)} mi`;
}

// Get search categories based on medical condition
function getSearchCategories(condition: string): string[] {
  const conditionLower = condition.toLowerCase();
  
  if (conditionLower.includes('heart') || conditionLower.includes('chest pain')) {
    return ['healthcare.doctor', 'healthcare.hospital', 'healthcare.clinic'];
  }
  if (conditionLower.includes('emergency') || conditionLower.includes('urgent')) {
    return ['healthcare.hospital', 'healthcare.clinic'];
  }
  if (conditionLower.includes('dental') || conditionLower.includes('tooth')) {
    return ['healthcare.dentist'];
  }
  if (conditionLower.includes('eye') || conditionLower.includes('vision')) {
    return ['healthcare.optometrist', 'healthcare.doctor'];
  }
  if (conditionLower.includes('pharmacy') || conditionLower.includes('medication')) {
    return ['healthcare.pharmacy'];
  }
  
  return ['healthcare.doctor', 'healthcare.clinic', 'healthcare.hospital'];
}

// Determine specialty based on category and name
function determineSpecialty(category: string, name: string): string {
  if (category.includes('dentist')) return 'Dentistry';
  if (category.includes('optometrist')) return 'Optometry';
  if (category.includes('pharmacy')) return 'Pharmacy';
  if (category.includes('hospital')) return 'Hospital Services';
  if (category.includes('clinic')) return 'Clinic Services';
  
  const nameLower = name.toLowerCase();
  if (nameLower.includes('cardio')) return 'Cardiology';
  if (nameLower.includes('dental')) return 'Dentistry';
  if (nameLower.includes('eye') || nameLower.includes('vision')) return 'Ophthalmology';
  if (nameLower.includes('dermat')) return 'Dermatology';
  if (nameLower.includes('orthop')) return 'Orthopedics';
  if (nameLower.includes('pediat')) return 'Pediatrics';
  if (nameLower.includes('gynec')) return 'Gynecology';
  
  return 'General Practice';
}

// Generate availability status (simulated)
function generateAvailability(): { available: boolean; nextAvailable: string } {
  const available = Math.random() > 0.4; // 60% chance of availability
  const nextAvailable = available ? 
    `Today ${Math.floor(Math.random() * 6) + 1}:${Math.random() > 0.5 ? '00' : '30'} PM` :
    `Tomorrow ${Math.floor(Math.random() * 5) + 8}:${Math.random() > 0.5 ? '00' : '30'} AM`;
  
  return { available, nextAvailable };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = parseFloat(searchParams.get('lat') || '0');
    const lon = parseFloat(searchParams.get('lon') || '0');
    const condition = searchParams.get('condition') || '';
    const radius = parseInt(searchParams.get('radius') || '5000'); // 5km default

    // Validate coordinates
    if (!lat || !lon || lat === 0 || lon === 0) {
      return NextResponse.json(
        { error: 'Valid latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Validate coordinates range
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json(
        { error: 'Invalid coordinate values' },
        { status: 400 }
      );
    }

    const categories = getSearchCategories(condition);
    const allDoctors: ProcessedDoctor[] = [];

    // Search for each category
    for (const category of categories) {
      const url = `https://api.geoapify.com/v2/places?categories=${category}&filter=circle:${lon},${lat},${radius}&bias=proximity:${lon},${lat}&limit=10&apiKey=${GEOAPIFY_API_KEY}`;
      
      try {
        console.log(`Fetching from: ${url}`);
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error(`API Error for ${category}: ${response.status} ${response.statusText}`);
          continue; // Skip this category and continue with others
        }
        
        const data = await response.json();
        console.log(`Data for ${category}:`, data);
        
        if (data.features && data.features.length > 0) {
          const doctors = data.features.map((place: GeoapifyPlace, index: number) => {
            const distance = calculateDistance(
              lat, lon,
              place.geometry.coordinates[1], place.geometry.coordinates[0]
            );

            // Extract meaningful information from the place data
            const name = place.properties.name || 
                        place.properties.datasource?.sourcename || 
                        `Healthcare Provider ${index + 1}`;
            
            const address = place.properties.formatted || 
                           place.properties.address_line1 || 
                           place.properties.street || 
                           'Address not available';

            const phone = place.properties.contact?.phone || 
                         place.properties.phone || 
                         'Phone not available';

            const website = place.properties.contact?.website || 
                           place.properties.website;

            const specialty = determineSpecialty(category, name);
            const { available, nextAvailable } = generateAvailability();
            const rating = place.properties.datasource?.raw?.rating || (4.0 + Math.random() * 1.0);

            return {
              id: place.properties.place_id || `place_${index}_${category}`,
              name: name,
              specialty: specialty,
              rating: Math.round(rating * 10) / 10,
              distance: distance,
              available: available,
              nextAvailable: nextAvailable,
              address: address,
              phone: phone,
              coordinates: {
                lat: place.geometry.coordinates[1],
                lon: place.geometry.coordinates[0]
              },
              website: website,
              placeId: place.properties.place_id
            };
          });

          allDoctors.push(...doctors);
        }
      } catch (fetchError) {
        console.error(`Error fetching ${category}:`, fetchError);
        continue; // Continue with other categories
      }
    }

    // Remove duplicates based on name and address
    const uniqueDoctors = allDoctors.filter((doctor, index, self) => 
      index === self.findIndex(d => 
        d.name.toLowerCase() === doctor.name.toLowerCase() && 
        d.address === doctor.address
      )
    );

    // Sort by availability first, then by distance
    const sortedDoctors = uniqueDoctors
      .sort((a, b) => {
        if (a.available && !b.available) return -1;
        if (!a.available && b.available) return 1;
        return parseFloat(a.distance) - parseFloat(b.distance);
      })
      .slice(0, 6); // Limit to 6 results

    console.log(`Found ${sortedDoctors.length} doctors`);

    return NextResponse.json({
      success: true,
      data: sortedDoctors,
      total: sortedDoctors.length,
      searchParams: {
        lat,
        lon,
        condition,
        radius
      }
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch healthcare providers',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}