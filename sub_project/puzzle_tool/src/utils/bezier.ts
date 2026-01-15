import { Vector2, BezierPoint } from "../types/puzzle";

export const getBezierPoint = (
  p0: Vector2,
  p1: Vector2,
  p2: Vector2,
  p3: Vector2,
  t: number
): Vector2 => {
  const tt = t * t;
  const ttt = t * tt;
  const u = 1.0 - t;
  const uu = u * u;
  const uuu = u * uu;

  return {
    x: uuu * p0.x + 3.0 * uu * t * p1.x + 3.0 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3.0 * uu * t * p1.y + 3.0 * u * tt * p2.y + ttt * p3.y,
  };
};

export const getEdgePath = (points: BezierPoint[], scale: number = 100): string => {
  if (points.length < 2) return "";

  let path = `M ${points[0].position.x * scale} ${points[0].position.y * scale}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];

    const cp1 = {
      x: (p1.position.x + p1.rightControlPoint.x) * scale,
      y: (p1.position.y + p1.rightControlPoint.y) * scale,
    };
    const cp2 = {
      x: (p2.position.x + p2.leftControlPoint.x) * scale,
      y: (p2.position.y + p2.leftControlPoint.y) * scale,
    };
    const end = {
      x: p2.position.x * scale,
      y: p2.position.y * scale,
    };

    path += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
  }

  return path;
};
