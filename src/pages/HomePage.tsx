import { useEffect, useState } from "react";
import { Card, Button, ProgressBar, Alert, Spinner, Badge } from "react-bootstrap";
import { House, Activity, Trophy } from "react-bootstrap-icons";
import { useSupabase } from "../contexts/SupabaseContext";
import { Exercise, DailyProgress } from "../types";

interface HomePageProps {
  onNavigate: (page: string) => void;
}

const DAILY_GOALS = {
  pushups: 100,
  situps: 100,
  squats: 100,
} as const;

const EXERCISE_ICONS = {
  pushups: "💪",
  situps: "🔄",
  squats: "🏃",
} as const;

export function HomePage({ onNavigate }: HomePageProps) {
  const { supabase } = useSupabase();
  const [progress, setProgress] = useState<Record<Exercise, number>>({
    pushups: 0,
    situps: 0,
    squats: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [achievedGoals, setAchievedGoals] = useState<Exercise[]>([]);

  useEffect(() => {
    async function fetchProgress() {
      try {
        setLoading(true);
        setError(null);
        const today = new Date().toISOString().split("T")[0];

        const { data, error: supabaseError } = await supabase
          .from("exercise_progress")
          .select("exercise, count")
          .eq("date", today);

        if (supabaseError) throw new Error(supabaseError.message);

        const progressData: Record<Exercise, number> = {
          pushups: 0,
          situps: 0,
          squats: 0,
        };

        data.forEach(({ exercise, count }) => {
          if (exercise in progressData) {
            progressData[exercise as Exercise] = (progressData[exercise as Exercise] || 0) + count;
          }
        });

        // Check achieved goals
        const achieved = Object.entries(progressData)
          .filter(([exercise, count]) => count >= DAILY_GOALS[exercise as Exercise])
          .map(([exercise]) => exercise as Exercise);

        setAchievedGoals(achieved);
        setProgress(progressData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load progress");
        console.error("Error fetching progress:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchProgress();
  }, [supabase]);

  const calculateTotalProgress = () => {
    const total = Object.values(progress).reduce((acc, curr) => acc + curr, 0);
    const maxTotal = Object.values(DAILY_GOALS).reduce((acc, curr) => acc + curr, 0);
    return Math.round((total / maxTotal) * 100);
  };

  const renderExerciseButton = (exercise: Exercise, count: number) => {
    const goal = DAILY_GOALS[exercise];
    const percentage = (count / goal) * 100;
    const isAchieved = count >= goal;

    return (
      <Button
        variant={isAchieved ? "success" : "outline-primary"}
        className="w-100 d-flex justify-content-between align-items-center py-3 position-relative"
        onClick={() => onNavigate(exercise)}
      >
        <div className="d-flex align-items-center gap-2">
          <span>{EXERCISE_ICONS[exercise]}</span>
          <span className="fw-medium text-capitalize">{exercise}</span>
        </div>
        <div className="d-flex align-items-center gap-2">
          <span>{count}/{goal}</span>
          <ProgressBar 
            now={percentage} 
            className="w-25"
            variant={isAchieved ? "success" : undefined}
          />
          {isAchieved && <Trophy className="text-warning position-absolute end-0 top-0 mt-1 me-1" size={16} />}
        </div>
      </Button>
    );
  };

  if (loading) {
    return (
      <div className="container d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="container py-4 mb-5">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="display-4 fw-bold">Arise & Train</h1>
        <p className="text-muted">Track your path to becoming stronger</p>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {/* Daily Progress Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Daily Progress</h5>
            {achievedGoals.length > 0 && (
              <Badge bg="success">
                {achievedGoals.length} Goal{achievedGoals.length > 1 ? 's' : ''} Achieved!
              </Badge>
            )}
          </div>

          <div className="mb-4">
            <div className="d-flex justify-content-between small mb-1">
              <span>Total Progress</span>
              <span>{calculateTotalProgress()}%</span>
            </div>
            <ProgressBar 
              now={calculateTotalProgress()} 
              variant={calculateTotalProgress() === 100 ? "success" : undefined}
            />
          </div>

          {/* Exercise Cards */}
          <div className="row g-3">
            {(Object.entries(progress) as [Exercise, number][]).map(([exercise, count]) => (
              <div className="col-12" key={exercise}>
                {renderExerciseButton(exercise, count)}
              </div>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Navigation */}
      <div className="fixed-bottom bg-light border-top py-3">
        <div className="container d-flex justify-content-around">
          <Button 
            variant="light" 
            size="sm" 
            onClick={() => onNavigate("home")}
            className="d-flex flex-column align-items-center"
          >
            <House size={20} />
            <small>Home</small>
          </Button>
          <Button 
            variant="light" 
            size="sm" 
            onClick={() => onNavigate("analysis")}
            className="d-flex flex-column align-items-center"
          >
            <Activity size={20} />
            <small>Analysis</small>
          </Button>
        </div>
      </div>
    </div>
  );
}