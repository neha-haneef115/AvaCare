import { MongoClient } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI


const options = {
 
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,

  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  
  
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
 
  retryWrites: true,
  retryReads: true,
  
  
  heartbeatFrequencyMS: 10000,
  
 
  appName: 'DoctorFinderApp',
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  
  let globalForMongo = globalThis as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalForMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalForMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalForMongo._mongoClientPromise
} else {
 
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise