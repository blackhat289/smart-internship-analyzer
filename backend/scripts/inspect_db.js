import mongoose from 'mongoose';

const MONGO_URI = "mongodb+srv://Coding:abcd9876@cluster0.osbl6nz.mongodb.net/neww?appName=Cluster0";

const resumeSchema = new mongoose.Schema({}, { strict: false, collection: 'resumes' });
const analysisSchema = new mongoose.Schema({}, { strict: false, collection: 'analyses' });

const Resume = mongoose.model('Resume', resumeSchema);
const Analysis = mongoose.model('Analysis', analysisSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const resumes = await Resume.find({}).sort({ updatedAt: -1 }).limit(1);
    const analyses = await Analysis.find({}).sort({ updatedAt: -1 }).limit(1);

    console.log("\n================ LATEST RESUME ==================");
    if (resumes.length) {
      const r = resumes[0].toObject();
      console.log(`ID: ${r._id}`);
      console.log(`File Name: ${r.originalFileName}`);
      console.log(`Updated At: ${r.updatedAt}`);
      console.log(`Projects:`, JSON.stringify(r.projects, null, 2));
    } else {
      console.log("No resumes found");
    }

    console.log("\n================ LATEST ANALYSIS ================");
    if (analyses.length) {
      const a = analyses[0].toObject();
      console.log(`ID: ${a._id}`);
      console.log(`Role: ${a.selectedRole}`);
      console.log(`Updated At: ${a.updatedAt}`);
      console.log(`Strengths:`, a.strengths);
      console.log(`Weaknesses:`, a.weaknesses);
      console.log(`Project Insights (resumeDerived):`, JSON.stringify(a.projectInsights?.resumeDerived || [], null, 2));
    } else {
      console.log("No analyses found");
    }

  } catch (err) {
    console.error("Error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("\nDisconnected");
  }
}

run();
