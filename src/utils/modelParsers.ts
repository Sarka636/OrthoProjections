import * as THREE from 'three';
import { CADModel } from '../types';

/**
 * Normalizes a Three.js geometry by centering it at (0,0,0) and scaling to fit a bounding box.
 */
export function normalizeGeometry(geometry: THREE.BufferGeometry): THREE.BufferGeometry {
  try {
    geometry.computeBoundingBox();
    geometry.center();
    geometry.computeVertexNormals();

    if (geometry.boundingBox) {
      const size = new THREE.Vector3();
      geometry.boundingBox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z);
      if (maxDim > 0 && !isNaN(maxDim) && isFinite(maxDim)) {
        const scaleFactor = 2.4 / maxDim;
        geometry.scale(scaleFactor, scaleFactor, scaleFactor);
      }
    }
  } catch (err) {
    console.warn('Geometry normalization warning:', err);
  }
  return geometry;
}

/**
 * Creates procedural 3D geometries for the 5 built-in sample CAD models.
 */
export function createProceduralGeometry(proceduralId: string): THREE.BufferGeometry {
  switch (proceduralId) {
    case 'l_shape': {
      const shape = new THREE.Shape();
      shape.moveTo(-1, -1);
      shape.lineTo(1, -1);
      shape.lineTo(1, 0);
      shape.lineTo(0, 0);
      shape.lineTo(0, 1);
      shape.lineTo(-1, 1);
      shape.closePath();
      return normalizeGeometry(new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: false }));
    }

    case 'wedge_groove': {
      const shape = new THREE.Shape();
      shape.moveTo(-1.2, -0.8);
      shape.lineTo(1.2, -0.8);
      shape.lineTo(1.2, 0.2);
      shape.lineTo(-1.2, 1.0);
      shape.closePath();
      return normalizeGeometry(new THREE.ExtrudeGeometry(shape, { depth: 1.6, bevelEnabled: false }));
    }

    case 'u_block_hole': {
      const shape = new THREE.Shape();
      shape.moveTo(-1.2, -1.0);
      shape.lineTo(1.2, -1.0);
      shape.lineTo(1.2, 1.0);
      shape.lineTo(0.5, 1.0);
      shape.lineTo(0.5, -0.2);
      shape.lineTo(-0.5, -0.2);
      shape.lineTo(-0.5, 1.0);
      shape.lineTo(-1.2, 1.0);
      shape.closePath();

      const holePath = new THREE.Path();
      holePath.absarc(-0.85, 0.3, 0.25, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
      return normalizeGeometry(new THREE.ExtrudeGeometry(shape, { depth: 1.4, bevelEnabled: false }));
    }

    case 'stepped_pyramid': {
      const shape = new THREE.Shape();
      shape.moveTo(-1.2, -1.0);
      shape.lineTo(1.2, -1.0);
      shape.lineTo(1.2, -0.3);
      shape.lineTo(0.7, -0.3);
      shape.lineTo(0.7, 0.4);
      shape.lineTo(0.2, 1.0);
      shape.lineTo(-0.7, 1.0);
      shape.lineTo(-0.7, -0.3);
      shape.lineTo(-1.2, -0.3);
      shape.closePath();
      return normalizeGeometry(new THREE.ExtrudeGeometry(shape, { depth: 1.5, bevelEnabled: false }));
    }

    case 'fusion_tslot_complex': {
      const shape = new THREE.Shape();
      shape.moveTo(-1.4, -1.0);
      shape.lineTo(1.4, -1.0);
      shape.lineTo(1.4, 0.4);
      shape.lineTo(1.0, 1.0);
      shape.lineTo(0.3, 1.0);
      shape.lineTo(0.3, 0.5);
      shape.lineTo(0.6, 0.5);
      shape.lineTo(0.6, 0.1);
      shape.lineTo(-0.6, 0.1);
      shape.lineTo(-0.6, 0.5);
      shape.lineTo(-0.3, 0.5);
      shape.lineTo(-0.3, 1.0);
      shape.lineTo(-1.4, 1.0);
      shape.closePath();
      return normalizeGeometry(new THREE.ExtrudeGeometry(shape, { depth: 1.8, bevelEnabled: false }));
    }

    default:
      return normalizeGeometry(new THREE.BoxGeometry(2, 1.5, 1));
  }
}

/**
 * Robust STL Buffer Parser for Fusion 360 STL files (Binary & ASCII).
 */
export function parseSTLBuffer(buffer: ArrayBuffer): THREE.BufferGeometry {
  if (!buffer || buffer.byteLength < 84) {
    return normalizeGeometry(new THREE.BoxGeometry(2, 1.5, 1));
  }

  const dataView = new DataView(buffer);
  const isBinary = isSTLBinary(buffer, dataView);

  if (isBinary) {
    return parseBinarySTL(dataView, buffer);
  } else {
    const textDecoder = new TextDecoder('utf-8');
    return parseAsciiSTL(textDecoder.decode(buffer));
  }
}

