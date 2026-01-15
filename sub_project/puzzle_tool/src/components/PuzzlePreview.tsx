import React, { useMemo } from 'react';
import { PuzzleConfig } from '../types/puzzle';
import { generatePuzzlePieces, getPiecePath } from '../utils/puzzleGenerator';

interface PuzzlePreviewProps {
  config: PuzzleConfig;
  imageUrl?: string;
}

const PuzzlePreview: React.FC<PuzzlePreviewProps> = ({ config, imageUrl }) => {
  const pieces = useMemo(() => {
    return generatePuzzlePieces(config.rows, config.columns, config.seed, config.edgeConfigs, config.selectedEdgeIds);
  }, [config]);

  const pieceSize = 120; // Slightly larger for better preview
  const width = config.columns * pieceSize;
  const height = config.rows * pieceSize;

  return (
    <div className="flex flex-col gap-6 p-8 bg-white rounded-3xl border border-gray-200 shadow-xl">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-900">拼图预览</h3>
          <p className="text-sm text-gray-500 font-medium">{config.columns} 列 × {config.rows} 行</p>
        </div>
        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
          Live Preview
        </div>
      </div>
      
      <div className="relative bg-gray-50 rounded-2xl border border-gray-100 flex justify-center p-4 min-h-[400px] items-center overflow-hidden shadow-inner">
        <div className="w-full h-full flex items-center justify-center">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-auto max-h-[70vh] shadow-2xl overflow-visible"
            style={{ maxWidth: '100%' }}
          >
            {imageUrl && (
              <defs>
                {pieces.map((row, r) => 
                  row.map((piece, c) => (
                    <clipPath key={`clip-${r}-${c}`} id={`clip-${r}-${c}`}>
                      <path d={getPiecePath(piece, pieceSize)} transform={`translate(${c * pieceSize}, ${r * pieceSize})`} />
                    </clipPath>
                  ))
                )}
                {/* Shadow filter for pieces */}
                <filter id="pieceShadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                  <feOffset dx="1" dy="1" result="offsetblur" />
                  <feComponentTransfer>
                    <feFuncA type="linear" slope="0.3" />
                  </feComponentTransfer>
                  <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
            )}

            {/* Background Layer (Image or solid) */}
            {!imageUrl && (
              <rect width={width} height={height} fill="#f3f4f6" rx="8" />
            )}

            {/* Puzzle Pieces */}
            {pieces.map((row, r) => 
              row.map((piece, c) => (
                <g key={`piece-${r}-${c}`} className="group transition-all duration-300">
                  {imageUrl ? (
                    <image
                      href={imageUrl}
                      width={width}
                      height={height}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#clip-${r}-${c})`}
                      filter="url(#pieceShadow)"
                    />
                  ) : (
                    <path
                      d={getPiecePath(piece, pieceSize)}
                      transform={`translate(${c * pieceSize}, ${r * pieceSize})`}
                      fill="#ffffff"
                      stroke="#000000"
                      strokeWidth="2"
                    />
                  )}
                  {/* Highlight/Border Path */}
                  <path
                    d={getPiecePath(piece, pieceSize)}
                    transform={`translate(${c * pieceSize}, ${r * pieceSize})`}
                    fill="transparent"
                    stroke="#000000"
                    strokeWidth="2"
                    className="group-hover:stroke-blue-500 group-hover:stroke-2 transition-all cursor-pointer"
                  />
                </g>
              ))
            )}
          </svg>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-black">总片数</span>
          <span className="text-gray-800 font-mono text-lg font-bold">{config.rows * config.columns}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-black">纵横比</span>
          <span className="text-gray-800 font-mono text-lg font-bold">{(config.columns / config.rows).toFixed(2)}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 uppercase font-black">随机种子</span>
          <span className="text-gray-800 font-mono text-lg font-bold">{config.seed}</span>
        </div>
        <div className="flex flex-col gap-1 text-right">
          <span className="text-[10px] text-gray-400 uppercase font-black">边缘配置</span>
          <span className="text-gray-800 font-mono text-lg font-bold">{config.edgeConfigs.length}</span>
        </div>
      </div>
    </div>
  );
};

export default PuzzlePreview;
