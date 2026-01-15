import { useState, useCallback, useEffect } from 'react'
import './App.css'
import { BezierPointMode, Edge, PuzzleConfig } from './types/puzzle'
import BezierEditor from './components/BezierEditor'
import PuzzlePreview from './components/PuzzlePreview'
import { exportUnityAssets } from './utils/exporter'

const DEFAULT_EDGES: Edge[] = [
  {
    id: 'edge-1',
    name: 'Standard Tab',
    points: [
      {
        position: { x: 0, y: 0 },
        leftControlPoint: { x: -0.14529911677042642, y: 0.036943912506103516 },
        rightControlPoint: { x: 0.14529911677042642, y: -0.036943912506103516 },
        mode: BezierPointMode.Continuous
      },
      {
        position: { x: 0.2448829968770345, y: 0.044857152303059894 },
        leftControlPoint: { x: -0.10314044952392576, y: -0.07824449539184569 },
        rightControlPoint: { x: 0.10314044952392576, y: 0.07824449539184569 },
        mode: BezierPointMode.Continuous
      },
      {
        position: { x: 0.4, y: 0 },
        leftControlPoint: { x: 0.01915480295817057, y: 0.0768662452697754 },
        rightControlPoint: { x: -0.01915480295817057, y: -0.0768662452697754 },
        mode: BezierPointMode.Continuous
      },
      {
        position: { x: 0.5222952524820964, y: -0.23966822624206544 },
        leftControlPoint: { x: -0.18494151433308925, y: -0.042678817113240536 },
        rightControlPoint: { x: 0.18494151433308925, y: 0.042678817113240536 },
        mode: BezierPointMode.Continuous
      },
      {
        position: { x: 0.5507477442423503, y: -0.040500481923421226 },
        leftControlPoint: { x: 0.028452491760253884, y: -0.05334850947062174 },
        rightControlPoint: { x: -0.028452491760253884, y: 0.05334850947062174 },
        mode: BezierPointMode.Continuous
      },
      {
        position: { x: 0.6752276341976793, y: 0.061217308044433594 },
        leftControlPoint: { x: -0.1315929809349704, y: -0.010669708251953125 },
        rightControlPoint: { x: 0.1315929809349704, y: 0.010669708251953125 },
        mode: BezierPointMode.Continuous
      },
      {
        position: { x: 1, y: 0 },
        leftControlPoint: { x: -0.1825096766153972, y: -0.022717634836832683 },
        rightControlPoint: { x: 0.1825096766153972, y: 0.022717634836832683 },
        mode: BezierPointMode.Continuous
      }
    ]
  }
];

type Tab = 'bezier' | 'puzzle';

