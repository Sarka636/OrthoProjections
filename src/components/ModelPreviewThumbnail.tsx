import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CADModel } from '../types';
import { loadGeometryForModel } from '../utils/modelParsers';
import { createTechnicalRepresentation } from '../utils/projectionEngine';

interface ModelPreviewThumbnailProps {
  model: CADModel;
}

export const ModelPreviewThumbnail: React.FC<ModelPreviewThumbnailProps> = ({ model }) => {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 120;
    const height = container.clientHeight || 120;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0f172a); // Slate-900

    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(3, 2.5, 3.2);
    camera.lookAt(0, 0, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(5, 8, 5);
    scene.add(dirLight);

    const geometry = loadGeometryForModel(model);
    const techGroup = createTechnicalRepresentation(geometry, 'combined');
    scene.add(techGroup);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    renderer.render(scene, camera);

    return () => {
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
    };
  }, [model]);

  return (
    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 shadow-md">
      <div ref={mountRef} className="w-full h-full" />
    </div>
  );
};
