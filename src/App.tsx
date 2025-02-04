// App.tsx
import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ExercisePage } from './pages/ExercisePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ExerciseProvider } from './contexts/ExerciseContext';
import { Exercise } from './types';  // Import from existing types file

export interface NavigationProps {
  onNavigate: (page: string) => void;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    
    if (['pushups', 'situps', 'squats'].includes(page)) {
      setSelectedExercise(page as Exercise);
    } else {
      setSelectedExercise(null);
    }
  };

  const PageRenderer = ({ page }: { page: string }) => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'analysis':
        return <AnalysisPage />;
      case 'pushups':
      case 'situps':
      case 'squats':
        if (page as Exercise) {
          return (
            <ExercisePage 
              exercise={page as Exercise}
              onNavigate={handleNavigate}
            />
          );
        }
        return <HomePage onNavigate={handleNavigate} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <ExerciseProvider>
      <div className="app-container">
        <div className="app-wrapper">
          <Layout currentPage={currentPage} onNavigate={handleNavigate}>
            <main className="main-content">
              <PageRenderer page={currentPage} />
            </main>
          </Layout>
        </div>
      </div>
    </ExerciseProvider>
  );
}