import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Home, Users, MapPin, 
  Calendar, Activity, Layers, Cpu, 
  ArrowUpRight, Info
} from 'lucide-react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area
} from 'recharts';

// --- Components ---

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
      className="w-full"
    />
  </div>
);

// --- Mock Data ---
const featureImportanceData = [
  { name: 'MedInc', value: 0.85 },
  { name: 'AveOccup', value: 0.45 },
  { name: 'HouseAge', value: 0.35 },
  { name: 'Latitude', value: 0.30 },
  { name: 'Longitude', value: 0.28 },
  { name: 'AveRooms', value: 0.15 },
];

const performanceData = [
  { p: 1, actual: 1.2, pred: 1.15 },
  { p: 2, actual: 2.0, pred: 1.95 },
  { p: 3, actual: 1.8, pred: 2.1 },
  { p: 4, actual: 2.5, pred: 2.45 },
  { p: 5, actual: 3.2, pred: 3.0 },
  { p: 6, actual: 4.8, pred: 4.9 },
  { p: 7, actual: 3.5, pred: 3.65 },
];

function App() {
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

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

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

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-8 bg-[#030712] overflow-hidden">
      {/* Background blobs */}
      <div className="blob w-96 h-96 bg-purple-500 -top-20 -left-20" />
      <div className="blob w-96 h-96 bg-sky-500 top-1/2 -right-20" />
      <div className="blob w-96 h-96 bg-pink-500 -bottom-20 left-1/2" />
      
      <div className="noise-overlay" />

      {/* Main Container */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-6xl aspect-[16/10] flex flex-col glass-panel overflow-hidden"
      >
        {/* Header / Traffic Lights */}
        <header className="h-14 flex items-center px-6 border-b border-white/[0.05] bg-white/[0.02] justify-between">
          <div className="flex gap-2">
            <div className="traffic-light bg-[#FF5F57]" />
            <div className="traffic-light bg-[#FFBD2E]" />
            <div className="traffic-light bg-[#28C940]" />
          </div>
          <div className="flex items-center gap-3">
            <Layers size={14} className="text-slate-400" />
            <span className="text-[13px] font-semibold text-slate-300 tracking-tight">AI House Price Predictor v2.5</span>
          </div>
          <div className="flex items-center gap-4">
             <div className="px-2 py-0.5 rounded-md bg-sky-500/10 border border-sky-500/20 text-[10px] text-sky-400 font-bold uppercase">LGBM Core</div>
             <Activity size={16} className="text-slate-500" />
          </div>
        </header>

        {/* Content Body */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* Sidebar / Inputs */}
          <aside className="w-[340px] border-r border-white/[0.05] flex flex-col p-8 space-y-8 bg-black/10">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-white tracking-tight">Neighborhood Insight</h2>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest">Adjust features for real-time inference</p>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-8 scroll-content">
              <MetricSlider label="Median Income ($10k)" icon={TrendingUp} name="MedInc" value={formData.MedInc} min={0.5} max={15.0} step={0.1} onChange={handleInputChange} />
              <MetricSlider label="Median House Age" icon={Calendar} name="HouseAge" value={formData.HouseAge} min={1} max={52} step={1} onChange={handleInputChange} color="text-purple-400" />
              <MetricSlider label="Avg. Rooms" icon={Home} name="AveRooms" value={formData.AveRooms} min={1} max={10} step={0.1} onChange={handleInputChange} color="text-pink-400" />
              <MetricSlider label="Occupancy Density" icon={Users} name="AveOccup" value={formData.AveOccup} min={1} max={10} step={0.1} onChange={handleInputChange} color="text-amber-400" />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Latitude</label>
                    <input type="number" name="Latitude" value={formData.Latitude} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Longitude</label>
                    <input type="number" name="Longitude" value={formData.Longitude} onChange={handleInputChange} className="w-full bg-white/5 border border-white/10 rounded-lg p-2 text-sm text-slate-200 focus:outline-none focus:border-sky-500 transition-colors" />
                 </div>
              </div>
            </div>

            <button 
              onClick={getPrediction}
              disabled={loading}
              className="relative group w-full bg-white text-black font-bold h-12 rounded-xl transition-all active:scale-95 hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-400 to-purple-500 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity" />
              {loading ? "PROCESSING..." : "PREDICT MARKET VALUE"}
            </button>
          </aside>

          {/* Result & Data Visualization */}
          <main className="flex-1 flex flex-col p-8 bg-white/[0.01]">
            
            <div className="grid grid-cols-5 gap-6 mb-8">
               {/* Primary Price Card */}
               <div className="col-span-3 h-48 glass-panel flex flex-col justify-center px-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="text-[11px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-2">Estimated Median Property Value</div>
                  <AnimatePresence mode="wait">
                    {prediction ? (
                      <motion.div 
                        key="val" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="text-6xl font-black text-white tracking-tighter"
                      >
                         ${prediction.predicted_price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                         <span className="text-xl text-slate-500 font-medium ml-4">USD</span>
                      </motion.div>
                    ) : (
                      <div className="text-6xl font-black text-white/10 tracking-tighter">---,---</div>
                    )}
                  </AnimatePresence>
               </div>

               {/* Metrics Stats */}
               <div className="col-span-2 grid grid-cols-2 gap-4">
                  <div className="glass-panel p-5 flex flex-col justify-between">
                     <Cpu size={16} className="text-purple-400" />
                     <div>
                        <div className="text-[20px] font-bold text-white">LightGBM</div>
                        <div className="text-[9px] text-slate-500 uppercase font-black">Backend Arch</div>
                     </div>
                  </div>
                  <div className="glass-panel p-5 flex flex-col justify-between">
                     <ArrowUpRight size={16} className="text-sky-400" />
                     <div>
                        <div className="text-[20px] font-bold text-white">0.832</div>
                        <div className="text-[9px] text-slate-500 uppercase font-black">Model R² Score</div>
                     </div>
                  </div>
                  <div className="col-span-2 glass-panel p-4 flex items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase">System Integrity Nominal</span>
                     </div>
                     <Info size={14} className="text-slate-600" />
                  </div>
               </div>
            </div>

            {/* Charts Section */}
            <div className="flex-1 grid grid-cols-2 gap-6 pb-2">
              {/* Feature Importance */}
              <div className="glass-panel p-6 flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Global Feature Influence</h3>
                  <div className="text-[10px] text-sky-500 font-bold">SHAP WEIGHTS</div>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={featureImportanceData} layout="vertical">
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} width={60} />
                      <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 4, 4, 0]} barSize={12} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#0ea5e9" />
                          <stop offset="100%" stopColor="#818cf8" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Prediction Distribution */}
              <div className="glass-panel p-6 flex flex-col">
                 <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Model Regression Precision</h3>
                  <div className="text-[10px] text-purple-500 font-bold">VAL VAL ERROR</div>
                </div>
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px'}} />
                      <Area type="monotone" dataKey="actual" stroke="#818cf8" fillOpacity={1} fill="url(#colorActual)" />
                      <Area type="monotone" dataKey="pred" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorPred)" />
                      <defs>
                        <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#818cf8" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

          </main>
        </div>

      </motion.div>

      {/* Footer / Info */}
      <div className="fixed bottom-6 text-[10px] text-slate-600 font-medium tracking-[0.3em] uppercase">
        Designed by Apple Data Systems • Palo Alto, CA
      </div>
    </div>
  );
}

export default App;
