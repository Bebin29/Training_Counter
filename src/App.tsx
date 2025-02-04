import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ExercisePage } from './pages/ExercisePage';
import { RunningPage } from './pages/RunningPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ExerciseProvider } from './contexts/ExerciseContext'; // ✅ Import ExerciseProvider

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    if (!['home', 'running', 'analysis'].includes(page)) {
      setSelectedExercise(page);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'running':
        return <RunningPage onNavigate={handleNavigate} />;
      case 'analysis':
        return <AnalysisPage />;
      default:
        return selectedExercise ? (
          <ExercisePage 
            exercise={selectedExercise} 
            onNavigate={handleNavigate} 
          />
        ) : (
          <HomePage onNavigate={handleNavigate} />
        );
    }
  };

  return (
    <ExerciseProvider> {/* ✅ Wrap the entire app in ExerciseProvider */}
      <div className="app-container">
        <div className="app-wrapper">
          <Layout currentPage={currentPage} onNavigate={handleNavigate}>
            <main className="main-content">
              {renderPage()}
            </main>
          </Layout>
        </div>
      </div>
    </ExerciseProvider>
  );
}
