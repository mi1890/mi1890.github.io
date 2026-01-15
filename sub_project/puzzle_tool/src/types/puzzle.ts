export enum BezierPointMode {
  Free = "Free",
  Continuous = "Continuous",
}

export interface Vector2 {
  x: number;
  y: number;
}

export interface BezierPoint {
  position: Vector2;
  leftControlPoint: Vector2;
  rightControlPoint: Vector2;
  mode: BezierPointMode;
}

export interface Edge {
  id: string;
  name: string;
  points: BezierPoint[];
}

export interface PuzzleConfig {
  rows: number;
  columns: number;
  seed: number;
  edgeConfigs: Edge[];
  selectedEdgeIds?: string[]; // IDs of edges that can be used for puzzle generation
}

export interface PuzzlePieceConfig {
  pieceIndex: number;
  column: number;
  row: number;
  fileName: string;
  normalizedPos: Vector2;
  normalizedPieceSize: Vector2;
  textureUVRect: { x: number; y: number; w: number; h: number };
  anchorMin: Vector2;
  anchorMax: Vector2;
  maskPieceSize: Vector2;
}

export interface GlobalPuzzleConfig {
  puzzleId: string;
  rows: number;
  columns: number;
  maskResolution: number;
  paddingSize: number;
  masks: PuzzlePieceConfig[];
}
