import mongoose from 'mongoose';
import dns from 'dns';
import env from './env.js';

export async function connectDB() {
  mongoose.set('strictQuery', true);
  if (env.mongoUri.startsWith('mongodb+srv://')) {
    const dnsServers = (process.env.MONGO_DNS_SERVERS || '1.1.1.1,8.8.8.8')
      .split(',')
      .map((server) => server.trim())
      .filter(Boolean);

    if (dnsServers.length > 0) {
      dns.setServers(dnsServers);
    }
  }

  try {
    await mongoose.connect(env.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
    });

    console.log('MongoDB connected successfully');
    return true;
  } catch (error) {
    console.warn(`MongoDB connection failed, continuing without database: ${error.message}`);
    return false;
  }
}
