import Recommendation from '../models/Recommendation.js';

export const recommendationRepository = {
  create: (data) => Recommendation.create(data),
  findByAnalysisId: (analysisId) => Recommendation.findOne({ analysisId }),
};
