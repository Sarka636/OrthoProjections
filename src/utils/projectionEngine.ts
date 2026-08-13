import * as THREE from 'three';
import { ProjectionType } from '../types';

export interface ViewportConfig {
  cameraPosition: THREE.Vector3;
  cameraUp: THREE.Vector3;
  lookAt: THREE.Vector3;
  title: string;
  code: string;
  description: string;
}

/**
 * Returns configuration for Orthographic Camera based on projection type (European 1st Angle ISO E).
 */
export function getProjectionConfig(type: ProjectionType): ViewportConfig {
  switch (type) {
    case 'front':
      return {
        cameraPosition: new THREE.Vector3(0, 0, 5),
        cameraUp: new THREE.Vector3(0, 1, 0),
        lookAt: new THREE.Vector3(0, 0, 0),
        title: 'Nárys',
        code: 'Přední pohled (V1)',
        description: 'Pohled zepředu na hlavní nárysnu v rovině X-Y',
      };
    case 'top':
      return {
        cameraPosition: new THREE.Vector3(0, 5, 0),
        cameraUp: new THREE.Vector3(0, 0, -1),
        lookAt: new THREE.Vector3(0, 0, 0),
        title: 'Půdorys',
        code: 'Horní pohled (V2)',
        description: 'Pohled shora na půdorysnu po sklopení pod Nárys',
      };
    case 'side':
      return {
        cameraPosition: new THREE.Vector3(5, 0, 0),
        cameraUp: new THREE.Vector3(0, 1, 0),
        lookAt: new THREE.Vector3(0, 0, 0),
        title: 'Bokorys',
        code: 'Boční pohled zleva (V3)',
        description: 'Pohled zlevo-prava sklopený vpravo od Nárysu',
      };
  }
}

/**
 * Creates technical 3D object representation with shaded mesh + sharp technical lines + wireframe.
 */
export function createTechnicalRepresentation(
  geometry: THREE.BufferGeometry,
  displayMode: 'shaded' | 'edges' | 'combined' = 'combined'
): THREE.Group {
  const group = new THREE.Group();

  // 1. Shaded CAD Solid Mesh
  const solidMaterial = new THREE.MeshPhongMaterial({
    color: 0x38bdf8, // Cyan CAD shade
    emissive: 0x0369a1,
    emissiveIntensity: 0.15,
    specular: 0xffffff,
    shininess: 40,
    flatShading: true,
    transparent: true,
    opacity: displayMode === 'edges' ? 0.05 : displayMode === 'combined' ? 0.85 : 1.0,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, solidMaterial);
  group.add(mesh);

  // 2. Visible Edges (Plná tlustá čára - ČSN EN ISO 128)
  const edgesGeometry = new THREE.EdgesGeometry(geometry, 25);
  const edgesMaterial = new THREE.LineBasicMaterial({
    color: 0x0f172a, // Dark Navy / Black line
    linewidth: 2,
  });
  const lineSegments = new THREE.LineSegments(edgesGeometry, edgesMaterial);
  group.add(lineSegments);

  // 3. Hidden Edges (Čárkovaná tenká čára pro skryté obrysy)
  const hiddenMaterial = new THREE.LineDashedMaterial({
    color: 0x64748b, // Slate gray
    linewidth: 1,
    scale: 1,
    dashSize: 0.1,
    gapSize: 0.06,
  });
  const hiddenWireframe = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    hiddenMaterial
  );
  hiddenWireframe.computeLineDistances();
  hiddenWireframe.visible = displayMode !== 'shaded';
  group.add(hiddenWireframe);

  return group;
}
