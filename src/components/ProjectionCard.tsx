import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { CADModel, ProjectionType } from '../types';
import { loadGeometryForModel } from '../utils/modelParsers';
import { getProjectionConfig, createTechnicalRepresentation } from '../utils/projectionEngine';

interface ProjectionCardProps {
  model: CADModel;
  type: ProjectionType;
  isRevealed: boolean;
  onToggleReveal: () => void;
}

export const ProjectionCard: React.FC<ProjectionCardProps> = ({
  model,
  type,
  isRevealed,
  onToggleReveal,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [showAxes, setShowAxes] = useState<boolean>(true);
  const config = getProjectionConfig(type);

  useEffect(() => {
    if (!isRevealed) return;

    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 180;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    const grid = new THREE.GridHelper(5, 10, 0xcbd5e1, 0xf1f5f9);
    grid.rotation.x = type === 'top' ? 0 : Math.PI / 2;
    scene.add(grid);

    if (showAxes) {
      const axesHelper = new THREE.AxesHelper(1.4);
      scene.add(axesHelper);
    }

    const frustumSize = 3.6;
    const aspect = width / height;
    const camera = new THREE.OrthographicCamera(
      (frustumSize * aspect) / -2,
      (frustumSize * aspect) / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      100
    );

    camera.position.copy(config.cameraPosition);
    camera.up.copy(config.cameraUp);
    camera.lookAt(config.lookAt);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const geometry = loadGeometryForModel(model);
    const techGroup = createTechnicalRepresentation(geometry, 'combined');
    scene.add(techGroup);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    renderer.render(scene, camera);

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 180;
      const newAspect = w / h;
      camera.left = (-frustumSize * newAspect) / 2;
      camera.right = (frustumSize * newAspect) / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
    };
  }, [model, type, isRevealed, showAxes]);

  return (
    <div className="relative bg-white rounded-xl border-2 border-slate-300 shadow-md overflow-hidden flex flex-col h-[230px]">
      {/* Header Badge */}
      <div className="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between z-10">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-600"></span>
          <span className="font-bold text-slate-800 text-xs">{config.title}</span>
          <span className="text-[10px] text-slate-500 font-mono">({config.code})</span>
        </div>

        {isRevealed && (
          <div className="flex items-center space-x-1.5">
            <button
              onClick={() => setShowAxes(!showAxes)}
              className={`px-1.5 py-0.5 rounded text-[10px] font-medium border transition-colors ${
                showAxes
                  ? 'bg-cyan-100 text-cyan-800 border-cyan-300'
                  : 'bg-slate-200 text-slate-600 border-slate-300'
              }`}
            >
              {showAxes ? 'Osy' : 'Bez os'}
            </button>
            <button
              onClick={onToggleReveal}
              className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded transition-colors"
            >
              🙈 Skrýt
            </button>
          </div>
        )}
      </div>

      {/* Main Content / Reveal Overlay */}
      <div className="relative flex-1 w-full bg-slate-50 flex items-center justify-center">
        {isRevealed ? (
          <div ref={mountRef} className="w-full h-full" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-slate-900 flex flex-col items-center justify-center p-3 text-center z-20">
            <h3 className="text-white font-bold text-sm mb-1">{config.title} je skryt</h3>
            <p className="text-slate-400 text-[11px] max-w-xs mb-2.5">{config.description}</p>
            <button
              onClick={onToggleReveal}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all"
            >
              👁️ Odkrýt {config.title}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
