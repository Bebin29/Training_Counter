import { useEffect, useState, useCallback } from "react";
import { Card, Button, ProgressBar, Alert, Spinner } from "react-bootstrap";
import { ArrowLeft, Trophy, ArrowUp, ArrowDown } from "react-bootstrap-icons";
import { useSupabase } from "../contexts/SupabaseContext";
import { Exercise } from "../types";

interface ExercisePageProps {
  exercise: Exercise;
  onNavigate: (page: string) => void;
}

const DAILY_GOALS: Record<Exercise, number> = {
  pushups: 100,
  situps: 100,
  squats: 100,
};

const EXERCISE_EMOJI: Record<Exercise, string> = {
  pushups: "💪",
  situps: "🔄",
  squats: "🏃",
};

const SET_SIZES = [1, 5, 10, 25];

export function ExercisePage({ exercise, onNavigate }: ExercisePageProps) {
  const { supabase } = useSupabase();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exerciseId, setExerciseId] = useState<number | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const fetchExerciseCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const today = new Date().toISOString().split("T")[0];
      const { data, error: fetchError } = await supabase
        .from("exercise_progress")
        .select("id, count")
        .eq("exercise", exercise)
        .eq("date", today);

      if (fetchError) throw new Error(fetchError.message);

      if (!data || data.length === 0) {
        setCount(0);
        setExerciseId(null);
        return;
      }

      const totalCount = data.reduce((sum, entry) => sum + Number(entry.count), 0);
      setCount(totalCount);
      setExerciseId(data[0].id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load exercise count");
      console.error("Error fetching count:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, exercise]);

  useEffect(() => {
    fetchExerciseCount();
  }, [fetchExerciseCount]);

  const handleCountChange = async (amount: number) => {
    if (loading || saving) return;

    const newCount = Math.max(0, Math.min(count + amount, DAILY_GOALS[exercise]));
    if (newCount === count) return;

    try {
      setSaving(true);
      setError(null);
      const today = new Date().toISOString().split("T")[0];

      if (exerciseId) {
        const { error: updateError } = await supabase
          .from("exercise_progress")
          .update({ count: newCount })
          .eq("id", exerciseId);

        if (updateError) throw new Error(updateError.message);
      } else {
        const { error: insertError } = await supabase
          .from("exercise_progress")
          .insert([{ exercise, count: newCount, date: today }]);

        if (insertError) throw new Error(insertError.message);
      }

      setCount(newCount);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      await fetchExerciseCount(); // Refresh data to get new ID if needed
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save progress");
      console.error("Error updating count:", err);
    } finally {
      setSaving(false);
    }
  };

  const goal = DAILY_GOALS[exercise];
  const progressPercentage = (count / goal) * 100;
  const isGoalAchieved = count >= goal;

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <Card className="shadow-sm">
        <Card.Header className="d-flex justify-content-between align-items-center bg-white border-bottom-0">
          <Button
            variant="light"
            onClick={() => onNavigate("home")}
            className="d-flex align-items-center gap-2"
          >
            <ArrowLeft size={16} /> Back
          </Button>
          {saving && <Spinner animation="border" size="sm" />}
        </Card.Header>

        <Card.Body className="text-center">
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {showSuccess && (
            <Alert variant="success" className="position-fixed top-0 start-50 translate-middle-x mt-3">
              Progress saved!
            </Alert>
          )}

          <div className="mb-4">
            <h2 className="display-6 fw-bold text-capitalize mb-0 d-flex align-items-center justify-content-center gap-2">
              {EXERCISE_EMOJI[exercise]} {exercise}
              {isGoalAchieved && <Trophy className="text-warning" size={24} />}
            </h2>
          </div>

          <div className="mb-4">
            <span className="display-4 fw-bold">{count}</span>
            <span className="h3 text-muted">/{goal}</span>
          </div>

          <ProgressBar
            now={progressPercentage}
            variant={isGoalAchieved ? "success" : undefined}
            className="mb-4"
            style={{ height: "1rem" }}
          />

          <div className="row g-4">
            {SET_SIZES.map((size) => (
              <div key={size} className="col-6">
                <Card className="h-100">
                  <Card.Body>
                    <h6 className="fw-bold mb-3">Sets of {size}</h6>
                    <div className="d-flex gap-2 justify-content-center">
                      <Button
                        onClick={() => handleCountChange(-size)}
                        disabled={count < size || saving}
                        variant="outline-primary"
                        className="d-flex align-items-center"
                      >
                        <ArrowDown size={16} />
                        {size}
                      </Button>
                      <Button
                        onClick={() => handleCountChange(size)}
                        disabled={count > goal - size || saving}
                        variant="outline-primary"
                        className="d-flex align-items-center"
                      >
                        <ArrowUp size={16} />
                        {size}
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}