import mongoose from 'mongoose';
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

    const allResumes = await Resume.find({});
    console.log(`Total resumes in DB: ${allResumes.length}`);

    const allAnalyses = await Analysis.find({});
    console.log(`Total analyses in DB: ${allAnalyses.length}`);

    // Group resumes by userId
    const resumeGroups = {};
    for (const r of allResumes) {
      const uid = String(r.userId);
      if (!resumeGroups[uid]) resumeGroups[uid] = [];
      resumeGroups[uid].push(r);
    }

    // Clean up duplicate resumes
    for (const [uid, group] of Object.entries(resumeGroups)) {
      if (group.length > 1) {
        console.log(`Found ${group.length} resumes for user ${uid}. Keeping the newest one...`);
        // Sort by updatedAt descending
        group.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const keep = group[0];
        const deleteIds = group.slice(1).map(r => r._id);
        const delResult = await Resume.deleteMany({ _id: { $in: deleteIds } });
        console.log(`Deleted ${delResult.deletedCount} duplicate resumes for user ${uid}. Kept: ${keep._id}`);
      }
    }

    // Group analyses by userId
    const analysisGroups = {};
    for (const a of allAnalyses) {
      const uid = String(a.userId);
      if (!analysisGroups[uid]) analysisGroups[uid] = [];
      analysisGroups[uid].push(a);
    }

    // Clean up duplicate analyses
    for (const [uid, group] of Object.entries(analysisGroups)) {
      if (group.length > 1) {
        console.log(`Found ${group.length} analyses for user ${uid}. Keeping the newest one...`);
        group.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        const keep = group[0];
        const deleteIds = group.slice(1).map(a => a._id);
        const delResult = await Analysis.deleteMany({ _id: { $in: deleteIds } });
        console.log(`Deleted ${delResult.deletedCount} duplicate analyses for user ${uid}. Kept: ${keep._id}`);
      }
    }

    console.log("Database cleanup finished!");

  } catch (err) {
    console.error("Error during database cleanup:", err);
  } finally {
    await mongoose.disconnect();
  }
}

run();
