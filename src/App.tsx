import { useState } from 'react';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ExercisePage } from './pages/ExercisePage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ExerciseProvider } from './contexts/ExerciseContext';
import { Exercise } from './types';

export interface NavigationProps {
  onNavigate: (page: string) => void;
}

type Page = 'home' | 'analysis' | Exercise;

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const PageRenderer = ({ page }: { page: Page }) => {
    switch (page) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />;
      case 'analysis':
        return <AnalysisPage />;
      case 'pushups':
      case 'situps':
      case 'squats':
        return (
          <ExercisePage 
            exercise={page}
            onNavigate={handleNavigate}
          />
        );
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