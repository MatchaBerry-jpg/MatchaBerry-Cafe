
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Coffee, 
  Sparkles, 
  Calculator, 
  Navigation, 
  Brain, 
  Camera, 
  Heart,
  BookOpen,
  ArrowRight,
  Wind,
  Layers,
  Star,
  Cherry,
  Globe,
  TrendingUp,
  CloudSun,
  Construction,
  Activity,
  MapPin,
  Cpu,
  Gamepad2,
  CarFront,
  CheckCircle2
} from 'lucide-react';
import SmoothFunctionBar from './components/SmoothFunctionBar';
import SurfacePlot3D from './components/SurfacePlot3D';
import { analyzeImageForFunction, getChefExplanation } from './services/geminiService';

enum Page {
  LOBBY = 'lobby',
  PARTIAL = 'partial',
  DIRECTIONAL = 'directional'
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<Page>(Page.LOBBY);
  const [expression, setExpression] = useState('x^2 - y^2');
  const [point, setPoint] = useState({ x: 0, y: 0 });
  const [direction, setDirection] = useState({ u: 1, v: 1 });
  const [results, setResults] = useState<any>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);

  const calculatePartial = useCallback(async (expr: string, px: number, py: number) => {
    try {
      setLoading(true);
      const math = (window as any).math;
      const f_x = math.derivative(expr, 'x').toString();
      const f_y = math.derivative(expr, 'y').toString();
      const val_x = math.evaluate(f_x, { x: px, y: py });
      const val_y = math.evaluate(f_y, { x: px, y: py });
      
      const res = { f_x, f_y, val_x, val_y };
      setResults(res);
      const expl = await getChefExplanation("Partial Rate of Change", expr, res);
      setExplanation(expl);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  const calculateDirectional = useCallback(async (expr: string, px: number, py: number, du: number, dv: number) => {
    try {
      setLoading(true);
      const math = (window as any).math;
      const f_x = math.derivative(expr, 'x').toString();
      const f_y = math.derivative(expr, 'y').toString();
      const vx = math.evaluate(f_x, { x: px, y: py });
      const vy = math.evaluate(f_y, { x: px, y: py });
      const mag = Math.sqrt(du*du + dv*dv) || 1;
      const u = du / mag;
      const v = dv / mag;
      const directionalDeriv = vx * u + vy * v;
      
      const res = { f_x, f_y, vx, vy, u, v, directionalDeriv };
      setResults(res);
      const expl = await getChefExplanation("Directional Path Slope", expr, res);
      setExplanation(expl);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (currentPage === Page.PARTIAL) calculatePartial(expression, point.x, point.y);
    if (currentPage === Page.DIRECTIONAL) calculateDirectional(expression, point.x, point.y, direction.u, direction.v);
  }, [expression, point, direction, currentPage, calculatePartial, calculateDirectional]);

  const handleImageUpload = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        setLoading(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          const extracted = await analyzeImageForFunction(base64);
          setExpression(extracted);
          setLoading(false);
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const ApplicationCard = ({ icon: Icon, title, desc, color }: any) => (
    <div className="app-card-pastel" style={{ borderColor: color, backgroundColor: `${color}08` }}>
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}20` }}>
           <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <div>
          <h5 className="font-black text-sm mb-1 uppercase tracking-wider" style={{ color }}>{title}</h5>
          <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FFFDFB]">
      {/* Navbar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-[#A8C69F]/20 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentPage(Page.LOBBY)}>
          <div className="w-10 h-10 matcha-bg rounded-xl flex items-center justify-center shadow-sm floating">
             <Coffee className="text-white w-6 h-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-[#4A5A4B]">
            MatchaBerry <span className="strawberry-text">Cafe</span>
          </h1>
        </div>
        <nav className="flex items-center gap-1 bg-[#F1F8F1] p-1 rounded-2xl">
           {[
             { id: Page.LOBBY, icon: BookOpen, label: 'Lobby' },
             { id: Page.PARTIAL, icon: Layers, label: 'Bakery' },
             { id: Page.DIRECTIONAL, icon: Navigation, label: 'Path' }
           ].map(p => (
             <button 
               key={p.id}
               onClick={() => setCurrentPage(p.id)}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                 currentPage === p.id 
                 ? 'bg-white strawberry-text shadow-md scale-105' 
                 : 'text-[#709078] hover:text-[#4A5A4B]'
               }`}
             >
               <p.icon className="w-4 h-4" />
               <span className="hidden md:inline uppercase tracking-widest">{p.label}</span>
             </button>
           ))}
        </nav>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 space-y-24">
        
        {currentPage === Page.LOBBY && (
          <div className="space-y-32">
            {/* Hero Section */}
            <div className="text-center space-y-8 relative py-12">
              <div className="absolute top-0 left-0 floating opacity-40 pointer-events-none scale-125"><Cherry className="text-[#FFD1DC] w-12 h-12" /></div>
              <div className="absolute bottom-0 right-0 floating opacity-40 pointer-events-none" style={{animationDelay: '1.5s'}}><Star className="text-[#A8C69F] w-10 h-10" /></div>
              
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#FDF2F2] rounded-full strawberry-text text-[10px] font-black tracking-[0.2em] uppercase border-2 border-[#FFD1DC] shadow-sm">
                <Sparkles className="w-4 h-4" /> Pastel Calculus Treats
              </div>
              <h2 className="text-6xl md:text-8xl font-black text-[#4A5A4B] leading-tight">
                Freshly Brewed <br/> <span className="strawberry-text italic">Calculus</span>
              </h2>
              <p className="text-lg text-[#709078] max-w-2xl mx-auto font-medium leading-relaxed italic">
                A delightful space where math meets matcha. Explore the geometry of surfaces 
                with our cute AI-powered bakery!
              </p>
              <div className="flex justify-center pt-4">
                <button onClick={() => setCurrentPage(Page.PARTIAL)} className="px-10 py-5 matcha-bg text-white rounded-[2rem] font-black text-lg shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                  Step into the Bakery <ArrowRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* General Concepts: 3+3 Facts */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
               <div className="cafe-bubble p-10 space-y-8 border-4 border-[#A8C69F]/10">
                  <div className="flex items-center gap-4">
                     <div className="p-3 matcha-bg rounded-2xl shadow-sm"><Layers className="text-white w-6 h-6" /></div>
                     <h3 className="text-2xl font-black text-[#4A5A4B]">Partial Derivatives</h3>
                  </div>
                  <ul className="space-y-6">
                     <li className="flex gap-4">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[#A8C69F]" /></div>
                        <p className="text-sm font-medium leading-relaxed"><b>Instantaneous Rate:</b> Measures how a function changes as only one variable varies, while others are held strictly constant.</p>
                     </li>
                     <li className="flex gap-4">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[#A8C69F]" /></div>
                        <p className="text-sm font-medium leading-relaxed"><b>Geometric Tangents:</b> Defines the slope of a line tangent to the surface at a specific point, parallel to the coordinate axes.</p>
                     </li>
                     <li className="flex gap-4">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 text-[#A8C69F]" /></div>
                        <p className="text-sm font-medium leading-relaxed"><b>Simplified View:</b> Allows us to treat complex surfaces as a collection of single-variable curves for easier analysis.</p>
                     </li>
                  </ul>
               </div>

               <div className="cafe-bubble p-10 space-y-8 border-4 border-[#FFD1DC]/40">
                  <div className="flex items-center gap-4">
                     <div className="p-3 strawberry-bg rounded-2xl shadow-sm"><Navigation className="text-white w-6 h-6" /></div>
                     <h3 className="text-2xl font-black text-[#4A5A4B]">Directional Derivatives</h3>
                  </div>
                  <ul className="space-y-6">
                     <li className="flex gap-4">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 strawberry-text" /></div>
                        <p className="text-sm font-medium leading-relaxed"><b>Full Directionality:</b> Finds the slope of a surface in <i>any</i> direction, extending the concept beyond just the X and Y axes.</p>
                     </li>
                     <li className="flex gap-4">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 strawberry-text" /></div>
                        <p className="text-sm font-medium leading-relaxed"><b>Gradient Connection:</b> Directly computed using the dot product of the Gradient vector (∇f) and a unit direction vector.</p>
                     </li>
                     <li className="flex gap-4">
                        <div className="mt-1"><CheckCircle2 className="w-5 h-5 strawberry-text" /></div>
                        <p className="text-sm font-medium leading-relaxed"><b>Steepest Path:</b> The maximum value always occurs in the direction of the Gradient vector itself.</p>
                     </li>
                  </ul>
               </div>
            </div>

            {/* Real World Applications */}
            <div className="space-y-16">
               <div className="text-center space-y-4">
                  <h3 className="text-3xl font-black flex items-center justify-center gap-3">
                     <Globe className="strawberry-text w-8 h-8" /> 
                     Real-World <span className="strawberry-text">Menu</span>
                  </h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ApplicationCard icon={TrendingUp} title="Economics" color="#FFB7C5" desc="Companies use partial derivatives to calculate marginal revenue and optimize profit per price increase." />
                  <ApplicationCard icon={CloudSun} title="Weather" color="#A8C69F" desc="Meteorologists track temperature gradients over space and time to predict storms and cold fronts." />
                  <ApplicationCard icon={Construction} title="Engineering" color="#FFB7C5" desc="Optimize material density vs weight for bridges by calculating how stress varies across beams." />
                  <ApplicationCard icon={Activity} title="Medicine" color="#A8C69F" desc="MRI scans use rates of signal change in X and Y directions to reconstruct clear 3D images of tissue." />
                  <ApplicationCard icon={MapPin} title="Navigation" color="#A8C69F" desc="GPS finds the steepest uphill path using gradients to help hikers or rescue teams plan safe routes." />
                  <ApplicationCard icon={Cpu} title="AI Training" color="#FFB7C5" desc="Neural networks learn through gradient descent, 'climbing down' error surfaces to find best models." />
                  <ApplicationCard icon={Gamepad2} title="Graphics" color="#FFB7C5" desc="Games use directional derivatives to calculate surface light reflection for realistic 3D shadows." />
                  <ApplicationCard icon={CarFront} title="Self-Driving" color="#A8C69F" desc="Autopilot systems use gradients of cost functions to decide the safest direction to steer the vehicle." />
               </div>
            </div>
          </div>
        )}

        {currentPage === Page.PARTIAL && (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black uppercase tracking-widest text-[#4A5A4B]">The <span className="strawberry-text">Partial</span> Slicer</h2>
              <button onClick={handleImageUpload} className="p-4 bg-white border-2 border-[#FFD1DC] rounded-2xl shadow-sm hover:bg-[#FDF2F2] transition-colors group">
                 <Camera className="w-6 h-6 strawberry-text group-hover:rotate-12 transition-transform" />
              </button>
            </div>

            <div className="cafe-bubble p-8 flex flex-col lg:flex-row gap-8 items-center border-4 border-[#A8C69F]/10">
               <div className="flex-1 w-full"><SmoothFunctionBar currentValue={expression} isValid={true} onFunctionChange={setExpression} /></div>
               <div className="flex gap-3 p-3 bg-[#F1F8F1] rounded-3xl">
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-2">X-Coord</span>
                    <input type="number" value={point.x} onChange={e => setPoint({...point, x: parseFloat(e.target.value) || 0})} className="w-20 p-4 bg-white rounded-2xl text-center font-black strawberry-text border-2 border-transparent focus:border-[#FFB7C5] outline-none" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] font-black uppercase text-slate-400 mb-2">Y-Coord</span>
                    <input type="number" value={point.y} onChange={e => setPoint({...point, y: parseFloat(e.target.value) || 0})} className="w-20 p-4 bg-white rounded-2xl text-center font-black strawberry-text border-2 border-transparent focus:border-[#FFB7C5] outline-none" />
                  </div>
               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
               <div className="lg:col-span-8 bg-white rounded-[3rem] border-4 border-[#A8C69F]/10 shadow-2xl overflow-hidden h-[600px]">
                  <SurfacePlot3D expression={expression} point={point} />
               </div>
               <div className="lg:col-span-4 flex flex-col gap-6">
                  <div className="cafe-bubble p-8 space-y-6 bg-gradient-to-br from-white to-[#F1F8F1]">
                     <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A8C69F]">Measurements</h4>
                     <div className="space-y-4">
                        <div className="flex justify-between items-center p-5 bg-white rounded-2xl border-2 border-[#A8C69F]/10 shadow-sm">
                           <span className="font-black text-slate-400 text-xs">∂f/∂x:</span>
                           <span className="font-black strawberry-text text-2xl">{results?.val_x?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-5 bg-white rounded-2xl border-2 border-[#A8C69F]/10 shadow-sm">
                           <span className="font-black text-slate-400 text-xs">∂f/∂y:</span>
                           <span className="font-black strawberry-text text-2xl">{results?.val_y?.toFixed(2)}</span>
                        </div>
                     </div>
                  </div>
                  <div className="cafe-bubble p-10 flex-1 overflow-auto bg-white/70">
                     <div className="flex items-center gap-2 mb-4">
                        <Brain className="w-5 h-5 strawberry-text" />
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#709078]">Chef's Recipe</h4>
                     </div>
                     {loading ? (
                        <div className="animate-pulse space-y-4">
                           <div className="h-4 bg-slate-100 rounded w-full"></div>
                           <div className="h-4 bg-slate-100 rounded w-5/6"></div>
                        </div>
                     ) : (
                        <div className="analysis-content text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation }} />
                     )}
                  </div>
               </div>
            </div>
          </div>
        )}

        {currentPage === Page.DIRECTIONAL && (
          <div className="space-y-10">
            <h2 className="text-3xl font-black uppercase tracking-widest text-[#4A5A4B]">The <span className="strawberry-text">Path</span> Finder</h2>
            
            <div className="cafe-bubble p-10 space-y-10 border-4 border-[#A8C69F]/10">
               <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-end">
                  <div className="md:col-span-1">
                    <p className="text-[10px] font-black text-slate-400 mb-3 px-4 uppercase tracking-widest">Recipe Formula</p>
                    <input value={expression} onChange={e => setExpression(e.target.value)} className="w-full p-6 bg-[#F1F8F1] rounded-3xl font-black math-font text-lg border-2 border-transparent focus:border-[#FFD1DC] outline-none shadow-inner" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 mb-3 px-4 uppercase tracking-widest text-center">Starting Point (x,y)</p>
                    <div className="flex gap-2">
                       <input type="number" value={point.x} onChange={e => setPoint({...point, x: parseFloat(e.target.value) || 0})} className="w-1/2 p-6 bg-white border-2 border-slate-50 rounded-3xl text-center font-black strawberry-text" />
                       <input type="number" value={point.y} onChange={e => setPoint({...point, y: parseFloat(e.target.value) || 0})} className="w-1/2 p-6 bg-white border-2 border-slate-50 rounded-3xl text-center font-black strawberry-text" />
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-black strawberry-text mb-3 px-4 uppercase tracking-widest text-center">Heading (u,v)</p>
                    <div className="flex gap-2">
                       <input type="number" value={direction.u} onChange={e => setDirection({...direction, u: parseFloat(e.target.value) || 0})} className="w-1/2 p-6 matcha-bg text-white rounded-3xl text-center font-black shadow-lg" />
                       <input type="number" value={direction.v} onChange={e => setDirection({...direction, v: parseFloat(e.target.value) || 0})} className="w-1/2 p-6 matcha-bg text-white rounded-3xl text-center font-black shadow-lg" />
                    </div>
                  </div>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-8 bg-white rounded-[3rem] border-2 border-slate-100 shadow-2xl overflow-hidden h-[600px]">
                     <SurfacePlot3D expression={expression} point={point} />
                  </div>
                  <div className="lg:col-span-4 flex flex-col gap-6">
                     <div className="cafe-bubble p-12 text-center space-y-6 bg-gradient-to-br from-white to-[#FDF2F2]">
                        <div className="inline-flex items-center gap-2 strawberry-text mb-2">
                           <Navigation className="w-8 h-8 floating" />
                           <h4 className="font-black text-2xl uppercase tracking-widest">Path Slope</h4>
                        </div>
                        <p className="text-8xl font-black strawberry-text drop-shadow-md">{results?.directionalDeriv?.toFixed(3)}</p>
                        <div className="pt-8 grid grid-cols-2 gap-4 text-[10px] font-black text-[#709078] uppercase tracking-widest">
                           <div className="p-4 bg-white rounded-2xl border-2 border-slate-50">
                              <p className="mb-2 opacity-50">Heading</p>
                              <p className="text-[#4A5A4B] text-xs">({results?.u?.toFixed(1)}, {results?.v?.toFixed(1)})</p>
                           </div>
                           <div className="p-4 bg-white rounded-2xl border-2 border-slate-50">
                              <p className="mb-2 opacity-50">Gradient</p>
                              <p className="text-[#4A5A4B] text-xs">({results?.vx?.toFixed(1)}, {results?.vy?.toFixed(1)})</p>
                           </div>
                        </div>
                     </div>
                     <div className="cafe-bubble p-10 flex-1 overflow-auto bg-white/90">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#A8C69F] mb-4">Discovery Notes</h4>
                        <div className="analysis-content text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: explanation }} />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        )}

      </main>

      <footer className="py-24 border-t border-slate-100 text-center space-y-8 bg-white/30 backdrop-blur-sm">
         <div className="flex justify-center gap-6">
            <div className="w-12 h-12 matcha-bg rounded-2xl shadow-xl floating"></div>
            <div className="w-12 h-12 strawberry-bg rounded-2xl shadow-xl floating" style={{animationDelay: '0.6s'}}></div>
            <div className="w-12 h-12 bg-white border-4 border-[#A8C69F]/20 rounded-2xl shadow-xl floating" style={{animationDelay: '1.2s'}}></div>
         </div>
         <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-[1em]">MatchaBerry Calculus Cafe</p>
            <div className="flex flex-col items-center gap-2">
               <p className="text-sm font-bold text-[#A8C69F]">© 2025 Made with Pastel Love</p>
               <p className="text-xs font-black uppercase tracking-widest text-[#709078] bg-[#F1F8F1] px-6 py-2 rounded-full">
                  amani — faqihah — zu
               </p>
            </div>
         </div>
      </footer>
    </div>
  );
};

export default App;
