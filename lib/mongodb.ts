import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI

// Enhanced options with better SSL/TLS configuration
const options = {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
  
  // Timeout settings
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  
  // SSL/TLS configuration
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  
  // Retry configuration
  retryWrites: true,
  retryReads: true,
  
  // Heartbeat frequency
  heartbeatFrequencyMS: 10000,
  
  // Application name for easier debugging
  appName: 'DoctorFinderApp',
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable to preserve the value
  // across module reloads caused by HMR (Hot Module Replacement)
  let globalForMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalForMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalForMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise