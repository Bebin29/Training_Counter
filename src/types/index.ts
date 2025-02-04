export type Exercise = 'pushups' | 'situps' | 'squats';

export interface ExerciseProgress {
  pushups: number;
  situps: number;
  squats: number;
}

export interface ExerciseGoals {
  pushups: number;
  situps: number;
  squats: number;
}

export interface RunningActivity {
  distance: number;
  duration: number;
  date: string;
}

export interface UserProfile {
  name: string;
  level: number;
  totalWorkouts: number;
  stravaConnected: boolean;
}

export interface DailyProgress {
  date: Date;
  pushups: number;
  situps: number;
  squats: number;
  running: number;
}

export interface DailyGoals {
  pushups: number;
  situps: number;
  squats: number;
  running: number;
}