function App() {
  const [config, setConfig] = useState<PuzzleConfig>({
    rows: 15,
    columns: 15,
    seed: 12345,
    edgeConfigs: DEFAULT_EDGES,
    selectedEdgeIds: ["edge-1", "edge-2", "edge-3"],
  });

  const [activeTab, setActiveTab] = useState<Tab>('bezier');
  const [selectedEdgeIndex, setSelectedEdgeIndex] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | undefined>();

  const handleEdgeChange = (updatedEdge: Edge) => {
    const newEdges = [...config.edgeConfigs];
    newEdges[selectedEdgeIndex] = updatedEdge;
    setConfig({ ...config, edgeConfigs: newEdges });
  };

  const addNewEdge = () => {
    const newEdge: Edge = {
      id: `edge-${Date.now()}`,
      name: `New Edge ${config.edgeConfigs.length + 1}`,
      points: JSON.parse(JSON.stringify(DEFAULT_EDGES[0].points)),
    };
    setConfig({ ...config, edgeConfigs: [...config.edgeConfigs, newEdge] });
    setSelectedEdgeIndex(config.edgeConfigs.length);
  };

  const removeEdge = (index: number) => {
    if (config.edgeConfigs.length <= 1) return;
    const newEdges = config.edgeConfigs.filter((_, i) => i !== index);
    setConfig({ ...config, edgeConfigs: newEdges });
    if (selectedEdgeIndex >= newEdges.length) {
      setSelectedEdgeIndex(newEdges.length - 1);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImageUrl(url);
    }
  };

  const exportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "puzzle_tool_config.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importConfig = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          setConfig(imported);
        } catch (err) {
          alert("Failed to import config: " + err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 text-gray-800 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-gray-200 flex flex-col bg-white shadow-sm">
        <div className="p-6">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-sm text-white shadow-md">P</span>
            Puzzle Tool
          </h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <button
            onClick={() => setActiveTab('bezier')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'bezier' 
              ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            贝塞尔编辑
          </button>
          <button
            onClick={() => setActiveTab('puzzle')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === 'puzzle' 
              ? 'bg-blue-50 text-blue-600 font-bold shadow-sm' 
              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            拼图编辑
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-2">
          <label className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm font-medium">
            <span>Import JSON</span>
            <input type="file" accept=".json" onChange={importConfig} className="hidden" />
          </label>
          <button 
            onClick={exportConfig}
            className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors text-sm font-medium"
          >
            Export JSON
          </button>
          <button 
            onClick={() => exportUnityAssets(config)}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm font-bold shadow-md hover:shadow-lg"
          >
            Export Unity Assets
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-6xl mx-auto p-8">
          {activeTab === 'bezier' ? (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">贝塞尔编辑</h2>
                  <p className="text-gray-500">定义拼图边缘的形状</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
                  {config.edgeConfigs.map((edge, index) => (
                    <button
                      key={edge.id}
                      onClick={() => setSelectedEdgeIndex(index)}
                      className={`px-4 py-1.5 rounded-lg text-sm transition-all ${
                        selectedEdgeIndex === index 
                        ? 'bg-blue-600 text-white shadow-md font-bold' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      {edge.name}
                    </button>
                  ))}
                  <button 
                    onClick={addNewEdge}
                    className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                    title="Add Edge Type"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <BezierEditor 
                    edge={config.edgeConfigs[selectedEdgeIndex]} 
                    onChange={handleEdgeChange} 
                  />
                </div>
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">当前配置</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-semibold text-gray-600 block mb-1.5">名称</label>
                        <input 
                          type="text"
                          value={config.edgeConfigs[selectedEdgeIndex].name}
                          onChange={e => {
                            const newEdges = [...config.edgeConfigs];
                            newEdges[selectedEdgeIndex].name = e.target.value;
                            setConfig({...config, edgeConfigs: newEdges});
                          }}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => removeEdge(selectedEdgeIndex)}
                          disabled={config.edgeConfigs.length <= 1}
                          className="w-full px-4 py-2 text-red-500 hover:bg-red-50 disabled:opacity-30 rounded-xl transition-all text-sm font-bold"
                        >
                          删除此配置
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">使用说明</h3>
                    <ul className="text-sm text-gray-600 space-y-3 list-disc pl-4">
                      <li><span className="text-blue-600 font-bold">Alt + 点击路径</span>：添加锚点</li>
                      <li><span className="text-blue-600 font-bold">拖拽锚点</span>：修改位置</li>
                      <li><span className="text-blue-600 font-bold">拖拽控制柄</span>：调整曲率</li>
                      <li><span className="text-blue-600 font-bold">Ctrl + 点击锚点</span>：删除锚点</li>
                      <li><span className="text-green-600 font-bold">Smooth 按钮</span>：自动平滑锚点</li>
                      <li>端点 (0,0) 和 (1,0) 已固定</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">拼图预览</h2>
                <p className="text-gray-500">预览和生成拼图配置</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">网格设置</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-400 uppercase font-black mb-1.5 tracking-wider">行数</label>
                        <input 
                          type="number" 
                          value={config.rows} 
                          onChange={e => setConfig({...config, rows: parseInt(e.target.value) || 1})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 uppercase font-black mb-1.5 tracking-wider">列数</label>
                        <input 
                          type="number" 
                          value={config.columns} 
                          onChange={e => setConfig({...config, columns: parseInt(e.target.value) || 1})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 uppercase font-black mb-1.5 tracking-wider">随机种子</label>
                      <input 
                        type="number" 
                        value={config.seed} 
                        onChange={e => setConfig({...config, seed: parseInt(e.target.value) || 0})}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <label className="block text-xs text-gray-400 uppercase font-black mb-4 tracking-wider">使用边缘类型</label>
                      <div className="space-y-3">
                        {config.edgeConfigs.map(edge => (
                          <label key={edge.id} className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={config.selectedEdgeIds?.includes(edge.id)}
                              onChange={e => {
                                const ids = config.selectedEdgeIds || [];
                                const newIds = e.target.checked 
                                  ? [...ids, edge.id]
                                  : ids.filter(id => id !== edge.id);
                                setConfig({...config, selectedEdgeIds: newIds});
                              }}
                              className="w-5 h-5 rounded-lg border-gray-300 bg-white text-blue-600 focus:ring-blue-500/20 transition-all"
                            />
                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900 transition-colors">{edge.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4">
                    <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3">底图参考</h3>
                    <label className="block w-full text-center px-4 py-8 border-2 border-dashed border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-bold text-gray-500">{imageUrl ? '更换图片' : '上传底图'}</span>
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    {imageUrl && (
                      <div className="relative group rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                        <img src={imageUrl} alt="Preview" className="w-full h-32 object-cover" />
                        <button 
                          onClick={() => setImageUrl(undefined)}
                          className="absolute top-2 right-2 bg-red-500/90 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 shadow-lg"
                        >
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="lg:col-span-3">
                  <PuzzlePreview 
                    config={config} 
                    imageUrl={imageUrl} 
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
