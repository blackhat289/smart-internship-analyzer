import mongoose from 'mongoose';
import fs from 'fs';
import dns from 'dns';

const MONGO_URI = "mongodb+srv://Coding:abcd9876@cluster0.osbl6nz.mongodb.net/neww?appName=Cluster0";

const resumeSchema = new mongoose.Schema({}, { strict: false, collection: 'resumes' });
const analysisSchema = new mongoose.Schema({}, { strict: false, collection: 'analyses' });

const Resume = mongoose.model('Resume', resumeSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);

async function run() {
  try {
    dns.setServers(['1.1.1.1', '8.8.8.8']);
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB successfully!");

    const resumes = await Resume.find({}).sort({ updatedAt: -1 }).limit(1);
    const analyses = await Analysis.find({}).sort({ updatedAt: -1 }).limit(1);

    const logData = {
      timestamp: new Date().toISOString(),
      resume: resumes.length ? resumes[0].toObject() : null,
      analysis: analyses.length ? analyses[0].toObject() : null
    };

    fs.writeFileSync('inspection_log.json', JSON.stringify(logData, null, 2));
    console.log("Database dump saved to inspection_log.json successfully!");

  } catch (err) {
    console.error("Error running inspection:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
