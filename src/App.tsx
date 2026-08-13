import React, { useEffect, useState } from 'react';
import { ActiveTab, CADModel } from './types';
import { getAllModels, resetDatabaseToSamples } from './db/database';
import { Navbar } from './components/Navbar';
import { ClassroomPresentation } from './components/ClassroomPresentation';
import { TeacherModelManager } from './components/TeacherModelManager';
import { TheorySection } from './components/TheorySection';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('presentation');
  const [models, setModels] = useState<CADModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadModels = async () => {
    setLoading(true);
    try {
      const data = await getAllModels();
      setModels(data);
    } catch (err) {
      console.error('Failed to load models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleResetSamples = async () => {
    if (confirm('Obnovit 5 ukázkových těles pro výuku?')) {
      const res = await resetDatabaseToSamples();
      setModels(res);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* Header Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        totalModelsCount={models.length}
        onResetSamples={handleResetSamples}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="min-h-[400px] flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-400 font-semibold text-sm">Načítání CAD modelů a lokální databáze...</p>
          </div>
        ) : (
          <>
            {activeTab === 'presentation' && <ClassroomPresentation models={models} />}
            {activeTab === 'teacher' && (
              <TeacherModelManager models={models} onModelsChanged={loadModels} />
            )}
            {activeTab === 'theory' && <TheorySection />}
          </>
        )}
      </main>

      {/* App Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 text-xs py-6 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <span className="font-bold text-slate-200">Pravoúhlé Promítání CAD</span> • Výukový software pro školy a technické obory
          </div>
          <div className="text-slate-400">
            Podpora formátů STL & OBJ z programu Fusion 360 • ČSN EN ISO 128 (1. kvadrant)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
