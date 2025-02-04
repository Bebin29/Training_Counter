import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, ProgressBar, Spinner, Container, Row, Col, Alert } from "react-bootstrap";
import { ArrowUpCircleFill, ArrowDownCircleFill } from "react-bootstrap-icons";
import { format, subDays } from "date-fns";
import { useSupabase } from "../contexts/SupabaseContext";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

// Verbesserte Typisierung
type Exercise = "pushups" | "situps" | "squats";

interface DailyProgress {
  date: string;
  pushups: number;
  situps: number;
  squats: number;
}

interface ExerciseStats {
  current: number;
  previous: number;
  trend: number;
}

const DAILY_GOALS: Record<Exercise, number> = {
  pushups: 100,
  situps: 100,
  squats: 100,
};

const EXERCISE_COLORS: Record<Exercise, string> = {
  pushups: "#dc3545",
  situps: "#0d6efd",
  squats: "#198754",
};

export function AnalysisPage() {
  const { supabase } = useSupabase();
  const [weeklyData, setWeeklyData] = useState<DailyProgress[]>([]);
  const [prevWeeklyData, setPrevWeeklyData] = useState<DailyProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<Exercise, ExerciseStats>>({
    pushups: { current: 0, previous: 0, trend: 0 },
    situps: { current: 0, previous: 0, trend: 0 },
    squats: { current: 0, previous: 0, trend: 0 },
  });

  // Verbesserte Datenabruf-Funktion mit Error-Handling
  const fetchProgress = async (startDate: string, endDate: string): Promise<DailyProgress[]> => {
    try {
      const { data, error: supabaseError } = await supabase
        .from("exercise_progress")
        .select("*")
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (supabaseError) throw new Error(supabaseError.message);

      return processExerciseData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein unerwarteter Fehler ist aufgetreten");
      return [];
    }
  };

  // Verbesserte Datenverarbeitung
  const processExerciseData = (data: any[]): DailyProgress[] => {
    const groupedData: Record<string, DailyProgress> = {};
    
    data.forEach((entry) => {
      const dateKey = entry.date.split("T")[0];
      
      if (!groupedData[dateKey]) {
        groupedData[dateKey] = {
          date: dateKey,
          pushups: 0,
          situps: 0,
          squats: 0,
        };
      }

      const exerciseType = entry.exercise as Exercise;
      if (exerciseType in groupedData[dateKey]) {
        groupedData[dateKey][exerciseType] += Number(entry.count) || 0;
      }
    });

    return Object.values(groupedData);
  };

  // Berechnung der Statistiken
  const calculateStats = (currentData: DailyProgress[], previousData: DailyProgress[]) => {
    const exercises: Exercise[] = ["pushups", "situps", "squats"];
    
    const newStats: Record<Exercise, ExerciseStats> = {} as Record<Exercise, ExerciseStats>;
    
    exercises.forEach((exercise) => {
      const currentAvg = Math.round(
        currentData.reduce((acc, day) => acc + day[exercise], 0) / currentData.length
      );
      
      const previousAvg = Math.round(
        previousData.reduce((acc, day) => acc + day[exercise], 0) / previousData.length
      );
      
      const trend = previousAvg ? ((currentAvg - previousAvg) / previousAvg) * 100 : 0;
      
      newStats[exercise] = {
        current: currentAvg,
        previous: previousAvg,
        trend,
      };
    });

    setStats(newStats);
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const endDate = new Date().toISOString().split("T")[0];
      const startDateCurrent = subDays(new Date(), 6).toISOString().split("T")[0];
      const startDatePrevious = subDays(new Date(), 13).toISOString().split("T")[0];

      const [currentWeekData, previousWeekData] = await Promise.all([
        fetchProgress(startDateCurrent, endDate),
        fetchProgress(startDatePrevious, startDateCurrent),
      ]);

      setWeeklyData(currentWeekData);
      setPrevWeeklyData(previousWeekData);
      calculateStats(currentWeekData, previousWeekData);
      setLoading(false);
    };

    loadData();
  }, [supabase]);

  const TrendIndicator = ({ trend }: { trend: number }) => {
    if (trend > 0) {
      return <ArrowUpCircleFill className="text-success" size={20} title={`+${trend.toFixed(1)}%`} />;
    }
    if (trend < 0) {
      return <ArrowDownCircleFill className="text-danger" size={20} title={`${trend.toFixed(1)}%`} />;
    }
    return null;
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Lade...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Fehler</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  return (
    <Container>
      <Row className="my-4">
        <Col>
          <h1 className="text-center fw-bold">Training Analysis</h1>
          <p className="text-center text-muted">Überblick der letzten 7 Tage</p>
        </Col>
      </Row>

      {/* Tägliche Übersicht */}
      {weeklyData.map((day) => (
        <Card key={day.date} className="mb-3">
          <CardBody>
            <CardTitle>{format(new Date(day.date), "EEEE, dd.MM.yyyy")}</CardTitle>
            {(Object.keys(DAILY_GOALS) as Exercise[]).map((exercise) => (
              <div key={exercise} className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="text-capitalize">{exercise}</span>
                  <span>{day[exercise]}/{DAILY_GOALS[exercise]}</span>
                </div>
                <ProgressBar
                  now={(day[exercise] / DAILY_GOALS[exercise]) * 100}
                  variant={day[exercise] >= DAILY_GOALS[exercise] ? "success" : "primary"}
                />
              </div>
            ))}
          </CardBody>
        </Card>
      ))}

      {/* Statistik-Karten */}
      <Row className="mb-4">
        {(Object.keys(DAILY_GOALS) as Exercise[]).map((exercise) => (
          <Col key={exercise} md={4}>
            <Card className="h-100">
              <CardBody>
                <CardTitle className="text-capitalize">{exercise}</CardTitle>
                <h3 className="mb-3">{stats[exercise].current}</h3>
                <div className="d-flex justify-content-between align-items-center">
                  <small className="text-muted">Vorwoche: {stats[exercise].previous}</small>
                  <TrendIndicator trend={stats[exercise].trend} />
                </div>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Fortschritts-Chart */}
      <Card className="mb-4">
        <CardBody>
          <CardTitle>Wöchentlicher Verlauf</CardTitle>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), "dd.MM")}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), "dd.MM.yyyy")}
                />
                <Legend />
                {(Object.keys(DAILY_GOALS) as Exercise[]).map((exercise) => (
                  <Line
                    key={exercise}
                    type="monotone"
                    dataKey={exercise}
                    stroke={EXERCISE_COLORS[exercise]}
                    name={exercise}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardBody>
      </Card>
    </Container>
  );
}