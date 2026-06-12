import Roadmap from '../models/Roadmap.js';

export const roadmapRepository = {
  create: (data) => Roadmap.create(data),
  findByAnalysisId: (analysisId) => Roadmap.findOne({ analysisId }),
};
