import {
  WasteCategory,
  WasteCategoryLabels,
  PriorityLevel,
  PriorityScoreResult,
} from '@smartwaste360/contracts';

/**
 * Pure function computing explainable priority score & priority level
 */
export function calculatePriorityScore(
  category: WasteCategory,
  reportsCount: number = 1,
  wardName: string = 'Ward 4',
  slaRemainingHours?: number
): PriorityScoreResult {
  const categoryConfig = WasteCategoryLabels[category];
  const factors: PriorityScoreResult['factors'] = [];

  let totalScore = 0;

  // Factor 1: Category Hazard & Base Weight (Max 40 pts)
  let categoryPts = 20;
  if (categoryConfig.isHazardous) {
    categoryPts = 40;
    factors.push({
      factor: 'Waste Hazard Severity',
      weight: 0.4,
      contribution: 40,
      explanation: `${categoryConfig.name} is classified as high-risk hazardous waste.`,
    });
  } else if (category === 'OVERFLOWING_BIN' || category === 'COMMERCIAL_WASTE') {
    categoryPts = 30;
    factors.push({
      factor: 'Waste Accumulation Severity',
      weight: 0.3,
      contribution: 30,
      explanation: `${categoryConfig.name} carries high public health impact.`,
    });
  } else {
    factors.push({
      factor: 'Waste Category Base Severity',
      weight: 0.2,
      contribution: categoryPts,
      explanation: `${categoryConfig.name} base operational priority.`,
    });
  }
  totalScore += categoryPts;

  // Factor 2: Report Clustering Density / Public Concern (Max 30 pts)
  const reportPts = Math.min(30, (reportsCount - 1) * 10 + 10);
  factors.push({
    factor: 'Report Density & Citizen Confirmations',
    weight: 0.3,
    contribution: reportPts,
    explanation: `${reportsCount} citizen report(s) clustered at this location (+${reportPts} pts).`,
  });
  totalScore += reportPts;

  // Factor 3: Location Sensitivity (Max 15 pts)
  const isSensitiveWard = wardName.includes('Ward 4') || wardName.includes('Jagadamba') || wardName.includes('Ward 12');
  const locationPts = isSensitiveWard ? 15 : 5;
  factors.push({
    factor: 'Location & Ward Sensitivity',
    weight: 0.15,
    contribution: locationPts,
    explanation: isSensitiveWard
      ? `Located in high-density commercial/school corridor (${wardName}).`
      : `Standard residential ward area (${wardName}).`,
  });
  totalScore += locationPts;

  // Factor 4: SLA Time Pressure (Max 15 pts)
  if (slaRemainingHours !== undefined) {
    let slaPts = 0;
    if (slaRemainingHours < 1) slaPts = 15;
    else if (slaRemainingHours < 3) slaPts = 10;
    else slaPts = 5;

    factors.push({
      factor: 'SLA Time Remaining',
      weight: 0.15,
      contribution: slaPts,
      explanation: `${slaRemainingHours.toFixed(1)} hours remaining on SLA clock (+${slaPts} pts).`,
    });
    totalScore += slaPts;
  } else {
    totalScore += 5; // default SLA allocation
  }

  // Determine Priority Level
  let priority: PriorityLevel = 'LOW';
  if (totalScore >= 75) priority = 'CRITICAL';
  else if (totalScore >= 55) priority = 'HIGH';
  else if (totalScore >= 35) priority = 'MEDIUM';
  else priority = 'LOW';

  return {
    score: Math.min(100, Math.round(totalScore)),
    priority,
    factors,
    generatedAt: new Date().toISOString(),
  };
}
