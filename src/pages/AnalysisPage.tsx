import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Badge } from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons";
import format from "date-fns/format";
import { subDays } from "date-fns";
import { useSupabase } from "../contexts/SupabaseContext";

interface DailyProgress {
  date: string;
  pushups: number;
  situps: number;
  squats: number;
  running: number;
}

const DAILY_GOALS: Record<keyof DailyProgress, number> = {
  date: 0, // Not used for goals, just to match structure
  pushups: 100,
  situps: 100,
  squats: 100,
  running: 10,
};

export function AnalysisPage() {
  const { supabase } = useSupabase();
  const [weeklyData, setWeeklyData] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      setError(null);

      const startDate = subDays(new Date(), 6).toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("exercise_progress")
        .select("*")
        .gte("date", startDate)
        .order("date", { ascending: false });

      if (error) {
        setError("Failed to load progress data.");
        console.error("Error fetching progress:", error);
        setLoading(false);
        return;
      }

      // **Ensure the groupedData has correct types**
      const groupedData: Record<string, DailyProgress> = {};

      data.forEach((entry) => {
        const dateKey = entry.date.split("T")[0];

        if (!groupedData[dateKey]) {
          groupedData[dateKey] = {
            date: dateKey,
            pushups: 0,
            situps: 0,
            squats: 0,
            running: 0,
          };
        }

        // **Type-safe way to update exercises**
        const exerciseType = entry.exercise as keyof Omit<DailyProgress, "date">;
        if (exerciseType in groupedData[dateKey]) {
          groupedData[dateKey][exerciseType] += Number(entry.count) || 0;
        }
      });

      // Convert object to array and sort by date (newest first)
      const formattedData = Object.values(groupedData).sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );

      setWeeklyData(formattedData);
      setLoading(false);
    }

    fetchProgress();
  }, [supabase]);

  const isGoalAchieved = (value: number, goal: number) => value >= goal;

  const GoalIndicator = ({ achieved }: { achieved: boolean }) =>
    achieved ? (
      <CheckCircleFill className="text-success" size={20} />
    ) : (
      <XCircleFill className="text-danger" size={20} />
    );

  if (loading) return <p className="text-center mt-4">Loading...</p>;
  if (error) return <p className="text-center text-danger">{error}</p>;

  return (
    <div className="container">
      <div className="text-center my-4">
        <h1 className="fw-bold">Training Analysis</h1>
        <p className="text-muted">Check your performance over the last 7 days</p>
      </div>

      {/* Daily Overview */}
      {weeklyData.map((day) => {
        const allGoalsAchieved = (Object.keys(DAILY_GOALS) as Array<keyof DailyProgress>)
          .filter((key) => key !== "date") // Skip the date property
          .every((exercise) => isGoalAchieved(day[exercise] || 0, DAILY_GOALS[exercise]));

        return (
          <Card key={day.date} className="mb-4">
            <CardBody>
              <CardTitle className="fw-bold">{format(new Date(day.date), "EEEE, dd.MM.yyyy")}</CardTitle>
              <Badge bg={allGoalsAchieved ? "success" : "warning"}>
                {allGoalsAchieved ? "All Goals Achieved!" : "Keep Going!"}
              </Badge>
              <div className="list-group mt-3">
                {(Object.keys(DAILY_GOALS) as Array<keyof DailyProgress>)
                  .filter((key) => key !== "date") // Skip the date property
                  .map((exercise) => (
                    <div key={exercise} className="d-flex justify-content-between py-2 border-bottom">
                      <span className="text-capitalize">{exercise}</span>
                      <span>
                        {day[exercise] || 0}/{DAILY_GOALS[exercise]}
                      </span>
                      <GoalIndicator
                        achieved={isGoalAchieved(day[exercise] || 0, DAILY_GOALS[exercise])}
                      />
                    </div>
                  ))}
              </div>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
