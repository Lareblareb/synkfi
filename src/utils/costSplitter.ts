export const calculateCostPerPerson = (
  venueCost: number,
  participants: number
): number => {
  if (participants <= 0 || venueCost <= 0) return 0;
  return Math.ceil((venueCost / participants) * 100) / 100;
};

export const formatCostSplit = (
  venueCost: number,
  participants: number
): { costPerPerson: number; totalCost: number; participantCount: number } => {
  const costPerPerson = calculateCostPerPerson(venueCost, participants);
  return {
    costPerPerson,
    totalCost: venueCost,
    participantCount: participants,
  };
};
