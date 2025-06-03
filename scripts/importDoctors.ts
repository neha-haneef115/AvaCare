import { MongoClient } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://your-username:your-password@cluster0.mongodb.net/doctorDB?retryWrites=true&w=majority';

interface Doctor {
  id: number;
  Name: string;
  Category: string;
  "Address/Details": string;
  City: string;
  Rating: number;
}

async function importDoctors() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    // Connect to MongoDB
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('doctorDB');
    const collection = db.collection<Doctor>('doctors'); // Generic type parameter
    
    // Read JSON file - adjust the path to your doctors JSON file
    const jsonFilePath = path.join(__dirname, '..', 'data', 'doctors.json');
    
    if (!fs.existsSync(jsonFilePath)) {
      console.error(`JSON file not found at: ${jsonFilePath}`);
      console.log('Please create a doctors.json file in the data directory');
      return;
    }
    
    const jsonData = fs.readFileSync(jsonFilePath, 'utf8');
    const doctors: Doctor[] = JSON.parse(jsonData); // Type assertion
    
    if (!Array.isArray(doctors)) {
      console.error('JSON data should be an array of doctor objects');
      return;
    }
    
    console.log(`Found ${doctors.length} doctors to import`);
    
    // Clear existing data (optional)
    const deleteResult = await collection.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing records`);
    
    // Insert new data
    const insertResult = await collection.insertMany(doctors);
    console.log(`Inserted ${insertResult.insertedCount} doctors`);
    
    // Create indexes for better performance
    await collection.createIndex({ City: 1 });
    await collection.createIndex({ Category: 1 });
    await collection.createIndex({ Rating: -1 });
    await collection.createIndex({ Name: "text", Category: "text" });
    
    console.log('Created database indexes');
    
    // Sample query to verify data - using type assertion
    const sampleDoctors = await collection.find({}).limit(5).toArray();
    console.log('\nSample doctors:');
    sampleDoctors.forEach((doctor) => { // TypeScript now knows this is Doctor type
      console.log(`- ${doctor.Name} (${doctor.Category}) in ${doctor.City} - Rating: ${doctor.Rating}`);
    });
    
    console.log('\nData import completed successfully!');
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await client.close();
  }
}

// Run the import
importDoctors();