export type Difficulty = 'lehká' | 'střední' | 'těžká';

export type FileType = 'stl' | 'obj' | 'procedural';

export type ProjectionType = 'front' | 'top' | 'side';

export type DisplayMode = 'shaded' | 'edges' | 'combined';

export interface CADModel {
  id: string;
  name: string;
  difficulty: Difficulty;
  description: string;
  fileType: FileType;
  fileData?: ArrayBuffer | string; // STL binary/text or OBJ text content
  proceduralId?: string; // For built-in procedural geometries
  isSample: boolean;
  createdAt: number;
}

export interface RevealState {
  front: boolean; // Nárys
  top: boolean;   // Půdorys
  side: boolean;  // Bokorys
}

export type FilterDifficulty = 'vse' | 'lehká' | 'střední' | 'těžká';

export type ActiveTab = 'presentation' | 'teacher' | 'theory';
