import { calculateReadinessScore } from '../../utils/scoreCalculator.js';

export async function readinessScoreService(payload) {
  return calculateReadinessScore(payload);
}
