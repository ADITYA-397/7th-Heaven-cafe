"use client";
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { collection, updateDoc, doc, addDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useRouter } from 'next/navigation';
import { NotificationPopover } from '../../components/NotificationPopover';
import InvoiceModal from '../../components/InvoiceModal';
import {
  FileText, Trash2, Receipt, ArrowUp, ArrowDown,
  LayoutDashboard, ShoppingBag, UtensilsCrossed,
  LogOut, Search, ChevronRight, ChevronLeft, Plus,
  TrendingUp, Package, Clock, CheckCircle2, Truck,
  BarChart3, RefreshCw, Image as ImageIcon, X, ChevronDown,
  Coffee, Menu, Settings, HelpCircle, Download, Calendar
} from 'lucide-react';

// ─── Config ──────────────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  Accepted:          { label: 'Accepted',  color: 'bg-blue-50 text-blue-600 border-blue-100',         dot: 'bg-blue-500' },
  Preparing:         { label: 'Preparing', color: 'bg-amber-50 text-amber-600 border-amber-100',       dot: 'bg-amber-500' },
  'Out for Delivery':{ label: 'Delivery',  color: 'bg-violet-50 text-violet-600 border-violet-100',    dot: 'bg-violet-500' },
  Delivered:         { label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500' },
};
const TABS = [
  { id: 'dashboard', label: 'Overview',    icon: LayoutDashboard },
  { id: 'orders',    label: 'Orders',      icon: ShoppingBag },
  { id: 'menu',      label: 'Menu Editor', icon: UtensilsCrossed },
];
const ORDER_FILTERS = ['All', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];
const MO = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// ─── SVG Area Chart ───────────────────────────────────────────────────────────
function AreaChart({ data, labels }) {
  const [W, setW] = useState(700);
  const containerRef = useRef(null);
  useEffect(() => {
    const observer = new ResizeObserver(entries => {
      if(entries[0] && entries[0].contentRect.width > 0) setW(entries[0].contentRect.width);
    });
    if(containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const H=150, PL=24, PR=12, PT=10, PB=16;
  const cw=W-PL-PR, ch=H-PT-PB;
  const max=Math.max(...data,1);
  const pts=data.map((v,i)=>[PL+(i/(data.length-1))*cw, PT+(1-v/max)*ch]);
  const line=pts.reduce((d,[x,y],i)=>{
    if(i===0) return 'M '+x.toFixed(1)+' '+y.toFixed(1);
    const [px,py]=pts[i-1], t=(x-px)/2.5;
    return d+' C '+(px+t).toFixed(1)+' '+py.toFixed(1)+','+(x-t).toFixed(1)+' '+y.toFixed(1)+','+x.toFixed(1)+' '+y.toFixed(1);
  },'');
  const lp=pts[pts.length-1], fp=pts[0];
  const area=line+' L '+lp[0].toFixed(1)+' '+(PT+ch)+' L '+fp[0].toFixed(1)+' '+(PT+ch)+' Z';
  
  const peakIdx=data.indexOf(Math.max(...data));
  const [px,py]=pts[peakIdx]||pts[0];
  const peakValue = data[peakIdx];
  const peakLabel = labels[peakIdx] || '';
  
  const yMarks=Array.from({length:5},(_,i)=>({val:Math.round(max*(4-i)/4),y:PT+(i/4)*ch}));
  
  if(data.every(v=>v===0)) return (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-200" style={{height:H}}>
      <p className="text-sm font-medium">No revenue data yet</p>
    </div>
  );
  
  return (
    <div ref={containerRef} className="w-full" style={{ height: H }}>
      <svg viewBox={"0 0 "+W+" "+H} width="100%" style={{height:H, overflow: 'visible'}}>
        <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ea580c" stopOpacity="0.15"/>
          <stop offset="100%" stopColor="#ea580c" stopOpacity="0"/>
        </linearGradient>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.06"/>
        </filter>
      </defs>
      
      {/* Grid lines */}
      {yMarks.map(({val,y},i)=>(
        <g key={i}>
          <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="5 5"/>
          <text x={PL-8} y={y+4} textAnchor="end" fontSize="12" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">
            {val>=1000?('₹'+(val/1000).toFixed(0)+'k'):('₹'+val)}
          </text>
        </g>
      ))}
      
      {/* Chart Area and Line */}
      <path d={area} fill="url(#ag)"/>
      <path d={line} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      
      {/* X-axis labels */}
      {labels.map((l,i)=>(
        <text key={i} x={PL+(i/(labels.length-1))*cw} y={H-2} textAnchor="middle" fontSize="12" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">{l}</text>
      ))}
      
      {/* Tooltip on the peak */}
      <line x1={px-15} y1={py} x2={px} y2={py} stroke="#ea580c" strokeWidth="1.5"/>
      <circle cx={px} cy={py} r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2"/>
      
      {/* Tooltip Box */}
      <g transform={`translate(${px - 110}, ${py - 26})`}>
        <rect x="0" y="0" width="95" height="52" rx="10" fill="#ffffff" filter="url(#shadow)"/>
        <text x="14" y="22" textAnchor="start" fontSize="13" fill="#ea580c" fontFamily="system-ui" fontWeight="700">
          ₹{(peakValue||0).toLocaleString()}
        </text>
        <text x="14" y="40" textAnchor="start" fontSize="11" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">
          22 {peakLabel}
        </text>
      </g>
    </svg>
    </div>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, accent, trend, trendUp, note, noteCount }) {
  // Spacing system: padding p-6 (24px)
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-gray-300 transition-all duration-200 cursor-pointer group flex flex-col justify-between" style={{ padding: "18px" }}>
      <div>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:accent+'15'}}>
            <Icon size={18} style={{color:accent}}/>
          </div>
          <span className="text-sm font-medium text-gray-500">{label}</span>
        </div>
        <div className="flex items-baseline gap-2 mb-4">
          <p className="text-2xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
          {trend && (
            <span className={"flex items-center gap-1 text-xs font-bold "+(trendUp?'text-emerald-500':'text-red-500')}>
              {trendUp?<ArrowUp size={12} strokeWidth={2.5}/>:<ArrowDown size={12} strokeWidth={2.5}/>}
              {trend}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-2">
        <span className="text-xs text-gray-400 font-medium">{noteCount?('+'+noteCount+' '):''}{note}</span>
        <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-600 transition-colors"/>
      </div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg=STATUS_CONFIG[status]||STATUS_CONFIG.Accepted;
  return (
    <span className={"inline-flex items-center gap-2 text-xs font-bold rounded-xl border "+cfg.color} style={{ padding: "6px 12px" }}>
      <span className={"w-1.5 h-1.5 rounded-full shrink-0 "+cfg.dot}/>
      {cfg.label}
    </span>
  );
}

// ─── Inline Status Select ─────────────────────────────────────────────────────
function StatusSelect({ orderId, current, onChange }) {
  const cfg = STATUS_CONFIG[current] || STATUS_CONFIG.Accepted;
  return (
    <div className="relative inline-flex items-center">
      <span className={"absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none " + cfg.dot} />
      <select value={current} onChange={e=>onChange(orderId,e.target.value)}
        className={"appearance-none text-xs font-bold rounded-xl border cursor-pointer outline-none transition-all " + cfg.color} style={{ padding: "8px 32px 8px 24px" }}>
        <option value="Accepted">Accepted</option>
        <option value="Preparing">Preparing</option>
        <option value="Out for Delivery">Delivery</option>
        <option value="Delivered">Delivered</option>
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" />
    </div>
  );
}

// ─── Vertical Status Bar ──────────────────────────────────────────────────────
function VertBar({ label, pct, color, maxPct }) {
  const MAX_H=60, h=maxPct>0?Math.round((pct/maxPct)*MAX_H):0;
  return (
    <div className="flex flex-col items-center gap-3 flex-1">
      <span className="text-xs font-bold rounded-lg text-white shadow-sm" style={{background:color, padding: "4px 8px"}}>{pct}%</span>
      <div className="w-full max-w-[40px] rounded-t-2xl transition-all duration-700" style={{height:h||4,background:color,opacity:0.85}}/>
      <span className="text-xs font-semibold text-gray-500 text-center leading-tight">{label}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab]           = useState('dashboard');
  const [orders, setOrders]                 = useState([]);
  const [menu, setMenu]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [notifications, setNotifications]   = useState([]);
  const isFirstLoad = useRef(true);

  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');
  const [menuSearch, setMenuSearch]   = useState('');

  const [newItem, setNewItem]               = useState({ name:'', category:'', price:'', inStock:true });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile]     = useState(null);
  const [filePreview, setFilePreview]       = useState(null);
  const [showAddForm, setShowAddForm]       = useState(false);

  const [selectedOrder, setSelectedOrder]   = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen]       = useState(true);
  const [mobileOpen, setMobileOpen]         = useState(false);

  useEffect(() => { if (profile && profile.role !== 'admin') router.push('/'); }, [profile, router]);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;
    const unsubO = onSnapshot(collection(db,'orders'), snap => {
      const list = snap.docs.map(d => ({ id:d.id, ...d.data() }));
      list.sort((a,b) => new Date(b.timestamp)-new Date(a.timestamp));
      if (!isFirstLoad.current) {
        snap.docChanges().forEach(ch => {
          const o = { id:ch.doc.id, ...ch.doc.data() };
          if (ch.type==='added') setNotifications(p=>[{id:'n'+Date.now(),title:'New Order',description:(o.customerName||'Guest')+' \u2022 ₹'+o.total,timestamp:new Date(),read:false},...p]);
        });
      }
      setOrders(list); setLoading(false); isFirstLoad.current=false;
    });
    const unsubM = onSnapshot(collection(db,'menu'), snap => { setMenu(snap.docs.map(d=>({id:d.id,...d.data()}))); });
    return () => { unsubO(); unsubM(); };
  }, [profile]);

  useEffect(() => {
    if (!selectedFile) { setFilePreview(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const totalRevenue  = useMemo(() => orders.reduce((s,o)=>s+(o.status==='Delivered'?Number(o.total):0),0), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o=>o.status!=='Delivered').length, [orders]);
  const todayOrders   = useMemo(() => {
    const t=new Date();
    return orders.filter(o=>{ if(!o.timestamp)return false; const d=new Date(o.timestamp); return d.getDate()===t.getDate()&&d.getMonth()===t.getMonth()&&d.getFullYear()===t.getFullYear(); }).length;
  }, [orders]);

  const filteredOrders = useMemo(() => {
    let list=orderFilter==='All'?orders:orders.filter(o=>o.status===orderFilter);
    if(orderSearch.trim()){ const q=orderSearch.toLowerCase(); list=list.filter(o=>o.id.toLowerCase().includes(q)||(o.customerName||'').toLowerCase().includes(q)); }
    return list;
  }, [orders, orderFilter, orderSearch]);

  const filteredMenu = useMemo(() => {
    if(!menuSearch.trim()) return menu;
    const q=menuSearch.toLowerCase();
    return menu.filter(i=>i.name?.toLowerCase().includes(q)||i.category?.toLowerCase().includes(q));
  }, [menu, menuSearch]);

  const monthlyRevenue = useMemo(() => {
    const now=new Date();
    return Array.from({length:12},(_,i)=>{
      const d=new Date(now.getFullYear(),now.getMonth()-11+i,1);
      return orders.filter(o=>{
        if(!o.timestamp||o.status!=='Delivered') return false;
        const od=new Date(o.timestamp);
        return od.getMonth()===d.getMonth()&&od.getFullYear()===d.getFullYear();
      }).reduce((s,o)=>s+Number(o.total),0);
    });
  }, [orders]);

  const chartLabels = useMemo(() => {
    const now=new Date();
    return Array.from({length:12},(_,i)=>{ const d=new Date(now.getFullYear(),now.getMonth()-11+i,1); return MO[d.getMonth()]; });
  }, []);

  const statusBars = useMemo(() => {
    const total=orders.length||1, get=s=>orders.filter(o=>o.status===s).length;
    return [
      { label:'Accepted',  pct:Math.round((get('Accepted')/total)*100),  color:'#6366F1' },
      { label:'Preparing', pct:Math.round((get('Preparing')/total)*100), color:'#F59E0B' },
      { label:'Delivered', pct:Math.round((get('Delivered')/total)*100), color:'#10B981' },
    ];
  }, [orders]);

  const menuPerf = useMemo(() => {
    const counts={};
    orders.forEach(o=>o.items?.forEach(i=>{ counts[i.name]=(counts[i.name]||0)+(i.qty||1); }));
    const sorted=Object.entries(counts).sort(([,a],[,b])=>b-a).slice(0,4); // Show top 4
    const maxC=sorted[0]?.[1]||1;
    return sorted.map(([name,count],i)=>({ name, count, pct:Math.round((count/maxC)*100), color:['#F97316','#6366F1','#10B981','#3B82F6'][i] }));
  }, [orders]);

  const handleFileUpload = e => { if(e.target.files[0]) setSelectedFile(e.target.files[0]); };
  const addMenuItem = async e => {
    e.preventDefault();
    let imageUrl='';
    if(selectedFile){
      const sr=ref(storage,'menu/'+Date.now()+'_'+selectedFile.name);
      const task=uploadBytesResumable(sr,selectedFile);
      await new Promise((res,rej)=>task.on('state_changed',s=>setUploadProgress(s.bytesTransferred/s.totalBytes*100),rej,async()=>{imageUrl=await getDownloadURL(task.snapshot.ref);res();}));
    }
    try {
      await addDoc(collection(db,'menu'),{...newItem,price:Number(newItem.price),image:imageUrl});
      setNewItem({name:'',category:'',price:'',inStock:true}); setSelectedFile(null); setUploadProgress(0); setShowAddForm(false);
    } catch(err){ console.error(err); }
  };
  const toggleStock  = async item => updateDoc(doc(db,'menu',item.id),{inStock:!item.inStock});
  const updateStatus = async (id,status) => updateDoc(doc(db,'orders',id),{status});
  const deleteMenuItem = async (id,name) => { if(window.confirm('Delete "'+name+'"?')) await deleteDoc(doc(db,'menu',id)); };
  const deleteOrder    = async id => { if(window.confirm('Delete this order?')) await deleteDoc(doc(db,'orders',id)); };
  const handleLogout   = async () => { await logout(); router.push('/'); };

  if (!profile || profile.role !== 'admin') return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"/>
        <p className="text-base text-gray-500 font-medium">Verifying access\u2026</p>
      </div>
    </div>
  );

  const initial    = profile?.name?.[0]?.toUpperCase()||'A';
  const todayStr   = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'2-digit',year:'numeric'});
  const shortDate  = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const tabLabel   = activeTab==='dashboard'?'Overview':activeTab==='orders'?'Orders':'Menu Editor';
  const maxStatPct = Math.max(...statusBars.map(s=>s.pct),1);

  const SidebarContent = ({ mini }) => (
    <>
      <nav className={"flex-1"} style={{ padding: mini?"24px 12px":"24px 16px" }}>
        {TABS.map(({id,label,icon:Icon})=>{
          const active=activeTab===id;
          const badge=id==='orders'&&pendingOrders>0?pendingOrders:null;
          return (
            <button key={id} onClick={()=>{setActiveTab(id);setMobileOpen(false);}} title={mini?label:undefined}
              className={"w-full flex items-center gap-4 rounded-2xl text-sm font-semibold transition-all mb-2 relative group "+(active?'bg-[#FFF4EC] text-[#F97316]':'text-gray-500 hover:bg-gray-50 hover:text-gray-900')+(mini?' justify-center':'')} style={{ padding: "12px 16px" }}>
              <Icon size={20} className="shrink-0"/>
              {!mini && <span className="flex-1 text-left">{label}</span>}
              {badge&&!mini && <span className="bg-[#F97316] text-white text-[11px] font-bold min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1.5">{badge}</span>}
              {badge&&mini && <span className="absolute top-2 right-2 w-2 h-2 bg-[#F97316] rounded-full"/>}
              {mini && <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-sm px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-xl">{label}</div>}
            </button>
          );
        })}
      </nav>

      <div className={"border-t border-gray-100"} style={{ padding: mini?"24px 12px":"24px 16px" }}>
        {[{label:'Settings',icon:Settings},{label:'Help Center',icon:HelpCircle}].map(({label,icon:Icon})=>(
          <button key={label} title={mini?label:undefined}
            className={"w-full flex items-center gap-4 rounded-2xl text-sm text-gray-500 font-medium hover:bg-gray-50 hover:text-gray-900 transition-all mb-1 "+(mini?'justify-center':'')} style={{ padding: "10px 16px" }}>
            <Icon size={18} className="shrink-0"/>
            {!mini&&label}
          </button>
        ))}
        <div className={"flex items-center gap-4 mt-6 pt-6 border-t border-gray-100 "+(mini?'justify-center':'')} style={{ padding: "0 16px" }}>
          <div className="w-9 h-9 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-base shrink-0 shadow-sm">{initial}</div>
          {!mini&&<>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-gray-900 truncate">{profile?.name||'Admin'}</p>
              <p className="text-xs text-gray-400 font-medium mt-0.5">Administrator</p>
            </div>
            <button onClick={handleLogout} className="text-gray-300 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50 flex items-center justify-center shrink-0" style={{ padding: "8px" }}><LogOut size={18}/></button>
          </>}
        </div>
        {mini&&<button onClick={handleLogout} className="w-full flex justify-center py-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors mt-2"><LogOut size={18}/></button>}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-800">

      {/* Mobile overlay */}
      {mobileOpen&&<div className="fixed inset-0 bg-black/40 z-[100] lg:hidden backdrop-blur-sm" onClick={()=>setMobileOpen(false)}/>}

      {/* Mobile sidebar */}
      <aside className={"fixed inset-y-0 left-0 z-[101] w-64 bg-white flex flex-col shadow-2xl transition-transform duration-300 lg:hidden "+(mobileOpen?'translate-x-0':'-translate-x-full')}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#F97316] rounded-2xl flex items-center justify-center shadow-sm"><Coffee size={18} className="text-white"/></div>
            <div><p className="font-bold text-gray-900 text-base">7th Heaven</p><p className="text-xs text-gray-500 font-medium">Cafe Admin</p></div>
          </div>
          <button onClick={()=>setMobileOpen(false)} className="text-gray-400 p-2 rounded-xl hover:bg-gray-50 transition-colors"><X size={20}/></button>
        </div>
        <SidebarContent mini={false}/>
      </aside>

      {/* Desktop sidebar */}
      <aside className={"hidden lg:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0 transition-all duration-300 overflow-hidden "+(sidebarOpen?'w-64':'w-[88px]')}>
        <div className={"flex items-center gap-3 border-b border-gray-100 relative "+(!sidebarOpen?'justify-center px-0':'')} style={{ padding: sidebarOpen?"24px 20px":"24px 0" }}>
          <div className="w-9 h-9 bg-[#F97316] rounded-2xl flex items-center justify-center shrink-0 shadow-sm"><Coffee size={18} className="text-white"/></div>
          {sidebarOpen&&<>
            <div className="min-w-0 flex-1 flex flex-col justify-center"><p className="font-bold text-gray-900 text-lg leading-none mb-1">7th Heaven</p><p className="text-xs text-gray-500 font-medium">Cafe Admin</p></div>
            <button onClick={()=>setSidebarOpen(false)} className="text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-50 shrink-0 transition-colors flex items-center justify-center" style={{ padding: "8px" }}><ChevronLeft size={18}/></button>
          </>}
          {!sidebarOpen&&<button onClick={()=>setSidebarOpen(true)} className="absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 bg-white border border-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F97316] shadow-md z-10 transition-colors"><ChevronRight size={14}/></button>}
        </div>
        <SidebarContent mini={!sidebarOpen}/>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F8FAFC]" style={{ padding: "32px", gap: "24px" }}>

        {/* Header */}
        <header className="bg-white border border-gray-100 rounded-2xl flex items-center justify-between sticky top-0 z-30 gap-x-8 gap-y-12 shadow-sm" style={{ padding: "16px 24px" }}>
          <div className="flex items-center gap-4">
            <button onClick={()=>setMobileOpen(true)} className="lg:hidden w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-50"><Menu size={20}/></button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-none">{tabLabel}</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-[#F8FAFC] border border-gray-100 rounded-2xl h-11 w-48 focus-within:border-orange-200 focus-within:bg-white focus-within:shadow-sm transition-all" style={{ padding: "0 16px" }}>
              <Search size={16} className="text-gray-400 mr-3 shrink-0"/>
              <input type="text" placeholder="Search everywhere\u2026" className="bg-transparent border-none outline-none w-full text-sm font-medium placeholder:text-gray-400 text-gray-900" onChange={e=>{setOrderSearch(e.target.value);setMenuSearch(e.target.value);}}/>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-100 rounded-xl h-11" style={{ padding: "0 16px" }}>
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"/></span>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Live Sync</span>
            </div>
            <NotificationPopover notifications={notifications} onNotificationsChange={setNotifications}
              buttonClassName="w-11 h-11 flex items-center justify-center rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all"
              popoverClassName="bg-white border border-gray-100 shadow-xl rounded-2xl"
              textColor="text-gray-900" hoverBgColor="hover:bg-gray-50" dividerColor="divide-gray-100" headerBorderColor="border-gray-100"/>
            <div className="w-11 h-11 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm">{initial}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">

          {/* ═════ OVERVIEW ═════ */}
          {activeTab==='dashboard'&&(
            <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto">

              {/* Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-8">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-2">{todayStr}</p>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back, {profile?.name?.split(' ')[0]||'Admin'}!</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-2xl text-sm font-medium text-gray-500 shadow-sm" style={{ padding: "12px 16px" }}>
                    <Calendar size={16} className="text-gray-400"/>Valuation data as of {shortDate}
                  </div>
                  <button className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl text-sm font-bold transition-all shadow-sm shadow-orange-200/50 active:scale-95" style={{ padding: "12px 24px" }}>
                    <Download size={16}/>Export Data
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                <KpiCard label="Total Revenue"  value={'₹'+totalRevenue.toLocaleString()} icon={TrendingUp} accent="#F97316" trend="12.5%" trendUp note="from last month" noteCount={todayOrders}/>
                <KpiCard label="Total Orders"   value={orders.length}  icon={ShoppingBag} accent="#6366F1" trend="8.2%" trendUp note="from last month"/>
                <KpiCard label="Pending Orders" value={pendingOrders}  icon={Clock}       accent="#F59E0B" trend="3.1%" trendUp={false} note="need attention"/>
                <KpiCard label="Active Menu Items" value={menu.length} icon={Package}     accent="#10B981" trend="1.5%" trendUp note="currently live"/>
              </div>

              {/* Row: Area chart + Status bars */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">

                {/* Revenue area chart */}
                <div className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] w-full flex flex-col h-full" style={{ padding: "18px" }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-[22px] font-bold text-[#1e293b] tracking-tight">Sales Analytics</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full shadow-sm" style={{ padding: "8px 16px" }}>
                        <Calendar size={15} className="text-gray-400"/>
                        <span className="text-[13px] font-semibold text-gray-500">Sep 22, 2026</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center w-full mt-12 mb-2"><AreaChart data={monthlyRevenue} labels={chartLabels}/></div>
                </div>

                {/* Order status breakdown */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] flex flex-col" style={{ padding: "18px" }}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Traffic</h3>
                    <button className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-50 transition-colors"><Search size={14}/></button>
                  </div>
                  <div className="flex bg-[#F8FAFC] rounded-xl mb-4 border border-gray-100" style={{ padding: "4px" }}>
                    <button className="flex-1 text-sm font-bold rounded-lg text-gray-500 hover:text-gray-900 transition-colors" style={{ padding: "8px 0" }}>Week</button>
                    <button className="flex-1 text-sm font-bold rounded-lg bg-white text-[#F97316] shadow-sm" style={{ padding: "8px 0" }}>Month</button>
                  </div>
                  <div className="flex-1 flex items-end justify-around gap-4 pb-2">
                    {statusBars.map((s,i)=><VertBar key={i} label={s.label} pct={s.pct} color={s.color} maxPct={maxStatPct}/>)}
                  </div>
                  <div className="border-t border-gray-100 flex justify-center gap-8" style={{ paddingTop: "16px", marginTop: "16px" }}>
                     {statusBars.map((s,i)=>(
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-md" style={{background:s.color}}/>
                        <span className="text-xs font-bold text-gray-500">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Row: Recent orders table + Menu performance */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 pb-8">

                {/* Recent orders */}
                <div className="bg-white rounded-2xl border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] flex flex-col" style={{ padding: "18px" }}>
                  <div className="flex items-center justify-between px-6 lg:px-8 py-6 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Top Selling</h3>
                    <div className="flex items-center gap-3">
                      <button className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all" style={{ padding: "8px 16px" }}>
                        <Calendar size={14}/> Sort by
                      </button>
                      <button onClick={()=>setActiveTab('orders')} className="flex items-center gap-2 text-sm font-semibold text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all" style={{ padding: "8px 16px" }}>
                        <Download size={14}/> Export
                      </button>
                    </div>
                  </div>
                  <div className="flex-1 overflow-x-auto">
                    <div className="min-w-[600px] px-6 lg:px-8">
                      <div className="grid grid-cols-[1fr_auto_100px_auto] gap-8 py-4 border-b border-gray-100">
                        {['Product Info','Status','Sold','Total Earning'].map(h=>(
                          <span key={h} className={"text-xs font-bold text-gray-400 uppercase tracking-wider "+(h==='Total Earning'?'text-right':'')}>{h}</span>
                        ))}
                      </div>
                      {loading ? (
                        <div className="py-12 text-center text-sm font-medium text-gray-400">Loading\u2026</div>
                      ) : orders.length===0 ? (
                        <div className="py-12 flex flex-col items-center gap-3 text-gray-300"><Receipt size={32} className="opacity-50"/><p className="text-sm font-medium">No orders yet</p></div>
                      ) : orders.slice(0,6).map(o=>(
                        <div key={o.id} className="grid grid-cols-[1fr_auto_100px_auto] gap-8 py-5 items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-[#F8FAFC] border border-gray-100 rounded-2xl flex items-center justify-center shrink-0"><Coffee size={20} className="text-[#F97316]"/></div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-gray-900 truncate">{o.customerName||'Guest'}</p>
                              <p className="text-xs font-medium text-gray-500 truncate mt-1">Order #{o.id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                          <div className="w-28"><StatusPill status={o.status}/></div>
                          <p className="text-sm font-bold text-gray-700">{o.items?.reduce((s,i)=>s+(i.qty||1),0)||1} Pcs</p>
                          <div className="flex items-center justify-end gap-4">
                            <p className="text-sm font-bold text-gray-900 w-20 text-right">₹{o.total}</p>
                            <button onClick={()=>{setSelectedOrder(o);setIsInvoiceOpen(true);}} className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-[#F97316] hover:border-orange-200 shadow-sm transition-all"><FileText size={14}/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Menu performance */}
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] flex flex-col" style={{ padding: "18px" }}>
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-gray-900">Product Sales</h3>
                    <select className="bg-transparent text-sm font-bold text-gray-500 outline-none cursor-pointer hover:text-gray-900">
                      <option>Last Month</option>
                      <option>This Month</option>
                    </select>
                  </div>
                  {menuPerf.length===0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-300"><Package size={32} className="opacity-50"/><p className="text-sm font-medium">No data yet</p></div>
                  ) : (
                    <div className="flex flex-col gap-10 flex-1">
                      {menuPerf.map((item,i)=>(
                        <div key={i} className="flex flex-col gap-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-bold text-gray-600 truncate pr-4">{item.name}</span>
                            <span className="text-sm font-bold text-gray-900 shrink-0">{item.count} <span className="text-emerald-500 text-xs ml-1">\u2197 {Math.max(1,Math.round(item.pct*0.08))}%</span></span>
                          </div>
                          <div className="h-3 bg-[#F8FAFC] rounded-full overflow-hidden border border-gray-100">
                            <div className="h-full rounded-full transition-all duration-700 relative" style={{width:item.pct+'%',background:item.color}}>
                              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 rounded-full"/>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            </div>
          )}

          {/* ═════ ORDERS TAB ═════ */}
          {activeTab==='orders'&&(
            <div className="flex flex-col gap-8 w-full max-w-[1600px] mx-auto pb-20" style={{ padding: "32px" }}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center bg-white border border-gray-200 rounded-2xl h-14 shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all" style={{ padding: "0 20px" }}>
                  <Search size={18} className="text-gray-400 shrink-0"/>
                  <input type="text" placeholder="Search by customer name or order ID\u2026" value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} className="bg-transparent border-none outline-none w-full text-base placeholder:text-gray-400 text-gray-900 font-medium"/>
                </div>
                <div className="flex flex-wrap gap-3">
                  {ORDER_FILTERS.map(f=>{
                    const count=f==='All'?orders.length:orders.filter(o=>o.status===f).length;
                    const active=orderFilter===f;
                    return (
                      <button key={f} onClick={()=>setOrderFilter(f)}
                        className={"rounded-xl text-sm font-bold border transition-all whitespace-nowrap "+(active?'bg-[#F97316] text-white border-[#F97316] shadow-sm':'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50')} style={{ padding: "10px 20px" }}>
                        {f} <span className={"rounded-lg text-xs "+(active?'bg-white/20':'bg-gray-100 text-gray-500')} style={{ padding: "2px 8px", marginLeft: "8px" }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-20 text-gray-500 font-medium text-lg">Loading orders\u2026</div>
              ) : filteredOrders.length===0 ? (
                <div className="text-center py-32 flex flex-col items-center gap-4 text-gray-300"><Receipt size={64}/><p className="font-bold text-2xl text-gray-400">No orders found</p></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden mt-4">
                  <div className="hidden md:flex items-center border-b border-gray-100 bg-[#F8FAFC]" style={{ padding: "20px 32px" }}>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 shrink-0">Order ID</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex-1">Customer & Items</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-48 shrink-0">Status</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-32 shrink-0 text-right">Total</span>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider w-24 shrink-0 text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {filteredOrders.map(o=>(
                      <div key={o.id}>
                        <div className="hidden md:flex items-center hover:bg-[#F8FAFC]/50 transition-colors border-b border-gray-100 last:border-0" style={{ padding: "24px 32px" }}>
                          <div className="w-32 shrink-0">
                            <p className="text-sm font-bold text-gray-900">#{o.id.slice(-6).toUpperCase()}</p>
                            {o.timestamp&&<p className="text-xs font-medium text-gray-500 mt-1">{new Date(o.timestamp).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>}
                          </div>
                          <div className="flex-1 min-w-0 pr-6">
                            <p className="text-base font-bold text-gray-900 truncate">{o.customerName||'Anonymous'}</p>
                            <p className="text-sm text-gray-500 truncate mt-1">{o.items?.map(i=>i.name+'\u00d7'+i.qty).join(', ')}</p>
                          </div>
                          <div className="w-48 shrink-0"><StatusSelect orderId={o.id} current={o.status} onChange={updateStatus}/></div>
                          <p className="w-32 shrink-0 text-base font-bold text-gray-900 text-right pr-4">₹{o.total}</p>
                          <div className="w-24 shrink-0 flex items-center justify-end gap-2.5">
                            <button onClick={()=>{setSelectedOrder(o);setIsInvoiceOpen(true);}} title="Invoice" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-[#F97316] hover:border-orange-200 shadow-sm transition-all"><FileText size={16}/></button>
                            <button onClick={()=>deleteOrder(o.id)} title="Delete" className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 hover:border-red-200 shadow-sm transition-all"><Trash2 size={16}/></button>
                          </div>
                        </div>
                        <div className="md:hidden px-6 py-6 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0"><Receipt size={20} className="text-orange-500"/></div>
                              <div>
                                <p className="text-base font-bold text-gray-900">#{o.id.slice(-6).toUpperCase()}</p>
                                <p className="text-sm font-medium text-gray-500 mt-0.5">{o.customerName||'Anonymous'}</p>
                              </div>
                            </div>
                            <StatusPill status={o.status}/>
                          </div>
                          <p className="text-sm text-gray-600 pl-16">{o.items?.map(i=>i.name+' x'+i.qty).join(', ')}</p>
                          <div className="flex items-center justify-between pt-4 mt-2 border-t border-gray-100">
                            <p className="text-lg font-bold text-gray-900">₹{o.total}</p>
                            <div className="flex items-center gap-3">
                              <StatusSelect orderId={o.id} current={o.status} onChange={updateStatus}/>
                              <button onClick={()=>{setSelectedOrder(o);setIsInvoiceOpen(true);}} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-orange-50 hover:text-[#F97316] shadow-sm transition-all"><FileText size={16}/></button>
                              <button onClick={()=>deleteOrder(o.id)} className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 shadow-sm transition-all"><Trash2 size={16}/></button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═════ MENU TAB ═════ */}
          {activeTab==='menu'&&(
            <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-20">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl h-14 w-full sm:max-w-[360px] shadow-sm focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all" style={{ padding: "0 20px" }}>
                  <Search size={18} className="text-gray-400 mr-3 shrink-0"/>
                  <input type="text" placeholder="Search menu items..." value={menuSearch} onChange={e=>setMenuSearch(e.target.value)} className="bg-transparent border-none outline-none w-full text-base placeholder:text-gray-400 text-gray-900 font-medium"/>
                  {menuSearch&&<button onClick={()=>setMenuSearch('')} className="text-gray-400 hover:text-gray-600 flex items-center justify-center" style={{ padding: "4px" }}><X size={16}/></button>}
                </div>
                <button onClick={()=>setShowAddForm(!showAddForm)} className="flex items-center gap-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-2xl text-sm font-bold transition-all shadow-sm shadow-orange-200/50 active:scale-95 whitespace-nowrap" style={{ padding: "14px 24px" }}>
                  {showAddForm ? <><X size={18}/> Cancel</> : <><Plus size={18}/> Add Menu Item</>}
                </button>
              </div>

              {showAddForm&&(
                <div className="bg-white rounded-2xl p-6 lg:p-8 border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-1.5 h-6 bg-[#F97316] rounded-full"/>
                    <h3 className="text-lg font-bold text-gray-900">Create New Item</h3>
                  </div>
                  <form onSubmit={addMenuItem}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-8">
                      {[{label:'Name',key:'name',placeholder:'e.g. Vintage Mocha',type:'text'},{label:'Category',key:'category',placeholder:'e.g. Beverages',type:'text'},{label:'Price (₹)',key:'price',placeholder:'0',type:'number'}].map(({label,key,placeholder,type})=>(
                        <div key={key} className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-gray-500">{label}</label>
                          <input type={type} placeholder={placeholder} required value={newItem[key]} onChange={e=>setNewItem({...newItem,[key]:e.target.value})} className="w-full rounded-xl bg-[#F8FAFC] border border-gray-200 text-base text-gray-900 font-medium outline-none focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-50 transition-all" style={{ padding: "14px 16px" }}/>
                        </div>
                      ))}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-gray-500">Photo</label>
                        <div>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="menu-img"/>
                          <label htmlFor="menu-img" className="flex items-center gap-3 w-full rounded-xl bg-[#F8FAFC] border border-gray-200 cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all" style={{ padding: "14px 16px" }}>
                            {filePreview?<img src={filePreview} alt="" className="w-7 h-7 rounded-lg object-cover shrink-0 shadow-sm"/>:<ImageIcon size={20} className="text-gray-400 shrink-0"/>}
                            <span className="text-sm font-bold text-gray-600 truncate">{selectedFile?selectedFile.name:'Choose image'}</span>
                          </label>
                          {uploadProgress>0&&uploadProgress<100&&<p className="text-xs text-[#F97316] font-bold mt-2">Uploading {uploadProgress.toFixed(0)}%</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-100 pt-6">
                      <div className="flex items-center gap-4 cursor-pointer" onClick={()=>setNewItem({...newItem,inStock:!newItem.inStock})}>
                        <div className={"w-12 h-7 rounded-full p-1 transition-all duration-300 "+(newItem.inStock?'bg-emerald-500':'bg-gray-300')}>
                          <div className={"w-5 h-5 bg-white rounded-full shadow-sm transform transition-transform duration-300 "+(newItem.inStock?'translate-x-5':'translate-x-0')}/>
                        </div>
                        <div>
                          <span className="text-base font-bold text-gray-900 block">{newItem.inStock?'In Stock':'Out of Stock'}</span>
                          <span className="text-xs text-gray-500 font-medium">Customers can order this item</span>
                        </div>
                      </div>
                      <button type="submit" className="rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm shadow-sm shadow-orange-200/50 transition-all" style={{ padding: "14px 32px" }}>Publish Item</button>
                    </div>
                  </form>
                </div>
              )}

              {filteredMenu.length===0 ? (
                <div className="text-center py-32 flex flex-col items-center gap-4 text-gray-300"><UtensilsCrossed size={64} className="opacity-50"/><p className="font-bold text-2xl text-gray-400">No items found</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredMenu.map(item=>(
                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-black/10 shadow-[0_0_20px_rgba(0,0,0,0.04)] hover:shadow-[0_0_25px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 group flex flex-col">
                      <div className="h-32 bg-[#F8FAFC] relative overflow-hidden">
                        {item.image?<img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"/>:<div className="w-full h-full flex items-center justify-center"><Coffee size={40} className="text-gray-300"/></div>}
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-md rounded-xl text-base font-bold text-gray-900 shadow-sm" style={{ padding: "6px 14px" }}>₹{item.price}</div>
                        <button onClick={()=>deleteMenuItem(item.id,item.name)} className="absolute top-4 left-4 w-9 h-9 rounded-xl bg-white/90 backdrop-blur-md shadow-sm flex items-center justify-center text-gray-500 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={16}/></button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"/>
                      </div>
                      <div className="flex-1 flex flex-col gap-1.5" style={{ padding: "16px" }}>
                        <span className="self-start text-[10px] font-bold text-[#F97316] uppercase tracking-widest bg-orange-50 rounded-lg" style={{ padding: "6px 12px" }}>{item.category}</span>
                        <h4 className="font-bold text-lg text-gray-900 line-clamp-1">{item.name}</h4>
                        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between">
                          <button onClick={()=>toggleStock(item)} className="flex items-center gap-3 group/toggle">
                            <div className={"w-10 h-6 rounded-full p-1 transition-all duration-300 "+(item.inStock?'bg-emerald-500':'bg-gray-200')}>
                              <div className={"w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 "+(item.inStock?'translate-x-4':'translate-x-0')}/>
                            </div>
                            <span className={"text-sm font-bold transition-colors "+(item.inStock?'text-emerald-600':'text-gray-500 group-hover/toggle:text-gray-700')}>{item.inStock?'Available':'Sold Out'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      <InvoiceModal isOpen={isInvoiceOpen} onClose={()=>setIsInvoiceOpen(false)} order={selectedOrder}/>
    </div>
  );
}
