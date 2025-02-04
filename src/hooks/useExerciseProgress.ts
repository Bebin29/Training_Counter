import { useLocalStorage } from './useLocalStorage';
import { ExerciseProgress, ExerciseGoals, Exercise } from '../types';

const DEFAULT_GOALS: ExerciseGoals = {
  pushups: 100,
  situps: 100,
  squats: 100
};

export function useExerciseProgress() {
  const [progress, setProgress] = useLocalStorage<ExerciseProgress>('exerciseProgress', {
    pushups: 0,
    situps: 0,
    squats: 0
  });

  const incrementExercise = (exercise: Exercise, amount: number) => {
    setProgress(prev => ({
      ...prev,
      [exercise]: Math.min(prev[exercise] + amount, DEFAULT_GOALS[exercise])
    }));
  };

  const decrementExercise = (exercise: Exercise, amount: number) => {
    setProgress(prev => ({
      ...prev,
      [exercise]: Math.max(prev[exercise] - amount, 0)
    }));
  };

  const resetProgress = () => {
    setProgress({
      pushups: 0,
      situps: 0,
      squats: 0
    });
  };

  return {
    progress,
    goals: DEFAULT_GOALS,
    incrementExercise,
    decrementExercise,
    resetProgress
  };
}