import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

// Global variable to cache the connection
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(MONGODB_URI!, {
    // Add connection options for better stability
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  try {
    await client.connect();
    const db = client.db('doctorDB');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

interface Doctor {
  id: number;
  Name: string;
  Category: string;
  "Address/Details": string;
  City: string;
  Rating: number;
  distance?: number;
}

interface RequestBody {
  latitude: number;
  longitude: number;
  city: string;
  radius?: number;
  specialties?: string[];
}

const CITY_COORDINATES: { [key: string]: { lat: number; lng: number } } = {
  'karachi': { lat: 24.8607, lng: 67.0011 },
  'lahore': { lat: 31.5204, lng: 74.3587 },
  'islamabad': { lat: 33.6844, lng: 73.0479 },
  'rawalpindi': { lat: 33.5651, lng: 73.0169 },
  'faisalabad': { lat: 31.4504, lng: 73.1350 },
  'multan': { lat: 30.1575, lng: 71.5249 },
  'peshawar': { lat: 34.0151, lng: 71.5249 },
  'quetta': { lat: 30.1798, lng: 66.9750 },
  'sialkot': { lat: 32.4945, lng: 74.5229 },
  'gujranwala': { lat: 32.1877, lng: 74.1945 },
  'hyderabad': { lat: 25.3960, lng: 68.3578 },
  'bahawalpur': { lat: 29.4027, lng: 71.6838 },
  'sargodha': { lat: 32.0836, lng: 72.6711 },
  'sukkur': { lat: 27.8583, lng: 68.8578 },
  'larkana': { lat: 27.5590, lng: 68.2123 },
  'sheikhupura': { lat: 31.7167, lng: 73.9667 },
  'jhang': { lat: 31.2681, lng: 72.3317 },
  'rahim yar khan': { lat: 28.4212, lng: 70.2989 },
  'gujrat': { lat: 32.5742, lng: 74.0778 },
  'kasur': { lat: 31.1156, lng: 74.4502 },
  'mardan': { lat: 34.1958, lng: 72.0408 },
  'mingora': { lat: 34.7797, lng: 72.3625 },
  'nawabshah': { lat: 26.2442, lng: 68.4103 },
  'chiniot': { lat: 31.7167, lng: 72.9781 },
  'kamoke': { lat: 31.9742, lng: 74.2239 },
  'sadiqabad': { lat: 28.3089, lng: 70.1261 },
  'burewala': { lat: 30.1644, lng: 72.6536 },
  'jacobabad': { lat: 28.2820, lng: 68.4375 },
  'muzaffargarh': { lat: 30.0736, lng: 71.1939 },
  'khanpur': { lat: 28.6448, lng: 70.6850 },
  'gojra': { lat: 31.1492, lng: 72.6856 },
  'bahawalnagar': { lat: 30.0000, lng: 73.2500 },
  'muridke': { lat: 31.8000, lng: 74.2667 },
  'pakpattan': { lat: 30.3394, lng: 73.3881 },
  'abottabad': { lat: 34.1688, lng: 73.2215 },
  'tando allahyar': { lat: 25.4608, lng: 68.7194 },
  'jaranwala': { lat: 31.3333, lng: 73.4167 },
  'chishtian': { lat: 29.7944, lng: 72.8661 },
  'daska': { lat: 32.3297, lng: 74.3500 },
  'mandi bahauddin': { lat: 32.5861, lng: 73.4917 },
  'ahmadpur east': { lat: 29.1439, lng: 71.2581 },
  'kamalia': { lat: 30.7267, lng: 72.6447 },
  'khushab': { lat: 32.2969, lng: 72.3519 },
  'wazirabad': { lat: 32.4428, lng: 74.1194 },
  'mirpur khas': { lat: 25.5276, lng: 69.0142 }
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
}

export async function POST(request: NextRequest) {
  try {
    // Check if MONGODB_URI is defined
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    const body: RequestBody = await request.json();
    const { latitude, longitude, city, radius = 25, specialties } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    // Connect to database with error handling
    const { db } = await connectToDatabase();
    const collection: Collection<Doctor> = db.collection('doctors');

    // Build the base query
    const baseQuery: any = {};
    
    // Add specialty filter if provided
    if (specialties && specialties.length > 0) {
      baseQuery.Category = { 
        $in: specialties.map(spec => new RegExp(spec, 'i')) 
      };
    }

    // Get user's city coordinates
    const userCity = city.toLowerCase();
    let nearbyDoctors: Doctor[] = [];

    // Strategy 1: First try to find doctors in the exact same city
    if (city) {
      const sameCityQuery = { ...baseQuery, City: { $regex: new RegExp(city, 'i') } };
      
      const sameCityDoctors = await collection
        .find(sameCityQuery)
        .sort({ Rating: -1 })
        .limit(20)
        .toArray();
      
      nearbyDoctors = sameCityDoctors;
    }

    // Strategy 2: If no doctors in same city or we need more, find nearby cities
    if (nearbyDoctors.length < 10) {
      const nearbyCities: string[] = [];
      
      // Find cities within radius
      Object.entries(CITY_COORDINATES).forEach(([cityName, coords]) => {
        const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
        if (distance <= radius && cityName !== userCity) {
          nearbyCities.push(cityName);
        }
      });

      if (nearbyCities.length > 0) {
        // Create regex patterns for nearby cities
        const cityRegexPatterns = nearbyCities.map(city => new RegExp(city, 'i'));
        
        const nearbyQuery = { 
          ...baseQuery,
          City: { $in: cityRegexPatterns },
          id: { $nin: nearbyDoctors.map(d => d.id) } // Exclude already found doctors
        };

        const nearbyDoctorsFromOtherCities = await collection
          .find(nearbyQuery)
          .sort({ Rating: -1 })
          .limit(20 - nearbyDoctors.length)
          .toArray();

        nearbyDoctors = [...nearbyDoctors, ...nearbyDoctorsFromOtherCities];
      }
    }

    // Strategy 3: If still not enough, get top-rated doctors from major cities
    if (nearbyDoctors.length < 5) {
      const majorCities = ['karachi', 'lahore', 'islamabad', 'rawalpindi', 'faisalabad'];
      const fallbackQuery = {
        ...baseQuery,
        City: { $in: majorCities.map(city => new RegExp(city, 'i')) },
        id: { $nin: nearbyDoctors.map(d => d.id) }
      };

      const fallbackDoctors = await collection
        .find(fallbackQuery)
        .sort({ Rating: -1 })
        .limit(10)
        .toArray();

      nearbyDoctors = [...nearbyDoctors, ...fallbackDoctors];
    }

    // Add distance information to doctors (approximate)
    const doctorsWithDistance = nearbyDoctors.map(doctor => {
      const doctorCityKey = doctor.City.toLowerCase();
      const doctorCoords = CITY_COORDINATES[doctorCityKey];
      
      let distance = 0;
      if (doctorCoords) {
        distance = calculateDistance(latitude, longitude, doctorCoords.lat, doctorCoords.lng);
      }

      return {
        ...doctor,
        distance: Math.round(distance * 10) / 10 // Round to 1 decimal place
      };
    });

    // Sort by distance, then by rating
    doctorsWithDistance.sort((a, b) => {
      if (a.distance === b.distance) {
        return b.Rating - a.Rating; // Higher rating first
      }
      return a.distance - b.distance; // Closer distance first
    });

    return NextResponse.json({
      success: true,
      doctors: doctorsWithDistance.slice(0, 20), // Limit to 20 results
      location: {
        latitude,
        longitude,
        city
      },
      searchRadius: radius,
      totalFound: doctorsWithDistance.length
    });

  } catch (error) {
    console.error('API Error:', error);
    
    // More detailed error logging for debugging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch nearby doctors',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method for testing
export async function GET() {
  try {
    // Test database connection
    const { db } = await connectToDatabase();
    const collection: Collection = db.collection('doctors');
    const count = await collection.countDocuments({});
    
    return NextResponse.json({
      message: 'Doctors API is working. Use POST method to search for nearby doctors.',
      databaseStatus: 'Connected',
      totalDoctors: count,
      requiredFields: ['latitude', 'longitude', 'city'],
      optionalFields: ['radius (default: 25km)', 'specialties (array of strings)'],
      example: {
        latitude: 24.8607,
        longitude: 67.0011,
        city: 'Karachi',
        radius: 25,
        specialties: ['Cardiologist', 'Dermatologist']
      }
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    return NextResponse.json(
      { 
        message: 'API route exists but database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}