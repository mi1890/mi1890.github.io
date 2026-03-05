import JSZip from 'jszip';
import { PuzzleConfig, PuzzlePieceConfig, GlobalPuzzleConfig, Vector2 } from '../types/puzzle';
import { generatePuzzlePieces, PieceEdges } from './puzzleGenerator';
import { Edge, BezierPoint } from '../types/puzzle';

const svgToPng = async (svgContent: string, width: number, height: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to create PNG blob'));
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into image'));
    };

    img.src = url;
  });
};

function getBezierPoint(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, t: number): Vector2 {
  const u = 1 - t;
  const uu = u * u;
  const uuu = uu * u;
  const tt = t * t;
  const ttt = tt * t;
  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

/**
 * Collects all edges of a polygon in order: top, right, bottom, left.
 * Each edge's points are transformed to the piece-local coordinate system
 * where the piece center is at (0.5, 0.5) — matching Unity's Polygon layout.
 *
 * In Unity, point.Position is relative to piece center (~-0.5 to 0.5).
 * In the web generator, edges use rotation transforms from a (0,0)->(1,0) base.
 * We need to convert web edges into the same coordinate space as Unity.
 */
function getPolygonEdges(piece: PieceEdges): { points: BezierPoint[] }[] {
  const edges: { points: BezierPoint[] }[] = [];
  const sideConfigs: { edge: Edge; rotation: number; offset: Vector2 }[] = [
    { edge: piece.top,    rotation: 0,                 offset: { x: 0, y: 0 } },
    { edge: piece.right,  rotation: Math.PI / 2,       offset: { x: 1, y: 0 } },
    { edge: piece.bottom, rotation: Math.PI,            offset: { x: 1, y: 1 } },
    { edge: piece.left,   rotation: 3 * Math.PI / 2,   offset: { x: 0, y: 1 } },
  ];

  for (const { edge, rotation, offset } of sideConfigs) {
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);

    const transform = (v: Vector2): Vector2 => ({
      x: (v.x * cos - v.y * sin) + offset.x,
      y: (v.x * sin + v.y * cos) + offset.y,
    });

    const transformedPoints: BezierPoint[] = edge.points.map(p => {
      const pos = transform(p.position);
      const posForCp = { x: p.position.x, y: p.position.y };
      const rightCpWorld = transform({
        x: posForCp.x + p.rightControlPoint.x,
        y: posForCp.y + p.rightControlPoint.y,
      });
      const leftCpWorld = transform({
        x: posForCp.x + p.leftControlPoint.x,
        y: posForCp.y + p.leftControlPoint.y,
      });

      return {
        position: { x: pos.x - 0.5, y: pos.y - 0.5 },
        rightControlPoint: { x: rightCpWorld.x - pos.x, y: rightCpWorld.y - pos.y },
        leftControlPoint: { x: leftCpWorld.x - pos.x, y: leftCpWorld.y - pos.y },
        mode: p.mode,
      };
    });

    edges.push({ points: transformedPoints });
  }

  return edges;
}

/**
 * Sample bezier curves to compute the precise bounding box (matching Unity's approach).
 */
function computeBoundingBox(
  polygonEdges: { points: BezierPoint[] }[],
  pointsPerEdge: number
): { min: Vector2; max: Vector2 } {
  let minX = Infinity, minY = Infinity;
  let maxX = -Infinity, maxY = -Infinity;

  for (const edge of polygonEdges) {
    for (let seg = 0; seg < edge.points.length - 1; seg++) {
      const p0 = edge.points[seg];
      const p1 = edge.points[seg + 1];
      const samplesThisSegment = Math.floor(pointsPerEdge / (edge.points.length - 1));

      for (let s = 0; s <= samplesThisSegment; s++) {
        const t = s / samplesThisSegment;
        const pt = getBezierPoint(
          p0.position,
          { x: p0.position.x + p0.rightControlPoint.x, y: p0.position.y + p0.rightControlPoint.y },
          { x: p1.position.x + p1.leftControlPoint.x, y: p1.position.y + p1.leftControlPoint.y },
          p1.position,
          t
        );
        minX = Math.min(minX, pt.x);
        minY = Math.min(minY, pt.y);
        maxX = Math.max(maxX, pt.x);
        maxY = Math.max(maxY, pt.y);
      }
    }
  }

  return { min: { x: minX, y: minY }, max: { x: maxX, y: maxY } };
}