function isSTLBinary(buffer: ArrayBuffer, dataView: DataView): boolean {
  // Check if header starts with 'solid' ASCII keyword
  const textDecoder = new TextDecoder('utf-8');
  const headerText = textDecoder.decode(buffer.slice(0, 80)).toLowerCase();
  
  if (headerText.startsWith('solid') && !headerText.includes('facet')) {
    // Might be ASCII if facet appears later in first 200 bytes
    const sampleText = textDecoder.decode(buffer.slice(0, Math.min(buffer.byteLength, 500)));
    if (sampleText.includes('facet') && sampleText.includes('outer loop')) {
      return false;
    }
  }
  return true;
}

function parseBinarySTL(dataView: DataView, buffer: ArrayBuffer): THREE.BufferGeometry {
  let faces = dataView.getUint32(80, true);
  const maxPossibleFaces = Math.floor((buffer.byteLength - 84) / 50);

  if (faces > maxPossibleFaces || faces <= 0) {
    faces = maxPossibleFaces;
  }

  const vertices: number[] = [];
  const normals: number[] = [];

  let offset = 84;
  for (let i = 0; i < faces; i++) {
    if (offset + 50 > buffer.byteLength) break;

    const nx = dataView.getFloat32(offset, true);
    const ny = dataView.getFloat32(offset + 4, true);
    const nz = dataView.getFloat32(offset + 8, true);
    offset += 12;

    for (let j = 0; j < 3; j++) {
      const vx = dataView.getFloat32(offset, true);
      const vy = dataView.getFloat32(offset + 4, true);
      const vz = dataView.getFloat32(offset + 8, true);
      offset += 12;

      vertices.push(vx, vy, vz);
      normals.push(nx, ny, nz);
    }
    offset += 2; // Attribute byte count
  }

  const geometry = new THREE.BufferGeometry();
  if (vertices.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  } else {
    return normalizeGeometry(new THREE.BoxGeometry(2, 1.5, 1));
  }
  return normalizeGeometry(geometry);
}

function parseAsciiSTL(text: string): THREE.BufferGeometry {
  const vertices: number[] = [];
  const vertexPattern = /vertex\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/gi;

  let match;
  while ((match = vertexPattern.exec(text)) !== null) {
    vertices.push(parseFloat(match[1]), parseFloat(match[2]), parseFloat(match[3]));
  }

  const geometry = new THREE.BufferGeometry();
  if (vertices.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  } else {
    return normalizeGeometry(new THREE.BoxGeometry(2, 1.5, 1));
  }
  return normalizeGeometry(geometry);
}

/**
 * Parses Wavefront OBJ files.
 */
export function parseOBJString(text: string): THREE.BufferGeometry {
  const positions: number[][] = [];
  const vertices: number[] = [];

  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('v ')) {
      const parts = trimmed.split(/\s+/).slice(1).map(Number);
      positions.push(parts);
    } else if (trimmed.startsWith('f ')) {
      const parts = trimmed.split(/\s+/).slice(1);
      const faceIndices = parts.map((p) => {
        const idx = p.split('/')[0];
        return parseInt(idx, 10) - 1;
      });

      for (let i = 1; i < faceIndices.length - 1; i++) {
        const p1 = positions[faceIndices[0]];
        const p2 = positions[faceIndices[i]];
        const p3 = positions[faceIndices[i + 1]];
        if (p1 && p2 && p3) {
          vertices.push(...p1, ...p2, ...p3);
        }
      }
    }
  }

  const geometry = new THREE.BufferGeometry();
  if (vertices.length > 0) {
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  } else {
    return normalizeGeometry(new THREE.BoxGeometry(2, 1.5, 1));
  }
  return normalizeGeometry(geometry);
}

/**
 * Helper to convert Base64 string back to ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Helper to convert ArrayBuffer to Base64 string for safe DB storage.
 */
export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Loads and returns Three.js BufferGeometry for any CADModel with robust fallbacks.
 */
export function loadGeometryForModel(model: CADModel): THREE.BufferGeometry {
  try {
    if (model.fileType === 'procedural' && model.proceduralId) {
      return createProceduralGeometry(model.proceduralId);
    }

    if (model.fileData) {
      if (model.fileType === 'stl') {
        if (typeof model.fileData === 'string') {
          // If stored as base64 or ascii text
          if (model.fileData.startsWith('data:') || /^[A-Za-z0-9+/=]+$/.test(model.fileData.slice(0, 100))) {
            try {
              const buf = base64ToArrayBuffer(model.fileData);
              return parseSTLBuffer(buf);
            } catch {
              return parseAsciiSTL(model.fileData);
            }
          }
          return parseAsciiSTL(model.fileData);
        } else if (model.fileData instanceof ArrayBuffer) {
          return parseSTLBuffer(model.fileData);
        } else if (typeof model.fileData === 'object' && 'byteLength' in (model.fileData as any)) {
          return parseSTLBuffer(model.fileData as ArrayBuffer);
        }
      } else if (model.fileType === 'obj' && typeof model.fileData === 'string') {
        return parseOBJString(model.fileData);
      }
    }
  } catch (err) {
    console.error('Error loading CAD geometry:', err);
  }

  // Safe fallback to L-shape
  return createProceduralGeometry('l_shape');
}
