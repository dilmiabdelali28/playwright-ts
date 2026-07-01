export type MissionAgProps = {
  type: string;
  specificity?: string;
  defaultAllocationKey?: string;
  buildingName: string;
};

export type MissionAgLocation = {
  locationType?: string;
  locationName?: string;
  address?: string;
  address2?: string;
  city?: string;
  zipcode: string;
};

export type MissionAgResolutionUpdate = {
  number: string;
  addPdf?: string;
  currentBudgetCalRecurrence?: string;
};

export type MissionAgVoteConfig = {
  resolutionsCount: number;
  coownersCount: number;
  coownersPresent: number;
  resolutionsToBeVoted: number[];
};

export type AttendanceCounterExpectation = {
  presentCoOwnersCount: string;
  presentCoOwnersPercentage: string;
  vpcCoOwnersCount: string;
  vpcCoOwnersPercentage: string;
  totalCoOwnersCount: string;
  totalCoOwnersPercentage: string;
};

export type ResolutionRow = {
  number: string;
  type: string;
  label: string;
};

export type AccountingExercise = {
  openingDate: string;
  closingDate: string;
};

export type AgResolutionsResponse = {
  resolutions: { label: string }[];
};
