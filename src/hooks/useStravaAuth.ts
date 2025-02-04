import { useEffect, useState } from "react";

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID;
const STRAVA_CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET;
const STRAVA_REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI;

export function useStravaAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("strava_access_token");
    if (accessToken) {
      setToken(accessToken);
      setIsAuthed(true);
    }
  }, []);

  const handleAuth = () => {
    const authUrl = `https://www.strava.com/oauth/authorize?client_id=${STRAVA_CLIENT_ID}&redirect_uri=${STRAVA_REDIRECT_URI}&response_type=code&scope=activity:write`;
    window.location.href = authUrl;
  };

  const exchangeToken = async (code: string) => {
    try {
      const response = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code,
          grant_type: "authorization_code",
        }),
      });

      const data = await response.json();
      if (data.access_token) {
        localStorage.setItem("strava_access_token", data.access_token);
        setToken(data.access_token);
        setIsAuthed(true);
      }
    } catch (error) {
      console.error("Error exchanging token:", error);
    }
  };

  return { isAuthed, token, handleAuth, exchangeToken };
}
