import React, { useState } from 'react';
import { CADModel, Difficulty, FileType } from '../types';
import { saveModel, deleteModel, resetDatabaseToSamples } from '../db/database';
import { ModelPreviewThumbnail } from './ModelPreviewThumbnail';

interface TeacherModelManagerProps {
  models: CADModel[];
  onModelsChanged: () => void;
}

export const TeacherModelManager: React.FC<TeacherModelManagerProps> = ({
  models,
  onModelsChanged,
}) => {
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [difficulty, setDifficulty] = useState<Difficulty>('střední');
  const [description, setDescription] = useState<string>('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [fileType, setFileType] = useState<FileType>('obj');
  const [fileName, setFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'obj') {
      setErrorMsg('Nahrajte 3D soubor .obj exportovaný z programu Fusion 360!');
      return;
    }

    setErrorMsg('');
    setFileName(file.name);
    setName(file.name.replace(/\.[^/.]+$/, ''));
    setFileType('obj');

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = (evt) => {
      if (evt.target?.result) {
        setFileData(evt.target.result as string);
      }
    };
  };

  const handleSaveModel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Zadejte název tělesa.');
      return;
    }
    if (!fileData) {
      setErrorMsg('Nahrajte 3D soubor .obj.');
      return;
    }

    const newModel: CADModel = {
      id: 'custom-' + Date.now(),
      name: name.trim(),
      difficulty,
      description: description.trim() || 'Vlastní CAD model nahrán učitelem.',
      fileType: 'obj',
      fileData,
      isSample: false,
      createdAt: Date.now(),
    };

    await saveModel(newModel);
    setIsUploading(false);
    setName('');
    setDescription('');
    setFileData(null);
    setFileName('');
    onModelsChanged();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Opravdu chcete smazat tento CAD model z lokální databáze?')) {
      await deleteModel(id);
      onModelsChanged();
    }
  };

  const handleReset = async () => {
    if (confirm('Obnovit databázi na 5 základních ukázkových CAD těles? Všechny nahrané soubory budou smazány.')) {
      await resetDatabaseToSamples();
      onModelsChanged();
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center space-x-2">
            <span>📁 Učitelská databáze 3D modelů</span>
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Nahrávání OBJ modelů z Fusion 360 s vizuálním 3D náhledem těles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsUploading(!isUploading)}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center space-x-2"
          >
            <span>{isUploading ? '✕ Zavřít formulář' : '➕ Nahrát nový OBJ model'}</span>
          </button>
        </div>
      </div>

      {/* Upload Form Panel */}
      {isUploading && (
        <form onSubmit={handleSaveModel} className="bg-slate-900 p-6 rounded-2xl border border-cyan-500/40 shadow-2xl space-y-4">
          <h3 className="font-bold text-lg text-cyan-400 border-b border-slate-800 pb-2">
            Nahrání nového 3D CAD modelu (.OBJ z Fusion 360)
          </h3>

          {errorMsg && (
            <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-2 rounded-xl text-xs font-semibold">
              ⚠️ {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* File Upload Box */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                CAD SOUBOR (.OBJ):
              </label>
              <label className="flex flex-col items-center justify-center h-36 border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl cursor-pointer bg-slate-800/50 hover:bg-slate-800 transition-colors text-center p-4">
                <svg className="w-8 h-8 text-cyan-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-semibold text-slate-200">
                  {fileName ? fileName : 'Vyberte nebo přetáhněte soubor .obj z Fusion 360'}
                </span>
                <span className="text-xs text-slate-400 mt-1">Export z Fusion 360</span>
                <input type="file" accept=".obj" onChange={handleFileChange} className="hidden" />
              </label>
            </div>

            {/* Metadata Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  NÁZEV TĚLESA:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Např. Stupňovitý blok s T-drážkou"
                  className="w-full bg-slate-800 text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  OBTÍŽNOST PRO ŽÁKY:
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                  className="w-full bg-slate-800 text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm font-semibold"
                >
                  <option value="lehká">Lehká (Základní prvky, bez skrytých hran)</option>
                  <option value="střední">Střední (Průchozí otvory, zkosení)</option>
                  <option value="těžká">Těžká (Složitá CAD tělesa, T-drážky)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  POPIS PRO VÝUKU:
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Poznámka ke cvičení pro žáky..."
                  rows={2}
                  className="w-full bg-slate-800 text-white px-3.5 py-2 rounded-xl border border-slate-700 focus:outline-none focus:border-cyan-500 text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 border-t border-slate-800 pt-3">
            <button
              type="button"
              onClick={() => setIsUploading(false)}
              className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-700"
            >
              Zrušit
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-cyan-500 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-400"
            >
              💾 Uložit do databáze
            </button>
          </div>
        </form>
      )}

      {/* Database Catalog Cards with 3D Thumbnails */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-white text-base">
            Katalog 3D těles v databázi ({models.length})
          </h3>
          <button
            onClick={handleReset}
            className="text-xs text-rose-400 hover:text-rose-300 font-semibold px-3 py-1 bg-rose-500/10 border border-rose-500/30 rounded-lg transition-colors"
          >
            Obnovit 5 ukázkových těles
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex items-start space-x-4 hover:border-cyan-500/50 transition-all shadow-md"
            >
              <ModelPreviewThumbnail model={model} />

              <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                <div>
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        model.difficulty === 'lehká'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : model.difficulty === 'střední'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {model.difficulty}
                    </span>
                    {model.isSample && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold">
                        Ukázkové
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">
                      {model.fileType.toUpperCase()}
                    </span>
                  </div>

                  <h4 className="font-bold text-white text-sm mt-1.5 truncate" title={model.name}>
                    {model.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {model.description}
                  </p>
                </div>

                <div className="mt-3 flex items-center justify-end">
                  {!model.isSample && (
                    <button
                      onClick={() => handleDelete(model.id)}
                      className="px-3 py-1 bg-slate-800 hover:bg-rose-900/40 text-rose-400 hover:text-rose-200 border border-slate-700 hover:border-rose-700 rounded-lg text-xs font-semibold transition-colors"
                    >
                      Smazat
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
