import { ApiResponse } from '../utils/ApiResponse.js';
import { internshipRecommendationService } from '../services/recommendation/internshipRecommendation.service.js';

export async function generateRecommendation(req, res, next) {
  try {
    const targetRole = req.query.role || req.body.targetRole || 'Backend';
    const data = await internshipRecommendationService(targetRole);
    res.json(new ApiResponse(200, 'Recommendations generated successfully', { internships: data }));
  } catch (error) {
    next(error);
  }
}
