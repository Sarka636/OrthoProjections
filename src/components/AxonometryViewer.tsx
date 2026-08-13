import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CADModel } from '../types';
import { loadGeometryForModel } from '../utils/modelParsers';
import { createTechnicalRepresentation } from '../utils/projectionEngine';

interface AxonometryViewerProps {
  model: CADModel;
}

export const AxonometryViewer: React.FC<AxonometryViewerProps> = ({ model }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const controlsRef = useRef<OrbitControls | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight || 220;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a);

    const grid = new THREE.GridHelper(6, 12, 0x334155, 0x1e293b);
    grid.position.y = -1.2;
    scene.add(grid);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(3, 2.8, 3.2);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight2.position.set(-5, -2, -5);
    scene.add(dirLight2);

    const geometry = loadGeometryForModel(model);
    const techGroup = createTechnicalRepresentation(geometry, 'combined');
    scene.add(techGroup);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = isRotating;
    controls.autoRotateSpeed = 2.0;
    controlsRef.current = controls;

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 220;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      controls.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
    };
  }, [model]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  return (
    <div className="relative w-full h-[230px] bg-slate-900 rounded-xl border border-slate-800 overflow-hidden shadow-lg flex flex-col">
      {/* Header Bar */}
      <div className="absolute top-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-2.5 py-1 rounded-lg border border-slate-700/80 text-[11px] font-bold text-cyan-400 flex items-center space-x-1.5 pointer-events-auto">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
          <span>Axonometrický 3D pohled</span>
        </div>
      </div>

      {/* 3D Canvas Mount Point */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Bottom Controls */}
      <div className="absolute bottom-2 left-2 right-2 z-10 flex items-center justify-between pointer-events-none">
        <span className="text-[10px] text-slate-400 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded pointer-events-auto">
          💡 Otáčejte myší
        </span>
        <button
          onClick={() => setIsRotating(!isRotating)}
          className="pointer-events-auto px-2 py-0.5 rounded-lg text-[10px] font-medium bg-slate-800 border border-slate-700 text-cyan-400 hover:bg-slate-700"
        >
          {isRotating ? '⏸ Pozastavit' : '🔄 Rotovat'}
        </button>
      </div>
    </div>
  );
};
