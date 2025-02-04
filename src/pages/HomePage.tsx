import { useEffect, useState } from "react";
import { Card, Button, ProgressBar } from "react-bootstrap";
import { House, Activity, Person } from "react-bootstrap-icons";
import { useSupabase } from "../contexts/SupabaseContext";

export function HomePage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { supabase } = useSupabase();
  const [progress, setProgress] = useState<Record<string, number>>({
    pushups: 0,
    situps: 0,
    squats: 0,
  });
  const [loading, setLoading] = useState(true);
  const DAILY_GOALS = { pushups: 100, situps: 100, squats: 100 };

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("exercise_progress")
        .select("exercise, count")
        .eq("date", today);

      if (error) {
        console.error("Error fetching progress:", error);
      } else {
        // Convert data to progress format
        const progressData: Record<string, number> = { pushups: 0, situps: 0, squats: 0 };
        data.forEach(({ exercise, count }) => {
          progressData[exercise] = count;
        });

        setProgress(progressData);
      }
      setLoading(false);
    }

    fetchProgress();
  }, [supabase]);

  const calculateTotalProgress = () => {
    const total = Object.values(progress).reduce((acc, curr) => acc + curr, 0);
    const maxTotal = Object.values(DAILY_GOALS).reduce((acc, curr) => acc + curr, 0);
    return Math.round((total / maxTotal) * 100);
  };

  return (
    <div className="container py-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="display-4 fw-bold">Arise & Train</h1>
        <p className="text-muted">Track your path to becoming stronger</p>
      </div>

      {/* Daily Progress Card */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <h5 className="fw-bold">Daily Progress</h5>
          <div className="mb-3">
            <div className="d-flex justify-content-between small">
              <span>Total Progress</span>
              <span>{calculateTotalProgress()}%</span>
            </div>
            <ProgressBar now={calculateTotalProgress()} />
          </div>

          {/* Exercise Cards */}
          <div className="row g-3">
            {Object.entries(progress).map(([exercise, count]) => (
              <div className="col-12" key={exercise}>
                <Button
                  variant="outline-primary"
                  className="w-100 d-flex justify-content-between align-items-center py-3"
                  onClick={() => onNavigate(exercise)}
                >
                  <span className="fw-medium text-capitalize">{exercise}</span>
                  <div className="d-flex align-items-center gap-2">
                    <span>{count}/{DAILY_GOALS[exercise as keyof typeof DAILY_GOALS]}</span>
                    <ProgressBar now={(count / DAILY_GOALS[exercise as keyof typeof DAILY_GOALS]) * 100} className="w-25" />
                  </div>
                </Button>
              </div>
            ))}
          </div>

          {/* Running Card */}
          <Button variant="outline-primary" className="w-100 mt-3 py-3" onClick={() => onNavigate("running")}>
            <span className="fw-medium">10K Run</span>
            <span>Start →</span>
          </Button>
        </Card.Body>
      </Card>

      {/* Navigation */}
      <div className="fixed-bottom bg-light border-top py-3">
        <div className="container d-flex justify-content-around">
          <Button variant="light" size="sm" onClick={() => onNavigate("home")}>
            <House size={20} />
          </Button>
          <Button variant="light" size="sm" onClick={() => onNavigate("running")}>
            <Activity size={20} />
          </Button>
          <Button variant="light" size="sm" onClick={() => onNavigate("analysis")}>
            <Person size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
