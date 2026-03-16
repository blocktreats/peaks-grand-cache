export interface Trail {
  slug: string;
  name: string;
  description: string;
  difficulty: "easy" | "moderate" | "hard" | "expert";
  distance_km: number;
  elevation_gain_m: number;
  elevation_high_m: number;
  estimated_hours: number;
  type: "out-and-back" | "loop" | "point-to-point";
  trailhead: [number, number]; // [lng, lat]
  coordinates: [number, number][]; // array of [lng, lat]
  elevation_profile: number[]; // elevation at each coordinate
  tags: string[];
  season: string;
  passport_peak?: boolean;
  passport_tier?: "bronze" | "silver" | "gold";
}

export interface MapLayer {
  id: string;
  name: string;
  icon: string;
  active: boolean;
}

export type DifficultyColor = {
  [key in Trail["difficulty"]]: string;
};

export const DIFFICULTY_COLORS: DifficultyColor = {
  easy: "#10b981",
  moderate: "#3b82f6",
  hard: "#f59e0b",
  expert: "#ef4444",
};

export const REGION_BOUNDS = {
  north: 54.8,
  south: 53.4,
  east: -118.5,
  west: -120.0,
  center: [53.89, -119.13] as [number, number],
};