/**
 * Build SVG path data from polygon edges, matching Unity's ExportMaskSVGs logic:
 *   pos = point.Position - min;  pos.y = size.y - pos.y;  (flip Y)
 *   control points: (cp.x, -cp.y) relative to the transformed position
 */
function buildSvgPath(
  polygonEdges: { points: BezierPoint[] }[],
  min: Vector2,
  size: Vector2
): string {
  let path = '';

  for (let edgeIndex = 0; edgeIndex < polygonEdges.length; edgeIndex++) {
    const edge = polygonEdges[edgeIndex];

    for (let pointIndex = 0; pointIndex < edge.points.length; pointIndex++) {
      const point = edge.points[pointIndex];
      const posX = point.position.x - min.x;
      const posY = size.y - (point.position.y - min.y);

      if (edgeIndex === 0 && pointIndex === 0) {
        path += `M ${posX.toFixed(4)} ${posY.toFixed(4)} `;
      } else if (pointIndex === 0) {
        path += `L ${posX.toFixed(4)} ${posY.toFixed(4)} `;
      }

      if (pointIndex < edge.points.length - 1) {
        const nextPoint = edge.points[pointIndex + 1];

        const rightControlX = posX + point.rightControlPoint.x;
        const rightControlY = posY + (-point.rightControlPoint.y);

        const nextPosX = nextPoint.position.x - min.x;
        const nextPosY = size.y - (nextPoint.position.y - min.y);

        const leftControlX = nextPosX + nextPoint.leftControlPoint.x;
        const leftControlY = nextPosY + (-nextPoint.leftControlPoint.y);

        path += `C ${rightControlX.toFixed(4)} ${rightControlY.toFixed(4)}, ${leftControlX.toFixed(4)} ${leftControlY.toFixed(4)}, ${nextPosX.toFixed(4)} ${nextPosY.toFixed(4)} `;
      }
    }
  }

  path += 'Z';
  return path;
}

function buildFullPuzzleSvg(
  allPieceEdges: { row: number; col: number; edges: { points: BezierPoint[] }[] }[],
  rows: number,
  columns: number,
  pixelsPerUnit: number
): string {
  const svgWidth = Math.round(columns * pixelsPerUnit);
  const svgHeight = Math.round(rows * pixelsPerUnit);

  let svg = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  svg += `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${columns} ${rows}" width="${svgWidth}" height="${svgHeight}">\n`;
  svg += `  <rect width="${columns}" height="${rows}" fill="none" />\n`;

  for (const piece of allPieceEdges) {
    const { row, col, edges } = piece;
    let path = '';

    for (let edgeIndex = 0; edgeIndex < edges.length; edgeIndex++) {
      const edge = edges[edgeIndex];

      for (let pointIndex = 0; pointIndex < edge.points.length; pointIndex++) {
        const point = edge.points[pointIndex];

        const globalX = col + 0.5 + point.position.x;
        const globalY = rows - (row + 0.5 + point.position.y);

        if (edgeIndex === 0 && pointIndex === 0) {
          path += `M ${globalX.toFixed(4)} ${globalY.toFixed(4)} `;
        } else if (pointIndex === 0) {
          path += `L ${globalX.toFixed(4)} ${globalY.toFixed(4)} `;
        }

        if (pointIndex < edge.points.length - 1) {
          const nextPoint = edge.points[pointIndex + 1];

          const cp1X = globalX + point.rightControlPoint.x;
          const cp1Y = globalY - point.rightControlPoint.y;

          const nextGlobalX = col + 0.5 + nextPoint.position.x;
          const nextGlobalY = rows - (row + 0.5 + nextPoint.position.y);

          const cp2X = nextGlobalX + nextPoint.leftControlPoint.x;
          const cp2Y = nextGlobalY - nextPoint.leftControlPoint.y;

          path += `C ${cp1X.toFixed(4)} ${cp1Y.toFixed(4)}, ${cp2X.toFixed(4)} ${cp2Y.toFixed(4)}, ${nextGlobalX.toFixed(4)} ${nextGlobalY.toFixed(4)} `;
        }
      }
    }

    path += 'Z';
    svg += `  <path d="${path}" fill="none" stroke="black" stroke-width="0.01" stroke-linejoin="round" stroke-linecap="round" />\n`;
  }

  svg += '</svg>';
  return svg;
}

