import React, { useState } from 'react';
import { CADModel, FilterDifficulty, RevealState } from '../types';
import { AxonometryViewer } from './AxonometryViewer';
import { ProjectionCard } from './ProjectionCard';

interface ClassroomPresentationProps {
  models: CADModel[];
}

export const ClassroomPresentation: React.FC<ClassroomPresentationProps> = ({ models }) => {
  const [selectedModelId, setSelectedModelId] = useState<string>(models[0]?.id || '');
  const [difficultyFilter, setDifficultyFilter] = useState<FilterDifficulty>('vse');
  const [reveals, setReveals] = useState<RevealState>({
    front: false,
    top: false,
    side: false,
  });

  const filteredModels = models.filter((m) => {
    if (difficultyFilter === 'vse') return true;
    return m.difficulty === difficultyFilter;
  });

  const selectedModel = models.find((m) => m.id === selectedModelId) || models[0];

  const handleSelectModel = (modelId: string) => {
    setSelectedModelId(modelId);
    setReveals({ front: false, top: false, side: false });
  };

  const handleRandomModel = () => {
    if (filteredModels.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredModels.length);
    handleSelectModel(filteredModels[randomIndex].id);
  };

  const handleRevealAll = () => {
    setReveals({ front: true, top: true, side: true });
  };

  const handleHideAll = () => {
    setReveals({ front: false, top: false, side: false });
  };

  const toggleSingleReveal = (type: keyof RevealState) => {
    setReveals((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  if (!selectedModel) {
    return (
      <div className="p-8 text-center text-slate-400">
        Nenalezeny žádné CAD modely. Vložte modely v záložce Správa modelů.
      </div>
    );
  }

  const isAllRevealed = reveals.front && reveals.top && reveals.side;

  return (
    <div className="space-y-3 max-w-7xl mx-auto">
      {/* Compact Top Bar */}
      <div className="bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">3D Těleso:</span>
          <select
            value={selectedModel.id}
            onChange={(e) => handleSelectModel(e.target.value)}
            className="bg-slate-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none cursor-pointer"
          >
            {filteredModels.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} [{m.difficulty.toUpperCase()}]
              </option>
            ))}
          </select>

          <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 ml-2">
            {(['vse', 'lehká', 'střední', 'těžká'] as FilterDifficulty[]).map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  difficultyFilter === diff
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {diff === 'vse' ? 'Všechny' : diff.charAt(0).toUpperCase() + diff.slice(1)}
              </button>
            ))}
          </div>

          <button
            onClick={handleRandomModel}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-400 font-semibold text-xs rounded-lg transition-all"
          >
            🎲 Náhodné
          </button>
        </div>

        <div className="flex items-center space-x-2">
          {!isAllRevealed ? (
            <button
              onClick={handleRevealAll}
              className="px-4 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-extrabold text-xs rounded-lg shadow hover:brightness-110 active:scale-95 transition-all"
            >
              👁️ Odkrýt všechny 3 průměty
            </button>
          ) : (
            <button
              onClick={handleHideAll}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs rounded-lg transition-all"
            >
              🙈 Skrýt průměty
            </button>
          )}
        </div>
      </div>

      {/* 2x2 Technical Drawing Layout - Fits 1 Screen */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Top-Left: Nárys */}
        <ProjectionCard
          model={selectedModel}
          type="front"
          isRevealed={reveals.front}
          onToggleReveal={() => toggleSingleReveal('front')}
        />

        {/* Top-Right: Bokorys */}
        <ProjectionCard
          model={selectedModel}
          type="side"
          isRevealed={reveals.side}
          onToggleReveal={() => toggleSingleReveal('side')}
        />

        {/* Bottom-Left: Půdorys */}
        <ProjectionCard
          model={selectedModel}
          type="top"
          isRevealed={reveals.top}
          onToggleReveal={() => toggleSingleReveal('top')}
        />

        {/* Bottom-Right: Axonometrický 3D Pohled */}
        <AxonometryViewer model={selectedModel} />
      </div>
    </div>
  );
};
