import React, { useState, useRef, useCallback } from 'react';
import { BezierPoint, BezierPointMode, Vector2, Edge } from '../types/puzzle';

interface BezierEditorProps {
  edge: Edge;
  onChange: (updatedEdge: Edge) => void;
}

const BezierEditor: React.FC<BezierEditorProps> = ({ edge, onChange }) => {
  const [dragging, setDragging] = useState<{
    pointIndex: number;
    type: 'position' | 'left' | 'right';
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);
  const padding = 60;
  const width = 600;
  const height = 400;
  const scale = width - padding * 2;

  const toGui = useCallback((v: Vector2) => ({
    x: v.x * scale + padding,
    y: v.y * scale + height / 2,
  }), [scale, padding, height]);

  const fromGui = useCallback((x: number, y: number): Vector2 => {
    if (!svgRef.current) return { x: 0, y: 0 };
    
    // Create a point in screen coordinates
    const pt = svgRef.current.createSVGPoint();
    pt.x = x;
    pt.y = y;
    
    // Transform the point to SVG coordinates using the inverse of the Screen CTM
    // This handles all scaling, preserveAspectRatio, and transforms correctly
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse());
    
    return {
      x: (svgP.x - padding) / scale,
      y: (svgP.y - height / 2) / scale,
    };
  }, [scale, padding, height]);

  const handleMouseDown = (e: React.MouseEvent, pointIndex: number, type: 'position' | 'left' | 'right') => {
    // Prevent default to stop text selection during drag
    e.preventDefault();
    e.stopPropagation();
    
    if (e.ctrlKey && type === 'position') {
      removePoint(e, pointIndex);
      return;
    }

    if (type === 'position' && (pointIndex === 0 || pointIndex === edge.points.length - 1)) {
      return;
    }
    setDragging({ pointIndex, type });
  };

  const handleSvgClick = (e: React.MouseEvent) => {
    if (!e.altKey) return;
    if (!svgRef.current) return;
    
    // Use clientX/Y directly for matrix transformation
    const pos = fromGui(e.clientX, e.clientY);

    // Don't add points too close to endpoints or outside bounds
    if (pos.x <= 0.05 || pos.x >= 0.95) return;

    // Find where to insert the point based on x coordinate
    const newPoints = [...edge.points];
    let insertIndex = 1;
    for (let i = 1; i < newPoints.length; i++) {
      if (pos.x < newPoints[i].position.x) {
        insertIndex = i;
        break;
      }
    }

    const newPoint: BezierPoint = {
      position: pos,
      leftControlPoint: { x: -0.05, y: 0 },
      rightControlPoint: { x: 0.05, y: 0 },
      mode: BezierPointMode.Continuous,
    };

    newPoints.splice(insertIndex, 0, newPoint);
    onChange({ ...edge, points: newPoints });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging || !svgRef.current) return;

    // Use clientX/Y directly with matrix transform for perfect tracking
    const pos = fromGui(e.clientX, e.clientY);

    const newPoints = [...edge.points];
    const point = { ...newPoints[dragging.pointIndex] };

    if (dragging.type === 'position') {
      // Endpoints are fixed at x=0 and x=1
      if (dragging.pointIndex === 0 || dragging.pointIndex === edge.points.length - 1) {
        point.position = {
          x: dragging.pointIndex === 0 ? 0 : 1,
          y: pos.y,
        };
      } else {
        // Keep x between neighbors
        const minX = newPoints[dragging.pointIndex - 1].position.x + 0.01;
        const maxX = newPoints[dragging.pointIndex + 1].position.x - 0.01;
        point.position = {
          x: Math.max(minX, Math.min(maxX, pos.x)),
          y: pos.y,
        };
      }
    } else if (dragging.type === 'left') {
      point.leftControlPoint = {
        x: pos.x - point.position.x,
        y: pos.y - point.position.y,
      };
      if (point.mode === BezierPointMode.Continuous) {
        point.rightControlPoint = {
          x: -point.leftControlPoint.x,
          y: -point.leftControlPoint.y,
        };
      }
    } else if (dragging.type === 'right') {
      point.rightControlPoint = {
        x: pos.x - point.position.x,
        y: pos.y - point.position.y,
      };
      if (point.mode === BezierPointMode.Continuous) {
        point.leftControlPoint = {
          x: -point.rightControlPoint.x,
          y: -point.rightControlPoint.y,
        };
      }
    }

    newPoints[dragging.pointIndex] = point;
    onChange({ ...edge, points: newPoints });
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const removePoint = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    if (edge.points.length <= 2) return;
    if (index === 0 || index === edge.points.length - 1) return;
    const points = edge.points.filter((_, i) => i !== index);
    onChange({ ...edge, points });
  };

  const toggleMode = (index: number) => {
    const points = [...edge.points];
    points[index] = {
      ...points[index],
      mode: points[index].mode === BezierPointMode.Continuous 
        ? BezierPointMode.Free 
        : BezierPointMode.Continuous
    };
    onChange({ ...edge, points });
  };

  const smoothPoint = (index: number) => {
    const points = [...edge.points];
    const p = { ...points[index] };
    
    // Align left and right control points to be symmetrical
    const distL = Math.sqrt(p.leftControlPoint.x ** 2 + p.leftControlPoint.y ** 2);
    const distR = Math.sqrt(p.rightControlPoint.x ** 2 + p.rightControlPoint.y ** 2);
    const avgDist = (distL + distR) / 2 || 0.05;
    
    // If one side is zero, use a default horizontal vector
    if (distL === 0 && distR === 0) {
      p.leftControlPoint = { x: -avgDist, y: 0 };
      p.rightControlPoint = { x: avgDist, y: 0 };
    } else {
      // Use the vector from left to right as the direction
      const dx = p.rightControlPoint.x - p.leftControlPoint.x;
      const dy = p.rightControlPoint.y - p.leftControlPoint.y;
      const mag = Math.sqrt(dx * dx + dy * dy);
      
      p.rightControlPoint = {
        x: (dx / mag) * avgDist,
        y: (dy / mag) * avgDist
      };
      p.leftControlPoint = {
        x: -p.rightControlPoint.x,
        y: -p.rightControlPoint.y
      };
    }
    
    p.mode = BezierPointMode.Continuous;
    points[index] = p;
    onChange({ ...edge, points });
  };

  // Generate the path string
  const pathD = `M ${edge.points[0].position.x * scale + padding} ${edge.points[0].position.y * scale + height/2} ` + 
    edge.points.slice(0, -1).map((p, i) => {
      const next = edge.points[i+1];
      const cp1 = { x: (p.position.x + p.rightControlPoint.x) * scale + padding, y: (p.position.y + p.rightControlPoint.y) * scale + height/2 };
      const cp2 = { x: (next.position.x + next.leftControlPoint.x) * scale + padding, y: (next.position.y + next.leftControlPoint.y) * scale + height/2 };
      const end = { x: next.position.x * scale + padding, y: next.position.y * scale + height/2 };
      return `C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${end.x} ${end.y}`;
    }).join(' ');

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-6 bg-white rounded-3xl border border-gray-200 shadow-xl h-full">
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">图形编辑</h3>
            <p className="text-sm text-gray-500 font-medium">Alt + 点击路径：添加锚点 | Ctrl + 点击锚点：删除</p>
          </div>
        </div>
        
        <div className="relative bg-gray-50 rounded-2xl border border-gray-200 overflow-hidden cursor-crosshair flex-1 min-h-[400px]">
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onClick={handleSvgClick}
            className="select-none absolute inset-0"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#00000008" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <line x1={padding} y1={height/2} x2={width - padding} y2={height/2} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
            <line x1={padding} y1={0} x2={padding} y2={height} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />
            <line x1={width - padding} y1={0} x2={width - padding} y2={height} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="4" />

            <path d={pathD} stroke="#3b82f6" strokeWidth="6" strokeLinecap="round" fill="none" className="opacity-5" />
            <path d={pathD} stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" fill="none" />

            {edge.points.map((p, i) => {
              const pos = toGui(p.position);
              const left = toGui({ x: p.position.x + p.leftControlPoint.x, y: p.position.y + p.leftControlPoint.y });
              const right = toGui({ x: p.position.x + p.rightControlPoint.x, y: p.position.y + p.rightControlPoint.y });
              const isEndpoint = i === 0 || i === edge.points.length - 1;

              return (
                <g key={i}>
                  {!isEndpoint && (
                    <>
                      <line x1={pos.x} y1={pos.y} x2={left.x} y2={left.y} stroke="#9ca3af" strokeWidth="1" />
                      <line x1={pos.x} y1={pos.y} x2={right.x} y2={right.y} stroke="#9ca3af" strokeWidth="1" />
                    <circle
                      cx={left.x}
                      cy={left.y}
                      r="6"
                      fill={dragging?.pointIndex === i && dragging.type === 'left' ? '#10b981' : 'white'}
                      stroke="#10b981"
                      strokeWidth="2"
                      className="cursor-move hover:fill-green-50 shadow-sm"
                      onMouseDown={(e) => handleMouseDown(e, i, 'left')}
                    />
                    <circle
                      cx={right.x}
                      cy={right.y}
                      r="6"
                      fill={dragging?.pointIndex === i && dragging.type === 'right' ? '#10b981' : 'white'}
                      stroke="#10b981"
                      strokeWidth="2"
                      className="cursor-move hover:fill-green-50 shadow-sm"
                      onMouseDown={(e) => handleMouseDown(e, i, 'right')}
                    />
                    </>
                  )}
                  {i === 0 && (
                     <>
                       <line x1={pos.x} y1={pos.y} x2={right.x} y2={right.y} stroke="#9ca3af" strokeWidth="1" />
                       <circle cx={right.x} cy={right.y} r="5" fill="#ffffff" stroke="#9ca3af" strokeWidth="2" className="cursor-move hover:stroke-blue-500 shadow-sm" onMouseDown={(e) => handleMouseDown(e, i, 'right')} />
                     </>
                  )}
                  {i === edge.points.length - 1 && (
                     <>
                       <line x1={pos.x} y1={pos.y} x2={left.x} y2={left.y} stroke="#9ca3af" strokeWidth="1" />
                       <circle cx={left.x} cy={left.y} r="5" fill="#ffffff" stroke="#9ca3af" strokeWidth="2" className="cursor-move hover:stroke-blue-500 shadow-sm" onMouseDown={(e) => handleMouseDown(e, i, 'left')} />
                     </>
                  )}
                  <circle
                    cx={pos.x} cy={pos.y} r={isEndpoint ? "6" : "8"} 
                    fill={isEndpoint ? "#ef4444" : (dragging?.pointIndex === i && dragging.type === 'position' ? '#3b82f6' : 'white')}
                    stroke={isEndpoint ? "#ffffff" : "#3b82f6"}
                    strokeWidth="2"
                    className={`${isEndpoint ? 'cursor-not-allowed' : 'cursor-move'} hover:fill-blue-50 shadow-sm`}
                    onMouseDown={(e) => handleMouseDown(e, i, 'position')}
                  />
                </g>
              );
            })}
          </svg>
        </div>
      </div>
      
      <div className="w-full lg:w-72 flex flex-col gap-3 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest px-2">锚点列表</h4>
        {edge.points.map((p, i) => (
          <div key={i} className={`flex flex-col gap-2 bg-gray-50 p-3 rounded-xl border transition-all ${dragging?.pointIndex === i ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'}`}>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500">Point {i}</span>
              {i !== 0 && i !== edge.points.length - 1 && (
                <div className="flex gap-1">
                  <button onClick={() => smoothPoint(i)} className="text-[10px] px-2 py-0.5 rounded-md bg-green-100 text-green-700 border border-green-200 hover:bg-green-200 transition-all">Smooth</button>
                  <button onClick={() => toggleMode(i)} className={`text-[10px] px-2 py-0.5 rounded-md transition-all ${p.mode === BezierPointMode.Continuous ? 'bg-blue-100 text-blue-700 border border-blue-200' : 'bg-orange-100 text-orange-700 border border-orange-200'}`}>{p.mode}</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div>
                <label className="text-gray-400 block uppercase scale-90 origin-left">Position X</label>
                <span className="text-gray-700 font-mono font-medium">{p.position.x.toFixed(3)}</span>
              </div>
              <div>
                <label className="text-gray-400 block uppercase scale-90 origin-left">Position Y</label>
                <span className="text-gray-700 font-mono font-medium">{p.position.y.toFixed(3)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BezierEditor;