export const exportUnityAssets = async (config: PuzzleConfig) => {
  const zip = new JSZip();
  const pieces = generatePuzzlePieces(config.rows, config.columns, config.seed, config.edgeConfigs, config.selectedEdgeIds);
  const puzzleId = typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
      });

  const pixelsPerUnit = config.maskResolution ?? 512;
  const paddingSize = config.paddingSize ?? 0;
  const pointsPerEdge = 32;

  const masks: PuzzlePieceConfig[] = [];
  const allPieceEdges: { row: number; col: number; edges: { points: BezierPoint[] }[] }[] = [];

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.columns; col++) {
      const piece = pieces[row][col];
      const pieceIndex = row * config.columns + col;

      const polygonEdges = getPolygonEdges(piece);
      allPieceEdges.push({ row, col, edges: polygonEdges });

      const { min: rawMin, max: rawMax } = computeBoundingBox(polygonEdges, pointsPerEdge);

      const min: Vector2 = { x: rawMin.x - paddingSize, y: rawMin.y - paddingSize };
      const max: Vector2 = { x: rawMax.x + paddingSize, y: rawMax.y + paddingSize };
      const size: Vector2 = { x: max.x - min.x, y: max.y - min.y };

      const svgPath = buildSvgPath(polygonEdges, min, size);

      const svgWidth = Math.round(size.x * pixelsPerUnit);
      const svgHeight = Math.round(size.y * pixelsPerUnit);

      const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size.x.toFixed(4)} ${size.y.toFixed(4)}" width="${svgWidth}" height="${svgHeight}">
  <path d="${svgPath}" fill="white" stroke="none"/>
</svg>`;

      const fileName = `${col}_${row}.svg`;
      const pngFileName = `${col}_${row}.png`;
      zip.file(fileName, svgContent);

      try {
        const pngBlob = await svgToPng(svgContent, svgWidth, svgHeight);
        zip.file(pngFileName, pngBlob);
      } catch (err) {
        console.error(`Failed to convert ${fileName} to PNG:`, err);
      }

      const normalizedPieceSize: Vector2 = {
        x: 1 / config.columns,
        y: 1 / config.rows,
      };
      const normalizedPos: Vector2 = {
        x: (col + 0.5) * normalizedPieceSize.x,
        y: (row + 0.5) * normalizedPieceSize.y,
      };
      const maskPieceSize: Vector2 = { x: size.x, y: size.y };

      const metadataMin: Vector2 = { x: min.x + 0.5, y: min.y + 0.5 };
      const metadataMax: Vector2 = { x: max.x + 0.5, y: max.y + 0.5 };

      const textureUVRect = {
        x: (metadataMin.x + col) / config.columns,
        y: (metadataMin.y + row) / config.rows,
        w: (metadataMax.x - metadataMin.x) / config.columns,
        h: (metadataMax.y - metadataMin.y) / config.rows,
      };

      masks.push({
        pieceIndex,
        column: col,
        row,
        fileName,
        normalizedPos,
        normalizedPieceSize,
        textureUVRect,
        anchorMin: metadataMin,
        anchorMax: metadataMax,
        maskPieceSize,
      });
    }
  }

  const exportData: GlobalPuzzleConfig = {
    puzzleId,
    rows: config.rows,
    columns: config.columns,
    maskResolution: pixelsPerUnit,
    paddingSize,
    masks,
  };

  zip.file('puzzle_config.json', JSON.stringify(exportData, null, 2));
  zip.file('puzzle_tool_config.json', JSON.stringify(config, null, 2));

  const fullPuzzleSvg = buildFullPuzzleSvg(allPieceEdges, config.rows, config.columns, pixelsPerUnit);
  zip.file('full_puzzle.svg', fullPuzzleSvg);

  try {
    const fullSvgWidth = Math.round(config.columns * pixelsPerUnit);
    const fullSvgHeight = Math.round(config.rows * pixelsPerUnit);
    const fullPngBlob = await svgToPng(fullPuzzleSvg, fullSvgWidth, fullSvgHeight);
    zip.file('full_puzzle.png', fullPngBlob);
  } catch (err) {
    console.error('Failed to convert full_puzzle.svg to PNG:', err);
  }

  const content = await zip.generateAsync({ type: 'blob' });
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute('href', URL.createObjectURL(content));
  downloadAnchorNode.setAttribute('download', `PuzzleAssets_${config.rows}x${config.columns}_${config.seed}.zip`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
