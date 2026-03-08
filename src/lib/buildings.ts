// Fixed building list for the apartment complex
export const BUILDINGS = [
  "101동", "102동", "103동", "104동", "105동",
  "106동", "107동", "108동", "109동", "110동",
] as const;

export type BuildingNumber = typeof BUILDINGS[number];
