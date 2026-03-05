import { BezierPoint, Edge, Vector2 } from "../types/puzzle";

export interface PieceEdges {
  top: Edge;
  right: Edge;
  bottom: Edge;
  left: Edge;
}

export const createStraightEdge = (): Edge => ({
  id: 'straight',
  name: 'Straight',
  points: [
    { position: { x: 0, y: 0 }, leftControlPoint: { x: 0, y: 0 }, rightControlPoint: { x: 0, y: 0 }, mode: 'Continuous' as any },
    { position: { x: 1, y: 0 }, leftControlPoint: { x: 0, y: 0 }, rightControlPoint: { x: 0, y: 0 }, mode: 'Continuous' as any },
  ]
});

export const flipEdge = (edge: Edge): Edge => {
  return {
    ...edge,
    points: edge.points.map(p => ({
      ...p,
      position: { x: p.position.x, y: -p.position.y },
      leftControlPoint: { x: p.leftControlPoint.x, y: -p.leftControlPoint.y },
      rightControlPoint: { x: p.rightControlPoint.x, y: -p.rightControlPoint.y },
    }))
  };
};

export const reverseEdge = (edge: Edge): Edge => {
  return {
    ...edge,
    points: [...edge.points].reverse().map(p => ({
      ...p,
      position: { x: 1 - p.position.x, y: -p.position.y },
      leftControlPoint: { x: -p.rightControlPoint.x, y: -p.rightControlPoint.y },
      rightControlPoint: { x: -p.leftControlPoint.x, y: -p.leftControlPoint.y },
    }))
  };
};

// Seeded random number generator
export const mulberry32 = (a: number) => {
  return () => {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
};

export const generatePuzzlePieces = (
  rows: number,
  cols: number,
  seed: number,
  edgeConfigs: Edge[],
  selectedEdgeIds?: string[]
): PieceEdges[][] => {
  const random = mulberry32(seed);
  const pieces: PieceEdges[][] = [];

  // Filter available edges
  const availableEdges = selectedEdgeIds && selectedEdgeIds.length > 0
    ? edgeConfigs.filter(e => selectedEdgeIds.includes(e.id))
    : edgeConfigs;
  
  const getRandEdge = () => availableEdges[Math.floor(random() * availableEdges.length)];

  // 1. Generate horizontal edges (between rows)
  const horizontalEdges: Edge[][] = [];
  for (let r = 0; r <= rows; r++) {
    horizontalEdges[r] = [];
    for (let c = 0; c < cols; c++) {
      if (r === 0 || r === rows) {
        horizontalEdges[r][c] = createStraightEdge();
      } else {
        const baseEdge = getRandEdge();
        horizontalEdges[r][c] = random() > 0.5 ? baseEdge : flipEdge(baseEdge);
      }
    }
  }

  // 2. Generate vertical edges (between columns)
  const verticalEdges: Edge[][] = [];
  for (let r = 0; r < rows; r++) {
    verticalEdges[r] = [];
    for (let c = 0; c <= cols; c++) {
      if (c === 0 || c === cols) {
        verticalEdges[r][c] = createStraightEdge();
      } else {
        const baseEdge = getRandEdge();
        verticalEdges[r][c] = random() > 0.5 ? baseEdge : flipEdge(baseEdge);
      }
    }
  }

  // 3. Assemble pieces
  for (let r = 0; r < rows; r++) {
    pieces[r] = [];
    for (let c = 0; c < cols; c++) {
      pieces[r][c] = {
        top: horizontalEdges[r][c],
        right: verticalEdges[r][c + 1],
        bottom: reverseEdge(horizontalEdges[r + 1][c]),
        left: reverseEdge(verticalEdges[r][c]),
      };
    }
  }

  return pieces;
};

export const getPiecePath = (edges: PieceEdges, pieceSize: number): string => {
  const { top, right, bottom, left } = edges;
  
  const pointsToPath = (edge: Edge, rotation: number, offset: Vector2, isFirst: boolean) => {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    
    const transform = (v: Vector2): Vector2 => ({
      x: (v.x * cos - v.y * sin) * pieceSize + offset.x * pieceSize,
      y: (v.x * sin + v.y * cos) * pieceSize + offset.y * pieceSize,
    });

    let segment = "";
    if (isFirst) {
      const start = transform(edge.points[0].position);
      segment += `M ${start.x} ${start.y}`;
    }

    for (let i = 0; i < edge.points.length - 1; i++) {
      const p1 = edge.points[i];
      const p2 = edge.points[i + 1];

      const cp1 = transform({
        x: p1.position.x + p1.rightControlPoint.x,
        y: p1.position.y + p1.rightControlPoint.y,
      });
      const cp2 = transform({
        x: p2.position.x + p2.leftControlPoint.x,
        y: p2.position.y + p2.leftControlPoint.y,
      });
      const end = transform(p2.position);

      segment += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    }
    return segment;
  };

  let path = "";
  // Top: (0,0) -> (1,0)
  path += pointsToPath(top, 0, { x: 0, y: 0 }, true);
  // Right: (1,0) -> (1,1)
  path += pointsToPath(right, Math.PI / 2, { x: 1, y: 0 }, false);
  // Bottom: (1,1) -> (0,1)
  path += pointsToPath(bottom, Math.PI, { x: 1, y: 1 }, false);
  // Left: (0,1) -> (0,0)
  path += pointsToPath(left, 3 * Math.PI / 2, { x: 0, y: 1 }, false);

  path += " Z";
  return path;
};
