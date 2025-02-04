import { useState, useEffect } from "react";
import { Card, Button, Form } from "react-bootstrap";
import { ArrowLeft, PinMap, Activity } from "react-bootstrap-icons";
import { useStravaAuth } from "../hooks/useStravaAuth";

interface RunningPageProps {
  onNavigate: (page: string) => void;
}

export function RunningPage({ onNavigate }: RunningPageProps) {
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");
  const [isTracking, setIsTracking] = useState(false);
  const { isAuthed, token, handleAuth, exchangeToken } = useStravaAuth();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");
    if (code) {
      exchangeToken(code);
    }
  }, []);

  const handleStartRun = () => {
    setIsTracking(true);
  };

  const handleStopRun = async () => {
    setIsTracking(false);
    if (isAuthed && token) {
      try {
        const response = await fetch("https://www.strava.com/api/v3/activities", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: "10K Training Run",
            type: "Run",
            start_date_local: new Date().toISOString(),
            elapsed_time: parseInt(duration) * 60,
            distance: parseFloat(distance) * 1000,
            description: "Uploaded via Shadow Gains",
          }),
        });

        if (response.ok) {
          alert("Run uploaded to Strava successfully!");
          setDistance("");
          setDuration("");
        }
      } catch (error) {
        console.error("Error uploading to Strava:", error);
      }
    }
  };

  return (
    <Card className="shadow-sm">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Button variant="light" size="sm" onClick={() => onNavigate("home")}>
          <ArrowLeft size={16} /> Back
        </Button>
      </Card.Header>

      <Card.Body>
        <h2 className="text-center mb-4">10K Run Tracker</h2>

        {!isAuthed ? (
          <div className="text-center">
            <Button onClick={handleAuth} className="d-flex align-items-center gap-2 mx-auto">
              <Activity size={18} />
              Connect with Strava
            </Button>
          </div>
        ) : (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Distance (km)</Form.Label>
              <Form.Control
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance in km"
                disabled={isTracking}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration (minutes)</Form.Label>
              <Form.Control
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Enter duration in minutes"
                disabled={isTracking}
              />
            </Form.Group>

            <div className="text-center">
              {!isTracking ? (
                <Button onClick={handleStartRun} className="d-flex align-items-center gap-2" disabled={!distance || !duration}>
                  <PinMap size={18} />
                  Start Run
                </Button>
              ) : (
                <Button onClick={handleStopRun} variant="danger" className="d-flex align-items-center gap-2">
                  <PinMap size={18} />
                  Stop Run
                </Button>
              )}
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
