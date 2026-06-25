import mongoose from 'mongoose';
import { parseResumeService } from '../src/services/resume/parseResume.service.js';

const MONGO_URI = "mongodb+srv://Coding:abcd9876@cluster0.osbl6nz.mongodb.net/neww?appName=Cluster0";

const resumeSchema = new mongoose.Schema({}, { strict: false, collection: 'resumes' });
const Resume = mongoose.model('Resume', resumeSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const resumes = await Resume.find({}).sort({ updatedAt: -1 }).limit(1);
    if (!resumes.length) {
      console.log("No resumes found");
      return;
    }

    const r = resumes[0].toObject();
    console.log(`ID: ${r._id}`);
    console.log(`Stored File Path: ${r.storedFilePath}`);
    console.log(`File Name: ${r.originalFileName}`);
    console.log(`Updated At: ${r.updatedAt}`);

    const text = await parseResumeService(r.storedFilePath);
    console.log("\n================ PARSED TEXT (FIRST 1500 CHARACTERS) ================");
    console.log(text.slice(0, 1500));
    console.log("\n================ PROJECTS IN DB ================");
    console.log(JSON.stringify(r.projects, null, 2));

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected");
  }
}

run();
