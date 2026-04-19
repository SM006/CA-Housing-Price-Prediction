import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Home, Users, MapPin, 
  Calendar, Activity, Layers, Cpu, 
  ArrowUpRight, Info, BarChart3, PieChart,
  Maximize2, X, Globe, Zap, Download,
  Compass, ShieldCheck, Microscope
} from 'lucide-react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, Cell, PieChart as RechartsPie, Pie
} from 'recharts';

// --- Shared Components ---

const GlassCard = ({ children, className = "" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`glass-panel p-6 ${className}`}
  >
    {children}
  </motion.div>
);

const MetricSlider = ({ label, icon: Icon, value, onChange, min, max, step, name, color="text-sky-400" }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-center text-xs font-semibold uppercase tracking-wider text-slate-400">
      <span className="flex items-center gap-2">
        <Icon size={14} className={color} />
        {label}
      </span>
      <span className="text-slate-200">{value}</span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-sky-500"
    />
  </div>
);

const NavItem = ({ icon: Icon, label, active, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
      active ? 'bg-white/10 text-sky-400 shadow-[0_0_20px_rgba(38,198,218,0.1)] border border-white/5' : 'text-slate-400 hover:bg-white/5'
    }`}
  >
    <Icon size={18} />
    <span className="text-sm font-semibold tracking-wide">{label}</span>
  </div>
);

const Modal = ({ isOpen, onClose, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#020617]/95 backdrop-blur-3xl"
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-110 w-full h-full max-w-[95vw] max-h-[90vh] glass-panel overflow-hidden border-white/10"
        >
          <div className="absolute top-8 right-8 flex gap-3 z-[120]">
             <button onClick={onClose} className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                <X size={24} strokeWidth={3} />
             </button>
          </div>
          {children}
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

// --- Data (Fallbacks) ---
const demographicDistricts = [
  { name: 'San Francisco', pop: '873K', income: '$126K', growth: '+2.4%', color: 'text-sky-400' },
  { name: 'Los Angeles', pop: '3.8M', income: '$76K', growth: '+1.1%', color: 'text-purple-400' },
  { name: 'San Diego', pop: '1.3M', income: '$89K', growth: '+1.8%', color: 'text-pink-400' },
  { name: 'San Jose', pop: '1.0M', income: '$117K', growth: '+2.1%', color: 'text-indigo-400' },
];

function App() {
  const [activeTab, setActiveTab] = useState('valuation');
  const [selectedPlot, setSelectedPlot] = useState(null);
  
  const [formData, setFormData] = useState({
    MedInc: 3.5,
    HouseAge: 28,
    AveRooms: 5,
    AveBedrms: 1,
    Population: 1400,
    AveOccup: 3,
    Latitude: 35.6,
    Longitude: -119.5
  });

  const [featureImportance, setFeatureImportance] = useState([]);
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchExplanations = async () => {
      try {
        const resp = await axios.get('http://localhost:8000/api/v1/explain');
        setFeatureImportance(resp.data);
      } catch (err) {
        console.error("Failed to fetch model explanations", err);
      }
    };
    fetchExplanations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const getPrediction = async () => {
    setLoading(true);
    try {
      const resp = await axios.post('http://localhost:8000/api/v1/predict', formData);
      setPrediction(resp.data);
    } catch (err) {
      console.error(err);
      alert("Analysis service unavailable. Check backend logs.");
    }
    setLoading(false);
  };

  const analyticsPlots = [
    { 
      title: "Correlation Matrix", 
      url: "http://localhost:8000/plots/correlation_heatmap.png", 
      desc: "Heatmap illustrating latent feature relationships.",
      interpretation: "Displays multi-collinearity. High-density zones (Red/Blue) indicate features that share redundant information, allowing for potential dimensionality reduction."
    },
    { 
      title: "Marginal Density", 
      url: "http://localhost:8000/plots/feature_distributions.png", 
      desc: "KDE plots for all census independent variables.",
      interpretation: "Visualizes data skewness. The model performance is highest in the peak density zones of these curves, where the training set was most substantial."
    },
    { 
      title: "Regression Parity", 
      url: "http://localhost:8000/plots/actual_vs_predicted.png", 
      desc: "Predicted vs. Ground-truth house valuations.",
      interpretation: "The primary diagnostic for accuracy. Clustering on the diagonal line indicates high model fidelity across diverse pricing tiers."
    },
    { 
      title: "Residual Path", 
      url: "http://localhost:8000/plots/residuals.png", 
      desc: "Distribution of absolute prediction errors.",
      interpretation: "Checks for heteroscedasticity. A balanced distribution of residuals ensures the model doesn't over-predict or under-predict consistently in specific price bands."
    },
    { 
      title: "Global SHAP Weights", 
      url: "http://localhost:8000/plots/feature_importance.png", 
      desc: "SHAP-aligned global feature importance.",
      interpretation: "Confirms that Median Income is the dominant vector. This justifies the model's sensitivity to income intensity during the valuation process."
    }
  ];

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-8 bg-[#020617] overflow-hidden">
      <div className="absolute top-0 -left-60 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px]" />
      <div className="absolute bottom-0 -right-60 w-[800px] h-[800px] bg-sky-600/10 rounded-full blur-[140px]" />
      <div className="noise-overlay opacity-30" />

      {/* Main Container */}
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-[1400px] aspect-[16/9.5] flex flex-col glass-panel shadow-2xl overflow-hidden border-white/[0.08]"
      >
        {/* Header */}
        <header className="h-16 flex items-center px-8 border-b border-white/[0.05] bg-white/[0.01] justify-between">
          <div className="flex gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#FF5F57] shadow-[0_0_12px_rgba(255,95,87,0.4)]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#FFBD2E]" />
            <div className="w-3.5 h-3.5 rounded-full bg-[#28C940]" />
          </div>
          <div className="flex items-center gap-4">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-sm font-black text-slate-200 tracking-tight">Cali-Intelligence OS <span className="text-slate-600 ml-2">v2.5.4</span></span>
          </div>
          <div className="flex items-center gap-6">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inference Ready</span>
             </div>
             <Activity size={18} className="text-slate-400" />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-[280px] border-r border-white/[0.05] flex flex-col p-8 space-y-3 bg-black/40">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4 mb-3">Workspace</div>
            <NavItem icon={Cpu} label="Valuation Hub" active={activeTab === 'valuation'} onClick={() => setActiveTab('valuation')} />
            <NavItem icon={BarChart3} label="Artifact Gallery" active={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            <div className="pt-8 text-[10px] font-black text-slate-600 uppercase tracking-widest pl-4 mb-3">Intelligence</div>
            <NavItem icon={PieChart} label="SHAP Dynamics" active={activeTab === 'features'} onClick={() => setActiveTab('features')} />
            <NavItem icon={Globe} label="Geo-Vectors" active={activeTab === 'demographics'} onClick={() => setActiveTab('demographics')} />
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 flex flex-col overflow-hidden bg-white/[0.005]">
            <AnimatePresence mode="wait">
              {activeTab === 'valuation' && (
                <motion.div key="valuation" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="flex flex-1 overflow-hidden">
                  <div className="w-[380px] border-r border-white/[0.05] flex flex-col p-10 space-y-10 bg-black/5">
                    <div className="space-y-1">
                      <h2 className="text-2xl font-black text-white tracking-tighter">Parameters</h2>
                      <p className="text-[10px] text-slate-500 font-bold tracking-[0.4em] uppercase">Input Vector</p>
                    </div>
                    <div className="flex-1 overflow-y-auto pr-3 space-y-8 scroll-content">
                      <MetricSlider label="Income Intensity" icon={TrendingUp} name="MedInc" value={formData.MedInc} min={0.5} max={15.0} step={0.1} onChange={handleInputChange} />
                      <MetricSlider label="Historical Age" icon={Calendar} name="HouseAge" value={formData.HouseAge} min={1} max={52} step={1} onChange={handleInputChange} color="text-purple-400" />
                      <MetricSlider label="Room Density" icon={Home} name="AveRooms" value={formData.AveRooms} min={1} max={10} step={0.1} onChange={handleInputChange} color="text-pink-400" />
                      <MetricSlider label="Avg. Occupants" icon={Users} name="AveOccup" value={formData.AveOccup} min={1} max={10} step={0.1} onChange={handleInputChange} color="text-amber-400" />
                      <div className="grid grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Lat</label>
                          <input type="number" name="Latitude" value={formData.Latitude} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none" />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Long</label>
                          <input type="number" name="Longitude" value={formData.Longitude} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-slate-200 outline-none" />
                        </div>
                      </div>
                    </div>
                    <button onClick={getPrediction} disabled={loading} className="w-full bg-white text-black text-xs font-black h-14 rounded-2xl active:scale-95 shadow-2xl transition-all">
                      {loading ? "PROCESSING..." : "ANALYZE PROPERTY"}
                    </button>
                  </div>

                  <div className="flex-1 flex flex-col p-10 overflow-y-auto scroll-content">
                    {prediction ? (
                        <div className="w-full space-y-10">
                           <div className="h-80 glass-panel flex flex-col justify-center px-16 relative overflow-hidden border-indigo-500/10 shadow-2xl">
                              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-500/10 blur-[130px]" />
                              <div className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.6em] mb-4">Projected Market Valuation</div>
                              <div className="text-[120px] font-black text-white leading-none tracking-tighter mb-4">
                                ${prediction.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                              </div>
                              <div className="flex gap-12">
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest"><ShieldCheck size={16} className="text-emerald-500" /> Confidence Alpha {prediction.confidence_score.toFixed(1)}%</div>
                                <div className="flex items-center gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest"><Zap size={16} className="text-sky-500" /> Inferred v2.5.4</div>
                              </div>
                           </div>

                           <div className="glass-panel p-10">
                              <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-6">
                                 <div className="flex items-center gap-4">
                                    <div className="p-2.5 rounded-xl bg-indigo-600/10"><BarChart3 size={18} className="text-indigo-400" /></div>
                                    <h3 className="text-xs font-black text-white uppercase tracking-[0.4em]">Model Performance Indices</h3>
                                 </div>
                                 <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Alpha Stable</div>
                              </div>
                              <div className="grid grid-cols-2 gap-x-12 gap-y-10">
                                 {[
                                   { l: 'R² Metric', v: '0.8329', d: 'Root Correlation', c: 'text-indigo-400' },
                                   { l: 'RMSE Bias', v: '0.393', d: 'Standard Error', c: 'text-sky-400' },
                                   { l: 'MAE Delta', v: '0.264', d: 'Mean Deviation', c: 'text-purple-400' },
                                   { l: 'MSE Stat', v: '0.154', d: 'Variance Index', c: 'text-pink-400' },
                                 ].map((m, i) => (
                                   <div key={i} className="flex items-center justify-between border-b border-white/[0.03] pb-6 last:border-0 last:pb-0">
                                      <div className="space-y-1">
                                         <div className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{m.l}</div>
                                         <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{m.d}</div>
                                      </div>
                                      <div className={`text-4xl font-black ${m.c} tracking-tighter leading-none`}>{m.v}</div>
                                   </div>
                                 ))}
                              </div>
                           </div>
                        </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center space-y-10 opacity-20">
                        <Layers size={90} className="text-white animate-pulse" />
                        <div className="text-[12px] font-black text-slate-400 uppercase tracking-[1.2em]">Awaiting Vector Ingestion</div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div key="analytics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-14 overflow-y-auto scroll-content">
                  <div className="mb-14">
                    <h2 className="text-5xl font-black text-white tracking-tighter">Artifact Studio</h2>
                    <p className="text-[12px] text-slate-600 uppercase tracking-[0.6em] font-black">System Research Cluster</p>
                  </div>
                  <div className="grid grid-cols-3 gap-10">
                    {analyticsPlots.map((plot, idx) => (
                      <motion.div 
                        key={idx} 
                        whileHover={{ y: -8 }}
                        onClick={() => setSelectedPlot(plot)}
                        className="glass-panel p-7 flex flex-col space-y-6 cursor-pointer group"
                      >
                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-indigo-400 tracking-widest">
                           {plot.title}
                           <Maximize2 size={14} className="text-slate-800 group-hover:text-white" />
                        </div>
                        <div className="aspect-[4/3] relative rounded-[2rem] overflow-hidden border border-white/5 bg-black/60 shadow-2xl">
                          <img src={plot.url} alt={plot.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                        </div>
                        <div className="space-y-3">
                           <div className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                              <Microscope size={12} className="text-indigo-500" /> Diagnostic Result
                           </div>
                           <p className="text-[12px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight line-clamp-2">{plot.interpretation}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {activeTab === 'features' && (
                <motion.div key="features" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-14 flex flex-col overflow-y-auto scroll-content">
                  <h2 className="text-5xl font-black text-white tracking-tighter mb-4">SHAP Dynamics</h2>
                  <p className="text-[12px] text-slate-600 uppercase tracking-[0.8em] font-black mb-14">Global Feature Importance (SHAP-Based)</p>
                  
                  <div className="flex-1 grid grid-cols-12 gap-14 min-h-[800px]">
                     <div className="col-span-7 glass-panel p-12 border-white/5 bg-black/20">
                        <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={featureImportance} layout="vertical">
                           <XAxis type="number" hide />
                           <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 13, fontWeight: 900}} width={140} />
                           <Bar dataKey="value" radius={[4, 4, 4, 4]} barSize={42}>
                              {featureImportance.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                           </Bar>
                         </BarChart>
                       </ResponsiveContainer>
                     </div>
                     <div className="col-span-5 flex flex-col gap-8">
                        {featureImportance.slice(0, 6).map((f, i) => (
                           <div key={i} className="glass-panel p-8 group border-white/5 bg-black/10">
                              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">{f.name} Vector</div>
                              <div className="flex items-end justify-between">
                                 <div className="text-5xl font-black text-white group-hover:text-indigo-400 transition-colors">{(f.value * 100).toFixed(0)}%</div>
                                 <div className="text-[10px] font-black text-indigo-500 tracking-widest mb-2">SHAP INFLUENCE</div>
                              </div>
                              <div className="mt-6 w-full h-3 bg-white/5 rounded-md overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${f.value * 100}%` }} transition={{ delay: i * 0.1, duration: 1 }} className="h-full" style={{ backgroundColor: f.color }} />
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'demographics' && (
                <motion.div key="demographics" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 p-20 overflow-y-auto scroll-content">
                  <div className="max-w-6xl mx-auto space-y-20">
                     <div className="text-center space-y-6">
                        <Globe size={80} className="text-indigo-400 mx-auto mb-8" />
                        <h2 className="text-7xl font-black text-white tracking-tighter">Geo-Intelligence Clusters</h2>
                        <p className="text-[12px] font-black text-slate-700 uppercase tracking-[1em]">California Demographic Matrix</p>
                     </div>
                     <div className="grid grid-cols-2 gap-12">
                        {demographicDistricts.map((d, i) => (
                           <div key={i} className="glass-panel p-12 group hover:border-white/20 transition-all duration-700">
                              <div className="flex justify-between items-start mb-10">
                                 <div className="space-y-2">
                                    <div className="text-4xl font-black text-white tracking-tighter">{d.name} Hub</div>
                                    <div className="text-[11px] text-slate-500 font-black uppercase tracking-widest">{d.growth} Cluster Growth</div>
                                 </div>
                                 <MapPin size={28} className="text-slate-800 group-hover:text-amber-500 transition-colors" />
                              </div>
                              <div className="grid grid-cols-2 gap-16">
                                 <div>
                                    <div className="text-[11px] font-black text-slate-700 uppercase mb-3">Est. Population</div>
                                    <div className="text-5xl font-black text-slate-200">{d.pop}</div>
                                 </div>
                                 <div>
                                    <div className="text-[11px] font-black text-slate-700 uppercase mb-3">Median Income</div>
                                    <div className="text-5xl font-black text-slate-200">{d.income}</div>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </motion.div>

      {/* Ultra-Large Modal */}
      <Modal isOpen={!!selectedPlot} onClose={() => setSelectedPlot(null)}>
        {selectedPlot && (
          <div className="w-full h-full flex overflow-hidden">
            <div className="w-2/3 h-full p-16 bg-black/40 flex items-center justify-center">
               <img src={selectedPlot.url} alt={selectedPlot.title} className="max-w-full max-h-full object-contain drop-shadow-[0_30px_100px_rgba(0,0,0,0.9)]" />
            </div>
            <div className="w-1/3 h-full p-20 border-l border-white/5 flex flex-col justify-center space-y-12">
               <div className="space-y-6">
                  <div className="text-xs font-black text-indigo-500 uppercase tracking-[0.5em]">Research Artifact Ingress</div>
                  <h3 className="text-6xl font-black text-white tracking-tighter leading-tight">{selectedPlot.title}</h3>
               </div>
               <div className="space-y-8">
                  <div className="flex items-center gap-4 text-xs font-black text-slate-300 uppercase tracking-widest">
                     <Microscope size={22} className="text-indigo-500" /> Analytical Vector
                  </div>
                  <p className="text-2xl font-bold text-slate-400 leading-relaxed italic border-l-4 border-indigo-500 pl-8">
                     "{selectedPlot.interpretation}"
                  </p>
               </div>
               <div className="pt-16 border-t border-white/5 space-y-6">
                  <div className="text-[11px] font-black text-slate-600 uppercase tracking-widest">Operational Metadata</div>
                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-1">
                        <div className="text-[9px] font-black text-slate-700 uppercase">Resolution</div>
                        <div className="text-xs font-bold text-slate-500">2048 x 1440 PX</div>
                     </div>
                     <div className="space-y-1">
                        <div className="text-[9px] font-black text-slate-700 uppercase">Engine</div>
                        <div className="text-xs font-bold text-slate-500">Pipeline Alpha</div>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}
      </Modal>

      <div className="fixed bottom-10 text-[12px] text-slate-800 font-black tracking-[1.5em] uppercase pointer-events-none">
        Deepmind Systems • Cali-OS Root
      </div>
    </div>
  );
}

export default App;
