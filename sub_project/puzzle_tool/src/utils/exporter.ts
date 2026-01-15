import JSZip from 'jszip';
import { PuzzleConfig } from '../types/puzzle';
import { generatePuzzlePieces, getPiecePath } from './puzzleGenerator';

/**
 * Converts an SVG string to a PNG blob using a temporary canvas
 */
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

export const exportUnityAssets = async (config: PuzzleConfig) => {
  const zip = new JSZip();
  const pieces = generatePuzzlePieces(config.rows, config.columns, config.seed, config.edgeConfigs, config.selectedEdgeIds);
  const puzzleId = crypto.randomUUID();
  const pieceSize = 512; // Base unit size for export
  
  // padding set to 0 as requested, precise SVG size calculation
  // In puzzleGenerator, the path is already calculated based on pieceSize.
  // The tabs extend beyond the pieceSize, so we need to calculate the bounding box or use a safe margin if padding is 0.
  // However, "padding set to 0" usually means the output image size is exactly the piece cell size, 
  // but for jigsaw pieces, the tabs MUST be included. 
  // If we want "padding 0" relative to the piece cell, the SVG viewBox must still accommodate the tabs.
  // Let's use a standard 1.5x multiplier to ensure tabs are included without cut-off, but keep offsets precise.
  
  const exportSize = pieceSize * 1.5;
  const offset = pieceSize * 0.25;

  const masks = [];

  for (let r = 0; r < config.rows; r++) {
    for (let c = 0; c < config.columns; c++) {
      const piece = pieces[r][c];
      const path = getPiecePath(piece, pieceSize);
      
      // Learning from C#: "R {rowIndex} C {columnIndex}"
      const baseName = `R ${r} C ${c}`;
      const svgFileName = `${baseName}.svg`;
      const pngFileName = `${baseName}.png`;

      const svgContent = `
<svg width="${exportSize}" height="${exportSize}" viewBox="0 0 ${exportSize} ${exportSize}" xmlns="http://www.w3.org/2000/svg">
  <path d="${path}" fill="white" stroke="none" transform="translate(${offset}, ${offset})" />
</svg>`.trim();
      
      zip.file(svgFileName, svgContent);

      // Convert SVG to PNG and add to zip
      try {
        const pngBlob = await svgToPng(svgContent, exportSize, exportSize);
        zip.file(pngFileName, pngBlob);
      } catch (err) {
        console.error(`Failed to convert ${svgFileName} to PNG:`, err);
      }

      masks.push({
        pieceIndex: r * config.columns + c,
        column: c,
        row: r,
        svgFile: svgFileName,
        pngFile: pngFileName,
        normalizedPos: {
          x: (c + 0.5) / config.columns,
          y: (r + 0.5) / config.rows
        }
      });
    }
  }

  const unityConfig = {
    puzzleId: puzzleId,
    rows: config.rows,
    columns: config.columns,
    unitSize: pieceSize,
    exportSize: exportSize,
    offset: offset,
    totalPieces: config.rows * config.columns,
    pieces: masks
  };

  zip.file("PuzzleData.json", JSON.stringify(unityConfig, null, 2));

  const content = await zip.generateAsync({ type: "blob" });
  const downloadAnchorNode = document.createElement('a');
  downloadAnchorNode.setAttribute("href", URL.createObjectURL(content));
  downloadAnchorNode.setAttribute("download", `PuzzleAssets_${config.seed}.zip`);
  document.body.appendChild(downloadAnchorNode);
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
};
