// Run: node scratch/build_admin.js
const fs = require('fs'), path = require('path');
const out = path.join(__dirname, '..', 'app', 'admin', 'page.js');

const code = `"use client";
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
  const W=500, H=170, PL=42, PR=8, PT=8, PB=22;
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
  const yMarks=Array.from({length:5},(_,i)=>({val:Math.round(max*(4-i)/4),y:PT+(i/4)*ch}));
  if(data.every(v=>v===0)) return (
    <div className="flex flex-col items-center justify-center gap-2 text-gray-200" style={{height:H}}>
      <BarChart3 size={26} className="opacity-30"/>
      <p className="text-xs font-medium">No revenue data yet</p>
    </div>
  );
  return (
    <svg viewBox={"0 0 "+W+" "+H} width="100%" style={{height:H}}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F97316" stopOpacity="0.22"/>
          <stop offset="100%" stopColor="#F97316" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {yMarks.map(({val,y},i)=>(
        <g key={i}>
          <line x1={PL} y1={y} x2={W-PR} y2={y} stroke="#F1F5F9" strokeWidth="1"/>
          <text x={PL-4} y={y+3.5} textAnchor="end" fontSize="8.5" fill="#CBD5E1" fontFamily="system-ui">
            {val>=1000?('\\u20b9'+(val/1000).toFixed(0)+'k'):('\\u20b9'+val)}
          </text>
        </g>
      ))}
      <path d={area} fill="url(#ag)"/>
      <path d={line} fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={px} cy={py} r="4.5" fill="#F97316" stroke="white" strokeWidth="2.5"/>
      {labels.map((l,i)=>(
        <text key={i} x={PL+(i/(labels.length-1))*cw} y={H-4} textAnchor="middle" fontSize="8.5" fill="#CBD5E1" fontFamily="system-ui">{l}</text>
      ))}
    </svg>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
function KpiCard({ label, value, icon: Icon, accent, trend, trendUp, note, noteCount }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{background:accent+'1a'}}>
          <Icon size={16} style={{color:accent}}/>
        </div>
        <span className="text-xs font-medium text-gray-400 leading-tight">{label}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-4">
        <p className="text-[22px] font-bold text-gray-900 leading-none">{value}</p>
        {trend && (
          <span className={"flex items-center gap-0.5 text-[11px] font-bold "+(trendUp?'text-emerald-500':'text-red-400')}>
            {trendUp?<ArrowUp size={10} strokeWidth={3}/>:<ArrowDown size={10} strokeWidth={3}/>}
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <span className="text-[11px] text-gray-400">{noteCount?('+'+noteCount+' '):''}{note}</span>
        <ChevronRight size={13} className="text-gray-200 group-hover:text-orange-400 transition-colors"/>
      </div>
    </div>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
function StatusPill({ status }) {
  const cfg=STATUS_CONFIG[status]||STATUS_CONFIG.Accepted;
  return (
    <span className={"inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border "+cfg.color}>
      <span className={"w-1.5 h-1.5 rounded-full "+cfg.dot}/>
      {cfg.label}
    </span>
  );
}

// ─── Inline Status Select ─────────────────────────────────────────────────────
function StatusSelect({ orderId, current, onChange }) {
  return (
    <div className="relative inline-block">
      <select value={current} onChange={e=>onChange(orderId,e.target.value)}
        className="appearance-none text-[10px] font-semibold pl-2 pr-6 py-1 rounded-full border border-gray-200 bg-transparent text-gray-700 cursor-pointer outline-none hover:border-orange-200 transition-colors">
        <option value="Accepted">Accepted</option>
        <option value="Preparing">Preparing</option>
        <option value="Out for Delivery">Delivery</option>
        <option value="Delivered">Delivered</option>
      </select>
      <ChevronDown size={9} className="absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"/>
    </div>
  );
}

// ─── Vertical Status Bar ──────────────────────────────────────────────────────
function VertBar({ label, pct, color, maxPct }) {
  const MAX_H=80, h=maxPct>0?Math.round((pct/maxPct)*MAX_H):0;
  return (
    <div className="flex flex-col items-center gap-2 flex-1">
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md text-white" style={{background:color}}>{pct}%</span>
      <div className="w-full max-w-[38px] rounded-t-xl transition-all duration-700" style={{height:h||4,background:color,opacity:0.85}}/>
      <span className="text-[9px] font-semibold text-gray-400 text-center leading-tight">{label}</span>
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
          if (ch.type==='added') setNotifications(p=>[{id:'n'+Date.now(),title:'New Order',description:(o.customerName||'Guest')+' \\u2022 \\u20b9'+o.total,timestamp:new Date(),read:false},...p]);
          if (ch.type==='modified') {} // silent
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
    const sorted=Object.entries(counts).sort(([,a],[,b])=>b-a).slice(0,3);
    const maxC=sorted[0]?.[1]||1;
    return sorted.map(([name,count],i)=>({ name, count, pct:Math.round((count/maxC)*100), color:['#F97316','#6366F1','#10B981'][i] }));
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
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin"/>
        <p className="text-sm text-gray-400 font-medium">Verifying access\\u2026</p>
      </div>
    </div>
  );

  const initial    = profile?.name?.[0]?.toUpperCase()||'A';
  const todayStr   = new Date().toLocaleDateString('en-US',{weekday:'long',month:'long',day:'2-digit',year:'numeric'});
  const shortDate  = new Date().toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
  const tabLabel   = activeTab==='dashboard'?'Dashboard':activeTab==='orders'?'Orders':'Menu Editor';
  const maxStatPct = Math.max(...statusBars.map(s=>s.pct),1);

  const SidebarContent = ({ mini }) => (
    <>
      <nav className={"flex-1 py-3 "+(mini?'px-2':'px-3')}>
        {TABS.map(({id,label,icon:Icon})=>{
          const active=activeTab===id;
          const badge=id==='orders'&&pendingOrders>0?pendingOrders:null;
          return (
            <button key={id} onClick={()=>{setActiveTab(id);setMobileOpen(false);}} title={mini?label:undefined}
              className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 relative group "+(active?'bg-[#FFF4EC] text-[#F97316]':'text-gray-500 hover:bg-gray-50 hover:text-gray-700')+(mini?' justify-center':'')}>
              <Icon size={17} className="shrink-0"/>
              {!mini && <span className="flex-1 text-left">{label}</span>}
              {badge&&!mini && <span className="bg-[#F97316] text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{badge}</span>}
              {badge&&mini && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#F97316] rounded-full"/>}
              {mini && <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50 shadow-lg">{label}</div>}
            </button>
          );
        })}
      </nav>
      <div className={"border-t border-gray-100 pt-3 pb-4 "+(mini?'px-2':'px-3')}>
        {[{label:'Settings',icon:Settings},{label:'Help Center',icon:HelpCircle}].map(({label,icon:Icon})=>(
          <button key={label} title={mini?label:undefined}
            className={"w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-all mb-0.5 "+(mini?'justify-center':'')}>
            <Icon size={16} className="shrink-0"/>
            {!mini&&label}
          </button>
        ))}
        <div className={"flex items-center gap-3 px-3 py-2.5 "+(mini?'justify-center':'')}>
          <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{initial}</div>
          {!mini&&<>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{profile?.name||'Admin'}</p>
              <p className="text-[10px] text-gray-400">Administrator</p>
            </div>
            <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 p-1 transition-colors"><LogOut size={14}/></button>
          </>}
        </div>
        {mini&&<button onClick={handleLogout} className="w-full flex justify-center py-2 text-gray-300 hover:text-red-400 transition-colors"><LogOut size={15}/></button>}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] text-gray-800">

      {/* Mobile overlay */}
      {mobileOpen&&<div className="fixed inset-0 bg-black/40 z-[100] lg:hidden" onClick={()=>setMobileOpen(false)}/>}

      {/* Mobile sidebar */}
      <aside className={"fixed inset-y-0 left-0 z-[101] w-[220px] bg-white flex flex-col shadow-xl transition-transform duration-300 lg:hidden "+(mobileOpen?'translate-x-0':'-translate-x-full')}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center"><Coffee size={15} className="text-white"/></div>
            <div><p className="font-bold text-gray-900 text-sm">7th Heaven</p><p className="text-[10px] text-gray-400">Cafe Admin</p></div>
          </div>
          <button onClick={()=>setMobileOpen(false)} className="text-gray-400 p-1 rounded-lg hover:bg-gray-50"><X size={16}/></button>
        </div>
        <SidebarContent mini={false}/>
      </aside>

      {/* Desktop sidebar */}
      <aside className={"hidden lg:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 shrink-0 transition-all duration-300 overflow-hidden "+(sidebarOpen?'w-[220px]':'w-[64px]')}>
        <div className={"flex items-center gap-2.5 px-4 py-4 border-b border-gray-100 relative "+(!sidebarOpen?'justify-center':'')}>
          <div className="w-8 h-8 bg-[#F97316] rounded-xl flex items-center justify-center shrink-0"><Coffee size={15} className="text-white"/></div>
          {sidebarOpen&&<>
            <div className="min-w-0 flex-1"><p className="font-bold text-gray-900 text-sm">7th Heaven</p><p className="text-[10px] text-gray-400">Cafe Admin</p></div>
            <button onClick={()=>setSidebarOpen(false)} className="text-gray-300 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50 shrink-0"><ChevronLeft size={14}/></button>
          </>}
          {!sidebarOpen&&<button onClick={()=>setSidebarOpen(true)} className="absolute -right-2.5 top-5 w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-[#F97316] shadow-sm z-10"><ChevronRight size={9}/></button>}
        </div>
        <SidebarContent mini={!sidebarOpen}/>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center justify-between sticky top-0 z-30 gap-4">
          <div className="flex items-center gap-3">
            <button onClick={()=>setMobileOpen(true)} className="lg:hidden w-8 h-8 rounded-lg border border-gray-100 flex items-center justify-center text-gray-500"><Menu size={16}/></button>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">{tabLabel}</h1>
              <p className="text-[10px] text-gray-400 mt-0.5 hidden sm:block">{new Date().toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',year:'numeric'})}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 h-9 w-40 focus-within:border-orange-200 focus-within:bg-white transition-all">
              <Search size={12} className="text-gray-400 mr-2 shrink-0"/>
              <input type="text" placeholder="Search\\u2026" className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400 text-gray-700" onChange={e=>{setOrderSearch(e.target.value);setMenuSearch(e.target.value);}}/>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-2.5 h-9">
              <span className="relative flex h-1.5 w-1.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"/><span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500"/></span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
            <NotificationPopover notifications={notifications} onNotificationsChange={setNotifications}
              buttonClassName="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all"
              popoverClassName="bg-white border border-gray-100 shadow-xl rounded-2xl"
              textColor="text-gray-800" hoverBgColor="hover:bg-gray-50" dividerColor="divide-gray-100" headerBorderColor="border-gray-100"/>
            <div className="w-8 h-8 bg-[#F97316] rounded-full flex items-center justify-center text-white font-bold text-sm">{initial}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">

          {/* ═════ OVERVIEW ═════ */}
          {activeTab==='dashboard'&&(
            <div className="space-y-5">

              {/* Greeting */}
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-gray-400 mb-1">{todayStr}</p>
                  <h2 className="text-2xl font-bold text-gray-900">Welcome Back, {profile?.name?.split(' ')[0]||'Admin'}!</h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="hidden sm:flex items-center gap-2 bg-white border border-gray-100 rounded-xl px-3 py-2 text-xs text-gray-400 shadow-sm">
                    <Calendar size={12} className="shrink-0"/>{shortDate}
                  </div>
                  <button className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-orange-200/50 active:scale-95">
                    <Download size={14}/>Export Data
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
                <KpiCard label="Total Revenue"  value={'\\u20b9'+totalRevenue.toFixed(0)} icon={TrendingUp} accent="#F97316" trend="12%" trendUp note="from last month" noteCount={todayOrders}/>
                <KpiCard label="Total Orders"   value={orders.length}  icon={ShoppingBag} accent="#6366F1" trend="8%" trendUp note="all time"/>
                <KpiCard label="Pending"        value={pendingOrders}  icon={Clock}       accent="#F59E0B" note="need attention"/>
                <KpiCard label="Menu Items"     value={menu.length}    icon={Package}     accent="#10B981" note="currently live"/>
              </div>

              {/* Row: Area chart + Status bars */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-4">

                {/* Revenue area chart */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-base font-bold text-gray-900">Revenue Analytics</h3>
                      <p className="text-[11px] text-gray-400 mt-0.5">Last 12 months</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 hidden sm:block">{shortDate}</span>
                      <div className="w-8 h-8 bg-orange-50 rounded-xl flex items-center justify-center"><BarChart3 size={15} className="text-[#F97316]"/></div>
                    </div>
                  </div>
                  <AreaChart data={monthlyRevenue} labels={chartLabels}/>
                </div>

                {/* Order status breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-bold text-gray-900">Order Status</h3>
                    <button onClick={()=>setActiveTab('orders')} className="text-xs font-semibold text-[#F97316] hover:underline">View all</button>
                  </div>
                  <div className="flex-1 flex items-end justify-around gap-2 py-3">
                    {statusBars.map((s,i)=><VertBar key={i} label={s.label} pct={s.pct} color={s.color} maxPct={maxStatPct}/>)}
                  </div>
                  <div className="pt-4 mt-2 border-t border-gray-50 space-y-2.5">
                    {statusBars.map((s,i)=>(
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{background:s.color}}/>
                          <span className="text-xs text-gray-500">{s.label}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{orders.filter(o=>o.status===s.label).length} orders</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-violet-400"/>
                        <span className="text-xs text-gray-500">Delivery</span>
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{orders.filter(o=>o.status==='Out for Delivery').length} orders</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Row: Recent orders table + Menu performance */}
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_272px] gap-4 pb-6">

                {/* Recent orders */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                    <h3 className="text-base font-bold text-gray-900">Recent Orders</h3>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 text-xs text-gray-400 border border-gray-100 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-all">
                        <Calendar size={10}/> Sort by
                      </button>
                      <button onClick={()=>setActiveTab('orders')} className="text-xs text-gray-400 border border-gray-100 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-all">
                        View All
                      </button>
                    </div>
                  </div>
                  <div className="px-5">
                    <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 py-2.5 border-b border-gray-50">
                      {['Order Info','Status','Total',''].map(h=>(
                        <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider last:text-right">{h}</span>
                      ))}
                    </div>
                    {loading ? (
                      <div className="py-8 text-center text-sm text-gray-400">Loading\\u2026</div>
                    ) : orders.length===0 ? (
                      <div className="py-10 flex flex-col items-center gap-2 text-gray-200"><Receipt size={26} className="opacity-30"/><p className="text-xs font-medium">No orders yet</p></div>
                    ) : orders.slice(0,6).map(o=>(
                      <div key={o.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-4 py-3 items-center border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors -mx-5 px-5">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 bg-[#FFF4EC] rounded-xl flex items-center justify-center shrink-0"><Coffee size={13} className="text-[#F97316]"/></div>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-gray-800">#{o.id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400 truncate">{o.customerName||'Guest'}</p>
                          </div>
                        </div>
                        <StatusPill status={o.status}/>
                        <p className="text-sm font-bold text-gray-900">\\u20b9{o.total}</p>
                        <div className="flex items-center gap-1">
                          <button onClick={()=>{setSelectedOrder(o);setIsInvoiceOpen(true);}} className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-[#F97316] hover:border-orange-100 transition-all"><FileText size={11}/></button>
                          <button onClick={()=>deleteOrder(o.id)} className="w-6 h-6 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-100 transition-all"><Trash2 size={11}/></button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Menu performance + system */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-base font-bold text-gray-900">Menu Performance</h3>
                    <span className="text-[10px] font-semibold text-gray-400 bg-gray-50 border border-gray-100 rounded-lg px-2 py-1">All Time</span>
                  </div>
                  {menuPerf.length===0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-gray-200"><Package size={24} className="opacity-30"/><p className="text-xs">No data yet</p></div>
                  ) : (
                    <div className="space-y-4">
                      {menuPerf.map((item,i)=>(
                        <div key={i} className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-gray-700 truncate">{item.name}</span>
                            <span className="text-xs font-bold text-gray-600 ml-2 shrink-0">{item.count} <span className="text-emerald-500">\\u2191{Math.max(1,Math.round(item.pct*0.08))}%</span></span>
                          </div>
                          <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-700" style={{width:item.pct+'%',background:item.color}}/>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-5 pt-5 border-t border-gray-50">
                    <div className="bg-gray-900 rounded-xl p-4 relative overflow-hidden">
                      <div className="absolute -bottom-4 -right-4 w-14 h-14 rounded-full bg-[#F97316] opacity-10"/>
                      <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-1.5">
                          <p className="text-xs font-bold text-white">System Status</p>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full font-bold uppercase">Live</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mb-2.5">Tracking <span className="text-white font-semibold">{pendingOrders}</span> active orders</p>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-[#F97316] to-amber-400" style={{width:'88%'}}/>
                        </div>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-[9px] text-gray-600 uppercase tracking-wider">System Load</span>
                          <span className="text-[11px] text-amber-400 font-bold">88%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ═════ ORDERS TAB ═════ */}
          {activeTab==='orders'&&(
            <div className="space-y-4 pb-20">
              <div className="flex flex-col gap-3">
                <div className="flex items-center bg-white border border-gray-100 rounded-xl px-3 h-10 shadow-sm focus-within:border-orange-200 transition-all">
                  <Search size={13} className="text-gray-400 mr-2 shrink-0"/>
                  <input type="text" placeholder="Search by customer or order ID\\u2026" value={orderSearch} onChange={e=>setOrderSearch(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400 text-gray-700"/>
                </div>
                <div className="flex flex-wrap gap-2">
                  {ORDER_FILTERS.map(f=>{
                    const count=f==='All'?orders.length:orders.filter(o=>o.status===f).length;
                    const active=orderFilter===f;
                    return (
                      <button key={f} onClick={()=>setOrderFilter(f)}
                        className={"px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap "+(active?'bg-[#F97316] text-white border-[#F97316] shadow-sm':'bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-[#F97316]')}>
                        {f} <span className={"ml-1 "+(active?'opacity-70':'opacity-50')}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {loading ? (
                <div className="text-center py-16 text-gray-400 text-sm">Loading orders\\u2026</div>
              ) : filteredOrders.length===0 ? (
                <div className="text-center py-20 flex flex-col items-center gap-3 opacity-20"><Receipt size={44}/><p className="font-bold text-lg">No orders found</p></div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="hidden md:flex items-center px-5 py-3 border-b border-gray-50 bg-gray-50/60">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-24 shrink-0">Order ID</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex-1">Customer & Items</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-36 shrink-0">Status</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20 shrink-0 text-right">Total</span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20 shrink-0 text-right">Actions</span>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {filteredOrders.map(o=>(
                      <div key={o.id}>
                        <div className="hidden md:flex items-center px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                          <div className="w-24 shrink-0">
                            <p className="text-xs font-bold text-gray-800">#{o.id.slice(-6).toUpperCase()}</p>
                            {o.timestamp&&<p className="text-[9px] text-gray-400 mt-0.5">{new Date(o.timestamp).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>}
                          </div>
                          <div className="flex-1 min-w-0 pr-4">
                            <p className="text-sm font-semibold text-gray-800 truncate">{o.customerName||'Anonymous'}</p>
                            <p className="text-[11px] text-gray-400 truncate mt-0.5">{o.items?.map(i=>i.name+'\\u00d7'+i.qty).join(', ')}</p>
                          </div>
                          <div className="w-36 shrink-0"><StatusSelect orderId={o.id} current={o.status} onChange={updateStatus}/></div>
                          <p className="w-20 shrink-0 text-sm font-bold text-gray-900 text-right pr-2">\\u20b9{o.total}</p>
                          <div className="w-20 shrink-0 flex items-center justify-end gap-1.5">
                            <button onClick={()=>{setSelectedOrder(o);setIsInvoiceOpen(true);}} title="Invoice" className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-[#F97316] hover:border-orange-100 transition-all"><FileText size={12}/></button>
                            <button onClick={()=>deleteOrder(o.id)} title="Delete" className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all"><Trash2 size={12}/></button>
                          </div>
                        </div>
                        <div className="md:hidden px-4 py-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"><Receipt size={15} className="text-orange-400"/></div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">#{o.id.slice(-6).toUpperCase()}</p>
                                <p className="text-[11px] text-gray-500">{o.customerName||'Anonymous'}</p>
                              </div>
                            </div>
                            <StatusPill status={o.status}/>
                          </div>
                          <p className="text-xs text-gray-400 pl-12">{o.items?.map(i=>i.name+' x'+i.qty).join(', ')}</p>
                          <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                            <p className="text-sm font-bold text-gray-900">\\u20b9{o.total}</p>
                            <div className="flex items-center gap-2">
                              <StatusSelect orderId={o.id} current={o.status} onChange={updateStatus}/>
                              <button onClick={()=>{setSelectedOrder(o);setIsInvoiceOpen(true);}} className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-[#F97316] transition-all"><FileText size={12}/></button>
                              <button onClick={()=>deleteOrder(o.id)} className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={12}/></button>
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
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                <div className="flex items-center bg-white border border-gray-100 rounded-xl px-3 h-10 w-full sm:max-w-[280px] shadow-sm focus-within:border-orange-200 transition-all">
                  <Search size={13} className="text-gray-400 mr-2 shrink-0"/>
                  <input type="text" placeholder="Search menu\\u2026" value={menuSearch} onChange={e=>setMenuSearch(e.target.value)} className="bg-transparent border-none outline-none w-full text-sm placeholder:text-gray-400 text-gray-700"/>
                  {menuSearch&&<button onClick={()=>setMenuSearch('')} className="text-gray-400 hover:text-gray-600"><X size={13}/></button>}
                </div>
                <button onClick={()=>setShowAddForm(!showAddForm)} className="flex items-center gap-2 bg-[#F97316] hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm shadow-orange-200/50 active:scale-95">
                  <Plus size={15}/>{showAddForm?'Cancel':'Add Item'}
                </button>
              </div>

              {showAddForm&&(
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-1 h-5 bg-[#F97316] rounded-full"/>
                    <h3 className="text-sm font-bold text-gray-900">New Menu Item</h3>
                  </div>
                  <form onSubmit={addMenuItem}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      {[{label:'Name',key:'name',placeholder:'e.g. Vintage Mocha',type:'text'},{label:'Category',key:'category',placeholder:'e.g. Beverages',type:'text'},{label:'Price (\\u20b9)',key:'price',placeholder:'0',type:'number'}].map(({label,key,placeholder,type})=>(
                        <div key={key} className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
                          <input type={type} placeholder={placeholder} required value={newItem[key]} onChange={e=>setNewItem({...newItem,[key]:e.target.value})} className="w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 text-sm text-gray-800 font-medium outline-none focus:border-orange-300 focus:bg-white transition-all"/>
                        </div>
                      ))}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Photo</label>
                        <div>
                          <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="menu-img"/>
                          <label htmlFor="menu-img" className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all">
                            {filePreview?<img src={filePreview} alt="" className="w-5 h-5 rounded object-cover shrink-0"/>:<ImageIcon size={14} className="text-gray-400 shrink-0"/>}
                            <span className="text-xs font-medium text-gray-500 truncate">{selectedFile?selectedFile.name:'Choose image'}</span>
                          </label>
                          {uploadProgress>0&&uploadProgress<100&&<p className="text-[9px] text-[#F97316] font-semibold mt-1">Uploading {uploadProgress.toFixed(0)}%</p>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <button type="button" onClick={()=>setNewItem({...newItem,inStock:!newItem.inStock})} className={"w-10 h-5 rounded-full p-0.5 transition-all duration-300 "+(newItem.inStock?'bg-emerald-500':'bg-gray-200')}>
                        <div className={"w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-300 "+(newItem.inStock?'translate-x-5':'translate-x-0')}/>
                      </button>
                      <span className="text-sm font-medium text-gray-700">{newItem.inStock?'In Stock':'Out of Stock'}</span>
                    </div>
                    <button type="submit" className="w-full py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold text-sm transition-all">Publish to Menu</button>
                  </form>
                </div>
              )}

              {filteredMenu.length===0 ? (
                <div className="text-center py-16 flex flex-col items-center gap-3 opacity-20"><UtensilsCrossed size={36}/><p className="font-bold">No items found</p></div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map(item=>(
                    <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
                      <div className="h-40 bg-gray-50 relative overflow-hidden">
                        {item.image?<img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"/>:<div className="w-full h-full flex items-center justify-center"><Coffee size={26} className="text-gray-200"/></div>}
                        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl text-sm font-bold text-gray-900 shadow-sm border border-gray-100">\\u20b9{item.price}</div>
                        <button onClick={()=>deleteMenuItem(item.id,item.name)} className="absolute top-3 left-3 w-7 h-7 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-400 hover:border-red-100 transition-all"><Trash2 size={12}/></button>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
                      </div>
                      <div className="p-4 flex-1 flex flex-col gap-2">
                        <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                        <span className="self-start text-[9px] font-bold text-[#F97316] uppercase tracking-widest bg-orange-50 px-2.5 py-1 rounded-lg">{item.category}</span>
                        <div className="mt-auto pt-3 border-t border-gray-50">
                          <button onClick={()=>toggleStock(item)} className="flex items-center gap-2.5">
                            <div className={"w-8 h-[17px] rounded-full p-0.5 transition-all duration-300 "+(item.inStock?'bg-emerald-500':'bg-gray-200')}>
                              <div className={"w-3 h-3 bg-white rounded-full shadow transition-transform duration-300 "+(item.inStock?'translate-x-[18px]':'translate-x-0')}/>
                            </div>
                            <span className={"text-xs font-semibold "+(item.inStock?'text-emerald-600':'text-gray-400')}>{item.inStock?'Available':'Sold Out'}</span>
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
`;

fs.writeFileSync(out, code, 'utf8');
console.log('Written', fs.statSync(out).size, 'bytes to', out);
