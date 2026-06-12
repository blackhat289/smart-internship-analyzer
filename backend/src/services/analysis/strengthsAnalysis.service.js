export async function strengthsAnalysisService(extractedData = {}) {
  return (extractedData.skills || []).slice(0, 5);
}
