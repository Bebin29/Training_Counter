import { createContext, useContext, useState, useCallback } from "react";
import { useSupabase } from "../contexts/SupabaseContext"; // Ensure Supabase is available

// ✅ Declare Exercise Type Here (or import from types.ts)
type Exercise = "pushups" | "situps" | "squats" | "running";

interface ExerciseContextType {
  progress: Record<Exercise, number>;
  goals: Record<Exercise, number>;
  incrementExercise: (exercise: Exercise, amount?: number) => void;
  decrementExercise: (exercise: Exercise, amount?: number) => void;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

export function ExerciseProvider({ children }: { children: React.ReactNode }) {
  const { supabase } = useSupabase(); // Get Supabase instance
  const [progress, setProgress] = useState<Record<Exercise, number>>({
    pushups: 0,
    situps: 0,
    squats: 0,
    running: 0,
  });

  const [goals] = useState<Record<Exercise, number>>({
    pushups: 100,
    situps: 100,
    squats: 100,
    running: 10,
  });

  // ✅ Function to Update Exercise Count in Database
  const updateExerciseCount = async (exercise: Exercise, newCount: number) => {
    const today = new Date().toISOString().split("T")[0]; // Ensure only YYYY-MM-DD format
  
    try {
      // Fetch today's entry
      const { data: existingEntries, error: fetchError } = await supabase
        .from("exercise_progress")
        .select("id, count")
        .eq("exercise", exercise)
        .gte("date", today) // Find any existing entry for today
        .lte("date", today + "T23:59:59.999Z"); // Ensure whole day is included
  
      if (fetchError) {
        console.error("Error fetching existing entry:", fetchError);
        return;
      }
  
      if (existingEntries.length > 0) {
        // If multiple entries exist, pick the latest one
        const latestEntry = existingEntries[existingEntries.length - 1];
  
        // Ensure decrementing does not go negative
        const updatedCount = Math.max(0, newCount);
  
        // ✅ Update the latest row instead of inserting
        const { error: updateError } = await supabase
          .from("exercise_progress")
          .update({ count: updatedCount })
          .eq("id", latestEntry.id);
  
        if (updateError) {
          console.error("Error updating count:", updateError);
        }
      } else {
        // If no entry exists, insert a new one
        const { error: insertError } = await supabase
          .from("exercise_progress")
          .insert([{ exercise, count: newCount, date: today }]);
  
        if (insertError) {
          console.error("Error inserting new entry:", insertError);
        }
      }
    } catch (error) {
      console.error("Unexpected error updating database:", error);
    }
  };

  // ✅ Modify `incrementExercise` to update database
  const incrementExercise = useCallback(async (exercise: Exercise, amount: number = 1) => {
    setProgress((prevProgress) => {
      const newCount = Math.min(goals[exercise], prevProgress[exercise] + amount);
      updateExerciseCount(exercise, newCount);
      return { ...prevProgress, [exercise]: newCount };
    });
  }, [goals]);

  // ✅ Modify `decrementExercise` to update database
  const decrementExercise = useCallback(async (exercise: Exercise, amount: number = 1) => {
    setProgress((prevProgress) => {
      const newCount = Math.max(0, prevProgress[exercise] - amount);
      updateExerciseCount(exercise, newCount);
      return { ...prevProgress, [exercise]: newCount };
    });
  }, []);

  return (
    <ExerciseContext.Provider value={{ progress, goals, incrementExercise, decrementExercise }}>
      {children}
    </ExerciseContext.Provider>
  );
}

// ✅ Custom Hook
export function useExerciseProgress() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error("useExerciseProgress must be used within an ExerciseProvider");
  }
  return context;
}
