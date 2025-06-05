import { NextRequest, NextResponse } from 'next/server';
import { MongoClient, Db, Collection } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    try {
      await cachedClient.db('admin').command({ ping: 1 });
      return { client: cachedClient, db: cachedDb };
    } catch (error) {
      console.log('Cached connection failed, creating new connection');
      cachedClient = null;
      cachedDb = null;
    }
  }

  const client = new MongoClient(MONGODB_URI!, {
    maxPoolSize: 1,
    minPoolSize: 0,
    maxIdleTimeMS: 10000,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 30000,
    connectTimeoutMS: 30000,
    
    tls: true,
    tlsAllowInvalidCertificates: false,
    tlsAllowInvalidHostnames: false,
    
    retryWrites: true,
    retryReads: true,
    
    heartbeatFrequencyMS: 30000,
  });

  try {
    console.log('Attempting to connect to MongoDB...');
    await client.connect();
    
    await client.db('admin').command({ ping: 1 });
    console.log('Successfully connected to MongoDB Atlas');
    
    const db = client.db('doctorDB');

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    if (client) {
      try {
        await client.close();
      } catch (closeError) {
        console.error('Error closing failed connection:', closeError);
      }
    }
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
    console.log('POST request received');
    
    if (!MONGODB_URI) {
      console.error('MONGODB_URI is not defined');
      return NextResponse.json(
        { error: 'Database configuration error' },
        { status: 500 }
      );
    }

    let body: RequestBody;
    try {
      body = await request.json();
    } catch (error) {
      console.error('Invalid JSON in request body:', error);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    const { latitude, longitude, city, radius = 25, specialties } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      );
    }

    console.log('Connecting to database...');
    
    const { db } = await connectToDatabase();
    const collection: Collection<Doctor> = db.collection('doctors');

    console.log('Database connected, querying doctors...');

    const baseQuery: any = {};
    
    if (specialties && specialties.length > 0) {
      baseQuery.Category = { 
        $in: specialties.map(spec => new RegExp(spec, 'i')) 
      };
    }

    const userCity = city.toLowerCase();
    let nearbyDoctors: Doctor[] = [];

    if (city) {
      const sameCityQuery = { ...baseQuery, City: { $regex: new RegExp(city, 'i') } };
      
      const sameCityDoctors = await collection
        .find(sameCityQuery)
        .sort({ Rating: -1 })
        .limit(20)
        .toArray();
      
      nearbyDoctors = sameCityDoctors;
      console.log(`Found ${sameCityDoctors.length} doctors in same city`);
    }

    if (nearbyDoctors.length < 10) {
      const nearbyCities: string[] = [];
      
      Object.entries(CITY_COORDINATES).forEach(([cityName, coords]) => {
        const distance = calculateDistance(latitude, longitude, coords.lat, coords.lng);
        if (distance <= radius && cityName !== userCity) {
          nearbyCities.push(cityName);
        }
      });

      if (nearbyCities.length > 0) {
        const cityRegexPatterns = nearbyCities.map(city => new RegExp(city, 'i'));
        
        const nearbyQuery = { 
          ...baseQuery,
          City: { $in: cityRegexPatterns },
          id: { $nin: nearbyDoctors.map(d => d.id) }
        };

        const nearbyDoctorsFromOtherCities = await collection
          .find(nearbyQuery)
          .sort({ Rating: -1 })
          .limit(20 - nearbyDoctors.length)
          .toArray();

        nearbyDoctors = [...nearbyDoctors, ...nearbyDoctorsFromOtherCities];
        console.log(`Found ${nearbyDoctorsFromOtherCities.length} doctors in nearby cities`);
      }
    }

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
      console.log(`Found ${fallbackDoctors.length} fallback doctors`);
    }

    const doctorsWithDistance = nearbyDoctors.map(doctor => {
      const doctorCityKey = doctor.City.toLowerCase();
      const doctorCoords = CITY_COORDINATES[doctorCityKey];
      
      let distance = 0;
      if (doctorCoords) {
        distance = calculateDistance(latitude, longitude, doctorCoords.lat, doctorCoords.lng);
      }

      return {
        ...doctor,
        distance: Math.round(distance * 10) / 10
      };
    });

    doctorsWithDistance.sort((a, b) => {
      if (a.distance === b.distance) {
        return b.Rating - a.Rating;
      }
      return a.distance - b.distance;
    });

    console.log(`Returning ${doctorsWithDistance.length} doctors`);

    return NextResponse.json({
      success: true,
      doctors: doctorsWithDistance.slice(0, 20),
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
    
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch nearby doctors',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log('GET request received - testing connection');
    
    const { db } = await connectToDatabase();
    const collection: Collection = db.collection('doctors');
    
    console.log('Connected to database, counting documents...');
    const count = await collection.countDocuments({});
    console.log(`Found ${count} doctors in database`);
    
    return NextResponse.json({
      message: 'Doctors API is working! Use POST method to search for nearby doctors.',
      databaseStatus: 'Connected ✅',
      totalDoctors: count,
      timestamp: new Date().toISOString(),
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
    
    console.error('MongoDB URI exists:', !!MONGODB_URI);
    console.error('MongoDB URI prefix:', MONGODB_URI?.substring(0, 20));
    
    return NextResponse.json(
      { 
        message: 'API route exists but database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        troubleshooting: {
          'Step 1': 'Check MongoDB Atlas Network Access - whitelist 0.0.0.0/0 for Vercel',
          'Step 2': 'Verify MONGODB_URI in Vercel environment variables',
          'Step 3': 'Ensure MongoDB Atlas cluster is not paused',
          'Step 4': 'Check MongoDB Atlas user permissions'
        }
      },
      { status: 500 }
    );
  }
}