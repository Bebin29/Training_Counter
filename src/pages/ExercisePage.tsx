import { useEffect, useState } from "react";
import { Card, Button, ProgressBar } from "react-bootstrap";
import { ArrowLeft } from "react-bootstrap-icons";
import { useSupabase } from "../contexts/SupabaseContext";
import { format } from "path";

interface ExercisePageProps {
  exercise: string;
  onNavigate: (page: string) => void;
}

type Exercise = "pushups" | "situps" | "squats" | "running";

export function ExercisePage({ exercise, onNavigate }: ExercisePageProps) {
  const { supabase } = useSupabase();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exerciseId, setExerciseId] = useState<number | null>(null);

  const DAILY_GOALS: Record<string, number> = {
    pushups: 100,
    situps: 100,
    squats: 100,
  };

  useEffect(() => {
    async function fetchExerciseCount() {
      setLoading(true);
      setError(null);
  
      const today = new Date().toISOString().split("T")[0];
  
      console.log(`Fetching total count for: ${exercise} on ${today}`);
  
      const { data, error } = await supabase
        .from("exercise_progress")
        .select("id, count")
        .eq("exercise", exercise)
        .eq("date", today)
        .limit(1) // ✅ Only fetch the latest entry
        .single();
  
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching count:", error);
        setError("Failed to load exercise count.");
      } else if (!data) {
        console.warn("No data found for today, initializing with zero.");
        setCount(0);
        setExerciseId(null);
      } else {
        console.log(`✅ Fetched total count for ${exercise}:`, data.count);
        setCount(data.count);
        setExerciseId(data.id);
      }
  
      setLoading(false);
    }
  
    fetchExerciseCount();
  }, [supabase, exercise]);

  const updateExerciseCount = async (exercise: Exercise, newCount: number) => {
    const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
  
    console.log(`Updating ${exercise} count on ${today} to ${newCount}`);
  
    try {
      // Check if entry exists for today
      const { data: existingEntry, error: fetchError } = await supabase
        .from("exercise_progress")
        .select("id, count")
        .eq("exercise", exercise)
        .eq("date", today)
        .single();
  
      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("Error fetching existing entry:", fetchError);
        return;
      }
  
      if (existingEntry) {
        // If an entry exists, update it
        const { error: updateError } = await supabase
          .from("exercise_progress")
          .update({ count: newCount })
          .eq("id", existingEntry.id);
  
        if (updateError) {
          console.error("Error updating count:", updateError);
        } else {
          console.log(`Updated ${exercise} count to ${newCount}`);
        }
      } else {
        // If no entry exists, insert a new row
        const { error: insertError } = await supabase
          .from("exercise_progress")
          .insert([{ exercise, count: newCount, date: today }]);
  
        if (insertError) {
          console.error("Error inserting new entry:", insertError);
        } else {
          console.log(`Inserted new entry for ${exercise} with count ${newCount}`);
        }
      }
    } catch (error) {
      console.error("Unexpected error updating database:", error);
    }
  };  
  
  

  async function handleCountChange(amount: number) {
    if (loading) return;
  
    const newCount = Math.max(0, count + amount); // Prevent negative values
    setCount(newCount); // Update UI immediately
  
    console.log(`Updating ${exercise} count to ${newCount} for today.`);
  
    try {
      const today = new Date().toISOString().split("T")[0]; // Format YYYY-MM-DD
  
      // ✅ Fetch ALL existing rows for this exercise on this date
      const { data: existingEntries, error: fetchError } = await supabase
        .from("exercise_progress")
        .select("id, count")
        .eq("exercise", exercise)
        .eq("date", today);
  
      if (fetchError) {
        console.error("Error fetching existing entries:", fetchError);
        setError("Failed to load progress.");
        return;
      }
  
      if (existingEntries.length > 1) {
        console.warn("⚠️ Multiple entries found for today. Merging them...");
  
        // ✅ Sum all counts to get the correct total
        const mergedCount = existingEntries.reduce((sum, entry) => sum + entry.count, 0);
  
        // ✅ Keep only one row, delete the rest
        const primaryId = existingEntries[0].id;
        const idsToDelete = existingEntries.slice(1).map(entry => entry.id);
  
        await supabase
          .from("exercise_progress")
          .delete()
          .in("id", idsToDelete);
  
        console.log(`✅ Merged duplicate rows. Kept ID ${primaryId}, deleted others.`);
  
        // ✅ Now update the remaining row
        await supabase
          .from("exercise_progress")
          .update({ count: newCount })
          .eq("id", primaryId);
  
        console.log(`✅ Updated ${exercise} count to ${newCount}`);
      } else if (existingEntries.length === 1) {
        // ✅ Update the only row that exists
        await supabase
          .from("exercise_progress")
          .update({ count: newCount })
          .eq("id", existingEntries[0].id);
  
        console.log(`✅ Updated ${exercise} count to ${newCount}`);
      } else {
        // ✅ No row exists, insert a new one
        await supabase
          .from("exercise_progress")
          .insert([{ exercise, count: newCount, date: today }]);
  
        console.log(`✅ Inserted new entry for ${exercise} with count ${newCount}`);
      }
    } catch (error) {
      console.error("Unexpected error updating database:", error);
      setError("Failed to save progress.");
    }
  }
  
  
    
  

  const goal = DAILY_GOALS[exercise] || 100;
  const progressPercentage = (count / goal) * 100;

  return (
    <div className="container mt-4">
      <Card className="p-4 shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center">
          <Button
            variant="light"
            size="sm"
            onClick={() => onNavigate("home")}
            className="d-flex align-items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>
        </Card.Header>

        <Card.Body>
          <h2 className="text-center fw-bold text-capitalize">{exercise}</h2>

          <div className="text-center mt-3">
            <span className="display-4 fw-bold">{count}</span>
            <span className="h3 text-muted">/{goal}</span>
          </div>

          <ProgressBar now={progressPercentage} className="mt-3" />

          <div className="row mt-4">
            {/* Single Reps */}
            <div className="col-md-6 text-center">
              <h6 className="fw-bold">Single Reps</h6>
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  onClick={() => handleCountChange(-1)}
                  disabled={count === 0}
                  variant="outline-primary"
                >
                  -1
                </Button>
                <Button
                  onClick={() => handleCountChange(1)}
                  disabled={count === goal}
                  variant="outline-primary"
                >
                  +1
                </Button>
              </div>
            </div>

            {/* Sets of 10 */}
            <div className="col-md-6 text-center">
              <h6 className="fw-bold">Sets of 10</h6>
              <div className="d-flex gap-2 justify-content-center">
                <Button
                  onClick={() => handleCountChange(-10)}
                  disabled={count < 10}
                  variant="outline-primary"
                >
                  -10
                </Button>
                <Button
                  onClick={() => handleCountChange(10)}
                  disabled={count > goal - 10}
                  variant="outline-primary"
                >
                  +10
                </Button>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}
