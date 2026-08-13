import React from 'react';

export const TheorySection: React.FC = () => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
          📖 Teorie Pravoúhlého Promítání (ČSN EN ISO 128)
        </h2>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl">
          Pravoúhlé promítání na tři navzájem kolmé průmětny (Evropské promítání – 1. kvadrant / ISO E) je základním jazykem technického kreslení pro zobrazení 3D CAD těles do 2D výkresové roviny.
        </p>
      </div>

      {/* Grid of Principles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nárys Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center">
            V1
          </div>
          <h3 className="font-bold text-white text-lg">1. Nárys (Přední pohled)</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Hlavní pohled zepředu na svislou průmětnu (nárysnu). Zachycuje charakteristický tvar tělesa, jeho šířku (osa X) a výšku (osa Z).
          </p>
        </div>

        {/* Půdorys Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center">
            V2
          </div>
          <h3 className="font-bold text-white text-lg">2. Půdorys (Horní pohled)</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Pohled shora na vodorovnou průmětnu (půdorysnu). Po sklopení o 90° se na výkrese umístí <strong>přesně pod Nárys</strong>. Zobrazuje šířku (osa X) a hloubku (osa Y).
          </p>
        </div>

        {/* Bokorys Card */}
        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg space-y-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 font-bold flex items-center justify-center">
            V3
          </div>
          <h3 className="font-bold text-white text-lg">3. Bokorys (Boční pohled)</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Pohled zleva na boční průmětnu (bokorysnu). Po sklopení o 90° se na výkrese umístí <strong>vpravo od Nárysu</strong>. Zobrazuje hloubku (osa Y) a výšku (osa Z).
          </p>
        </div>
      </div>

      {/* Rules & Standards Table */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-lg font-bold text-white">✏️ Použití čar podle normy ČSN EN ISO 128</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-cyan-400 uppercase font-bold">
                <th className="py-3 px-4">Druh čáry</th>
                <th className="py-3 px-4">Vzhled čáry</th>
                <th className="py-3 px-4">Použití na výkrese</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-white">Tlustá plná čára</td>
                <td className="py-3 px-4">
                  <div className="w-32 h-1 bg-slate-100 rounded"></div>
                </td>
                <td className="py-3 px-4">Viditelné obrysy a hrany tělesa.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Tenká čárkovaná čára</td>
                <td className="py-3 px-4">
                  <div className="w-32 border-b-2 border-dashed border-slate-400"></div>
                </td>
                <td className="py-3 px-4">Skryté obrysy, hrany a vnitřní otvory tělesa.</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">Tenká čerchovaná čára</td>
                <td className="py-3 px-4 font-mono text-cyan-400 text-sm">
                  — • — • — • —
                </td>
                <td className="py-3 px-4">Osy souměrnosti těles a středy valcových otvorů.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
