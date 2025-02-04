import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { SupabaseProvider } from "./contexts/SupabaseContext.tsx";
import { ExerciseProvider } from "./contexts/ExerciseContext.tsx";

import "./styles/globals.css"; // Dein globales Styling

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <SupabaseProvider>
      <ExerciseProvider>
        <App />
      </ExerciseProvider>
    </SupabaseProvider>
  </React.StrictMode>
);
