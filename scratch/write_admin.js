// Run: node scratch/write_admin.js
const fs = require('fs');
const path = require('path');

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
  BarChart3, Activity, Zap,
  RefreshCw, Image as ImageIcon, X, ChevronDown,
  Coffee, Menu, Settings, HelpCircle, Download, Calendar
} from 'lucide-react';

const STATUS_CONFIG = {
  Accepted:          { label: 'Accepted',  color: 'bg-blue-50 text-blue-600 border-blue-100',         dot: 'bg-blue-500',    icon: Clock },
  Preparing:         { label: 'Preparing', color: 'bg-amber-50 text-amber-600 border-amber-100',       dot: 'bg-amber-500',   icon: Coffee },
  'Out for Delivery':{ label: 'Delivery',  color: 'bg-violet-50 text-violet-600 border-violet-100',    dot: 'bg-violet-500',  icon: Truck },
  Delivered:         { label: 'Delivered', color: 'bg-emerald-50 text-emerald-600 border-emerald-100', dot: 'bg-emerald-500', icon: CheckCircle2 },
};

const TABS = [
  { id: 'dashboard', label: 'Overview',    icon: LayoutDashboard },
  { id: 'orders',    label: 'Orders',      icon: ShoppingBag },
  { id: 'menu',      label: 'Menu Editor', icon: UtensilsCrossed },
];

const ORDER_FILTERS = ['All', 'Accepted', 'Preparing', 'Out for Delivery', 'Delivered'];

function KpiCard({ label, value, sub, icon: Icon, accent = '#F97316', trend, trendUp }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: accent + '18' }}>
          <Icon size={18} style={{ color: accent }} />
        </div>
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-end gap-2.5 mb-5">
        <p className="text-[26px] font-bold text-gray-900 leading-none">{value}</p>
        {trend !== undefined && (
          <span className={\`flex items-center gap-0.5 text-xs font-semibold pb-0.5 \${trendUp ? 'text-emerald-500' : 'text-red-400'}\`}>
            {trendUp ? <ArrowUp size={11} strokeWidth={2.5} /> : <ArrowDown size={11} strokeWidth={2.5} />}
            {trend}
          </span>
        )}
      </div>
      <div className="flex items-center justify-between pt-3.5 border-t border-gray-50">
        <span className="text-xs text-gray-400">{sub || 'From last period'}</span>
        <ChevronRight size={13} className="text-gray-300 group-hover:text-orange-400 transition-colors" />
      </div>
    </div>
  );
}

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Accepted'];
  return (
    <span className={\`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full border \${cfg.color}\`}>
      <span className={\`w-1.5 h-1.5 rounded-full \${cfg.dot}\`} />
      {cfg.label}
    </span>
  );
}

function ActivityItem({ icon: Icon, title, sub, time, accent = '#F97316' }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ background: accent + '12' }}>
        <Icon size={13} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate leading-snug">{title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
      </div>
      <span className="text-[10px] text-gray-300 font-medium shrink-0 pt-0.5 whitespace-nowrap">{time}</span>
    </div>
  );
}

const SPARK_MAX_H = 100;
function SparkBar({ pct, color = '#F97316', value }) {
  const barH = pct > 0 ? Math.max(Math.round((pct / 100) * SPARK_MAX_H), 8) : 4;
  const opacity = 0.25 + (pct / 100) * 0.75;
  return (
    <div className="flex-1 flex flex-col items-center justify-end gap-1">
      <span className="text-[9px] font-semibold text-gray-400 leading-none">{value > 0 ? value : ''}</span>
      <div className="w-full rounded-lg transition-all duration-700" style={{ height: barH, background: color, opacity }} />
    </div>
  );
}

export default function AdminPage() {
  const { profile, logout } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab]           = useState('dashboard');
  const [orders, setOrders]                 = useState([]);
  const [menu, setMenu]                     = useState([]);
  const [loading, setLoading]               = useState(true);
  const [notifications, setNotifications]   = useState([]);
  const [activityFeed, setActivityFeed]     = useState([]);
  const isFirstLoad = useRef(true);

  const [orderFilter, setOrderFilter] = useState('All');
  const [orderSearch, setOrderSearch] = useState('');

  const [menuSearch, setMenuSearch]         = useState('');
  const [newItem, setNewItem]               = useState({ name: '', category: '', price: '', inStock: true });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile]     = useState(null);
  const [filePreview, setFilePreview]       = useState(null);
  const [showAddForm, setShowAddForm]       = useState(false);

  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState(null);
  const [isInvoiceOpen, setIsInvoiceOpen]               = useState(false);

  const [sidebarOpen, setSidebarOpen]           = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (profile && profile.role !== 'admin') router.push('/');
  }, [profile, router]);

  useEffect(() => {
    if (!profile || profile.role !== 'admin') return;
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      const oList = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      oList.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      if (!isFirstLoad.current) {
        snapshot.docChanges().forEach((change) => {
          const o = { id: change.doc.id, ...change.doc.data() };
          if (change.type === 'added') {
            const n = { id: 'order-' + o.id + '-' + Date.now(), title: 'New Order', description: (o.customerName || 'Guest') + ' placed an order', timestamp: new Date(), read: false };
            setNotifications(p => [n, ...p]);
            setActivityFeed(p => [{ icon: ShoppingBag, title: 'New order from ' + (o.customerName || 'Guest'), sub: '₹' + o.total + ' • ' + (o.items?.length || 0) + ' items', time: 'Just now', accent: '#F97316' }, ...p.slice(0, 9)]);
          }
          if (change.type === 'modified') {
            setActivityFeed(p => [{ icon: RefreshCw, title: 'Order #' + o.id.slice(-6).toUpperCase() + ' updated', sub: 'Status → ' + o.status, time: 'Just now', accent: '#6B7280' }, ...p.slice(0, 9)]);
          }
        });
      }
      setOrders(oList);
      setLoading(false);
      isFirstLoad.current = false;
    });
    const unsubMenu = onSnapshot(collection(db, 'menu'), (snapshot) => {
      setMenu(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => { unsubOrders(); unsubMenu(); };
  }, [profile]);

  useEffect(() => {
    if (!selectedFile) { setFilePreview(null); return; }
    const url = URL.createObjectURL(selectedFile);
    setFilePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const totalRevenue  = useMemo(() => orders.reduce((s, o) => s + (o.status === 'Delivered' ? Number(o.total) : 0), 0), [orders]);
  const pendingOrders = useMemo(() => orders.filter(o => o.status !== 'Delivered').length, [orders]);
  const todayOrders   = useMemo(() => orders.filter(o => {
    if (!o.timestamp) return false;
    const d = new Date(o.timestamp), t = new Date();
    return d.getDate() === t.getDate() && d.getMonth() === t.getMonth();
  }).length, [orders]);

  const filteredOrders = useMemo(() => {
    let list = orderFilter === 'All' ? orders : orders.filter(o => o.status === orderFilter);
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      list = list.filter(o => o.id.toLowerCase().includes(q) || (o.customerName || '').toLowerCase().includes(q));
    }
    return list;
  }, [orders, orderFilter, orderSearch]);

  const filteredMenu = useMemo(() => {
    if (!menuSearch.trim()) return menu;
    const q = menuSearch.toLowerCase();
    return menu.filter(i => i.name?.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q));
  }, [menu, menuSearch]);

  const sparkData = useMemo(() => {
    const today = new Date();
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(today); d.setDate(today.getDate() - (6 - i)); return d.toDateString();
    });
    const dayLabels    = days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' }));
    const counts       = days.map(day => orders.filter(o => o.timestamp && new Date(o.timestamp).toDateString() === day).length);
    const hasTimestamps = orders.some(o => !!o.timestamp);
    const finalCounts  = hasTimestamps ? counts : days.map((_, i) => Math.round((orders.length / 7) * (0.4 + Math.sin(i) * 0.3 + (i === 4 || i === 5 ? 0.5 : 0))));
    const maxCount     = Math.max(...finalCounts, 1);
    return { pcts: finalCounts.map(c => Math.round((c / maxCount) * 100)), values: finalCounts, labels: dayLabels };
  }, [orders]);

  const initialFeedPopulated = useRef(false);
  useEffect(() => {
    if (orders.length > 0 && !initialFeedPopulated.current) {
      initialFeedPopulated.current = true;
      setActivityFeed(orders.slice(0, 5).map(o => ({
        icon: ShoppingBag,
        title: 'Order #' + o.id.slice(-6).toUpperCase() + ' — ' + (o.customerName || 'Guest'),
        sub: o.status + ' • ₹' + o.total,
        time: o.timestamp ? new Date(o.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent',
        accent: '#F97316',
      })));
    }
  }, [orders]);

  const handleFileUpload = (e) => { if (e.target.files[0]) setSelectedFile(e.target.files[0]); };

  const addMenuItem = async (e) => {
    e.preventDefault();
    let imageUrl = '';
    if (selectedFile) {
      const storageRef = ref(storage, 'menu/' + Date.now() + '_' + selectedFile.name);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed', (s) => setUploadProgress((s.bytesTransferred / s.totalBytes) * 100), reject,
          async () => { imageUrl = await getDownloadURL(uploadTask.snapshot.ref); resolve(); });
      });
    }
    try {
      await addDoc(collection(db, 'menu'), { ...newItem, price: Number(newItem.price), image: imageUrl });
      setNewItem({ name: '', category: '', price: '', inStock: true });
      setSelectedFile(null); setUploadProgress(0); setShowAddForm(false);
      setActivityFeed(p => [{ icon: Plus, title: '"' + newItem.name + '" added to menu', sub: newItem.category + ' • ₹' + newItem.price, time: 'Just now', accent: '#10B981' }, ...p.slice(0, 9)]);
    } catch (err) { console.error(err); }
  };

  const toggleStock       = async (item) => { await updateDoc(doc(db, 'menu', item.id), { inStock: !item.inStock }); };
  const updateOrderStatus = async (id, status) => { await updateDoc(doc(db, 'orders', id), { status }); };
  const deleteMenuItem    = async (id, name) => { if (window.confirm('Delete "' + name + '" from menu?')) await deleteDoc(doc(db, 'menu', id)); };
  const deleteOrder       = async (id) => { if (window.confirm('Delete this order permanently?')) await deleteDoc(doc(db, 'orders', id)); };
  const handleLogout      = async () => { await logout(); router.push('/'); };

  if (!profile || profile.role !== 'admin') return (
    <div className="min-h-screen bg-[#F4F6FB] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-400 font-semibold text-sm tracking-wide">Verifying access…</p>
      </div>
    </div>
  );

  const navInitial = profile?.name?.[0]?.toUpperCase() || 'A';
  const todayStr   = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: '2-digit', year: 'numeric' });
  const shortDate  = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const tabLabel   = activeTab === 'dashboard' ? 'Overview' : activeTab === 'orders' ? 'Orders' : 'Menu Editor';

  const SidebarNav = ({ collapsed }) => (
    <>
      <nav className={\`flex-1 py-4 space-y-0.5 \${collapsed ? 'px-2' : 'px-3'}\`}>
        {TABS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          const badge    = id === 'orders' && pendingOrders > 0 ? pendingOrders : null;
          return (
            <button
              key={id}
              onClick={() => { setActiveTab(id); setIsMobileMenuOpen(false); }}
              title={collapsed ? label : undefined}
              className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all relative group
                \${isActive ? 'bg-orange-50 text-orange-500' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}
                \${collapsed ? 'justify-center' : ''}\`}
            >
              <Icon size={17} className="shrink-0" />
              {!collapsed && <span>{label}</span>}
              {badge && !collapsed && (
                <span className="ml-auto bg-orange-500 text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">{badge}</span>
              )}
              {badge && collapsed && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-500 rounded-full border-2 border-white" />
              )}
            </button>
          );
        })}
      </nav>
      <div className={\`py-4 border-t border-gray-100 space-y-0.5 \${collapsed ? 'px-2' : 'px-3'}\`}>
        {[{ label: 'Settings', icon: Settings }, { label: 'Help Center', icon: HelpCircle }].map(({ label, icon: Icon }) => (
          <button key={label} title={collapsed ? label : undefined}
            className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 transition-all \${collapsed ? 'justify-center' : ''}\`}
          >
            <Icon size={17} className="shrink-0" />
            {!collapsed && label}
          </button>
        ))}
        <div className={\`flex items-center gap-3 px-3 py-2.5 mt-1 \${collapsed ? 'justify-center' : ''}\`}>
          <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{navInitial}</div>
          {!collapsed && (
            <>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-gray-800 truncate leading-tight">{profile?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-400">Administrator</p>
              </div>
              <button onClick={handleLogout} className="text-gray-300 hover:text-red-400 transition-colors shrink-0 p-1"><LogOut size={14} /></button>
            </>
          )}
        </div>
        {collapsed && (
          <button onClick={handleLogout} className="w-full flex items-center justify-center py-2 text-gray-300 hover:text-red-400 transition-colors"><LogOut size={15} /></button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#F4F6FB] font-body text-gray-800">

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile drawer */}
      <aside className={\`fixed inset-y-0 left-0 z-[101] w-[240px] bg-white flex flex-col shadow-xl transition-transform duration-300 lg:hidden \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}>
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center"><Coffee size={17} className="text-white" /></div>
            <div>
              <p className="font-bold text-gray-900 text-sm leading-tight">7th Heaven</p>
              <p className="text-[10px] text-gray-400 font-medium">Cafe Admin</p>
            </div>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50"><X size={17} /></button>
        </div>
        <SidebarNav collapsed={false} />
      </aside>

      {/* Desktop sidebar */}
      <aside className={\`hidden lg:flex flex-col bg-white border-r border-gray-100 h-screen sticky top-0 shadow-sm transition-all duration-300 shrink-0 overflow-hidden \${sidebarOpen ? 'w-[240px]' : 'w-[68px]'}\`}>
        <div className={\`px-4 py-4 border-b border-gray-100 flex items-center gap-3 relative \${!sidebarOpen ? 'justify-center' : ''}\`}>
          <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shrink-0"><Coffee size={17} className="text-white" /></div>
          {sidebarOpen && (
            <>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-gray-900 text-sm leading-tight">7th Heaven</p>
                <p className="text-[10px] text-gray-400 font-medium">Cafe Admin</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-300 hover:text-gray-600 transition-colors shrink-0 p-1 rounded-lg hover:bg-gray-50"><ChevronLeft size={15} /></button>
            </>
          )}
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="absolute -right-2.5 top-[26px] w-5 h-5 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-orange-500 shadow-sm z-10"><ChevronRight size={10} /></button>
          )}
        </div>
        <SidebarNav collapsed={!sidebarOpen} />
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-5 lg:px-8 py-3.5 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden w-9 h-9 rounded-xl border border-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-all">
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">{tabLabel}</h1>
              <p className="text-[10px] text-gray-400 font-medium hidden sm:block mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center bg-gray-50 border border-gray-100 rounded-xl px-3 h-9 w-44 focus-within:border-orange-200 focus-within:bg-white transition-all">
              <Search size={13} className="text-gray-400 mr-2 shrink-0" />
              <input type="text" placeholder="Search…" className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400"
                onChange={e => { setOrderSearch(e.target.value); setMenuSearch(e.target.value); }} />
            </div>
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 border border-emerald-100 rounded-xl px-3 h-9">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Live</span>
            </div>
            <NotificationPopover
              notifications={notifications}
              onNotificationsChange={setNotifications}
              buttonClassName="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-100 text-gray-500 hover:bg-gray-50 transition-all"
              popoverClassName="bg-white border border-gray-100 shadow-xl rounded-2xl"
              textColor="text-gray-800"
              hoverBgColor="hover:bg-gray-50"
              dividerColor="divide-gray-100"
              headerBorderColor="border-gray-100"
            />
            <div className="w-9 h-9 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">{navInitial}</div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-5 lg:p-8 overflow-y-auto overflow-x-hidden">
          <div className="max-w-7xl mx-auto">

            {/* ═══ OVERVIEW ═══ */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">

                {/* Greeting */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-gray-400 mb-1">{todayStr}</p>
                    <h2 className="text-2xl font-bold text-gray-900">Welcome Back, {profile?.name?.split(' ')[0] || 'Admin'}!</h2>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="hidden sm:flex items-center gap-2 text-xs text-gray-400 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                      <Calendar size={13} className="text-gray-400 shrink-0" />
                      <span>Valuation data as of {shortDate}</span>
                    </div>
                    <button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-sm">
                      <Download size={14} />Export Data
                    </button>
                  </div>
                </div>

                {/* KPI */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KpiCard label="Total Revenue"  value={'₹' + totalRevenue.toFixed(0)} sub={todayOrders + ' orders today'} icon={TrendingUp} accent="#F97316" trend="12%" trendUp />
                  <KpiCard label="Total Orders"   value={orders.length}  sub="From all time"  icon={ShoppingBag} accent="#6366F1" trend="8%" trendUp />
                  <KpiCard label="Pending Orders" value={pendingOrders}  sub="Needs action"   icon={Clock}       accent="#F59E0B" trend={pendingOrders > 3 ? 'High' : undefined} trendUp={false} />
                  <KpiCard label="Menu Items"     value={menu.length}    sub="Currently live" icon={Package}     accent="#10B981" />
                </div>

                {/* Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Analytics</p>
                        <p className="text-lg font-bold text-gray-900">Orders Overview</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 hidden sm:block">{shortDate}</span>
                        <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center"><BarChart3 size={16} className="text-orange-500" /></div>
                      </div>
                    </div>
                    <div className="flex items-end gap-2" style={{ height: SPARK_MAX_H + 20 }}>
                      {sparkData.pcts.map((pct, i) => (<SparkBar key={i} pct={pct} color="#F97316" value={sparkData.values[i]} />))}
                    </div>
                    <div className="flex gap-2 mt-3 border-t border-gray-50 pt-3">
                      {sparkData.labels.map((d, i) => (<span key={i} className="flex-1 text-center text-[9px] font-semibold text-gray-400 uppercase tracking-wide">{d}</span>))}
                    </div>
                  </div>
                  <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Live Feed</p>
                        <p className="text-lg font-bold text-gray-900">Activity</p>
                      </div>
                      <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center"><Activity size={16} className="text-orange-500" /></div>
                    </div>
                    <div className="flex-1 overflow-y-auto" style={{ maxHeight: 260 }}>
                      {activityFeed.length === 0 ? (
                        <div className="text-center text-gray-300 text-sm font-medium pt-8 flex flex-col items-center gap-2"><Zap size={22} className="opacity-30" />Waiting for events…</div>
                      ) : activityFeed.map((a, i) => <ActivityItem key={i} {...a} />)}
                    </div>
                  </div>
                </div>

                {/* Row 3 */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 pb-6">
                  <div className="lg:col-span-3 bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">Breakdown</p>
                        <p className="text-lg font-bold text-gray-900">Order Status</p>
                      </div>
                      <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-orange-500 hover:text-orange-600 flex items-center gap-1">View All <ChevronRight size={12} /></button>
                    </div>
                    <div className="space-y-4">
                      {Object.entries(STATUS_CONFIG).map(([key, cfg]) => {
                        const count = orders.filter(o => o.status === key).length;
                        const pct = orders.length > 0 ? (count / orders.length) * 100 : 0;
                        return (
                          <div key={key} className="space-y-2">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <div className={\`w-2 h-2 rounded-full \${cfg.dot}\`} />
                                <span className="text-xs font-semibold text-gray-600">{key}</span>
                              </div>
                              <span className="text-xs font-semibold text-gray-400">{count} <span className="text-gray-300 font-normal">({pct.toFixed(0)}%)</span></span>
                            </div>
                            <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                              <div className={\`h-full rounded-full transition-all duration-700 \${cfg.dot}\`} style={{ width: pct + '%' }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="lg:col-span-2 flex flex-col gap-4">
                    <div className="bg-gray-900 rounded-2xl p-6 shadow-md relative overflow-hidden flex-1">
                      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-orange-500 opacity-[0.08] pointer-events-none" />
                      <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-bold text-white text-sm leading-none">System Status</h3>
                          <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0">Optimal</span>
                        </div>
                        <p className="text-gray-400 text-xs leading-relaxed">Monitoring <span className="text-white font-semibold">{pendingOrders} active</span> orders in real-time.</p>
                        <div className="pt-1">
                          <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-700" style={{ width: '88%' }} />
                          </div>
                          <div className="flex justify-between mt-2">
                            <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider">System Load</span>
                            <span className="text-amber-400 font-bold text-sm leading-none">88%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Actions</p>
                      <div className="flex flex-col gap-2">
                        {[
                          { label: 'Review Orders', icon: ShoppingBag, action: () => setActiveTab('orders'), accent: '#F97316' },
                          { label: 'Add Menu Item', icon: Plus, action: () => { setActiveTab('menu'); setShowAddForm(true); }, accent: '#10B981' },
                        ].map(({ label, icon: Icon, action, accent }) => (
                          <button key={label} onClick={action} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 hover:bg-orange-50 active:scale-[0.98] transition-all text-left group">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: accent + '15' }}><Icon size={13} style={{ color: accent }} /></div>
                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">{label}</span>
                            <ChevronRight size={13} className="ml-auto text-gray-300 group-hover:text-orange-400 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ ORDERS ═══ */}
            {activeTab === 'orders' && (
              <div className="space-y-5 pb-20">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center bg-white border border-gray-100 rounded-xl px-3 h-10 flex-1 shadow-sm focus-within:border-orange-200 transition-all">
                    <Search size={13} className="text-gray-400 mr-2 shrink-0" />
                    <input type="text" placeholder="Search by name or order ID…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400" />
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                    {ORDER_FILTERS.map(f => {
                      const count = f === 'All' ? orders.length : orders.filter(o => o.status === f).length;
                      return (
                        <button key={f} onClick={() => setOrderFilter(f)}
                          className={\`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border \${orderFilter === f ? 'bg-orange-500 text-white border-orange-500 shadow-sm' : 'bg-white text-gray-500 border-gray-100 hover:border-orange-200 hover:text-orange-500'}\`}>
                          {f}{count > 0 && <span className="ml-1 opacity-60">{count}</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-20 text-gray-400 text-sm">Loading orders…</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-24 flex flex-col items-center gap-4 opacity-25"><Receipt size={52} /><p className="font-bold text-xl">No orders found</p></div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="hidden md:grid md:grid-cols-[80px_1fr_150px_80px_90px] gap-4 px-6 py-3 border-b border-gray-50 bg-gray-50/60">
                      {['Order ID', 'Customer & Items', 'Status', 'Total', 'Actions'].map(h => (
                        <span key={h} className="text-[10px] font-bold text-gray-400 uppercase tracking-wider last:text-right">{h}</span>
                      ))}
                    </div>
                    <div className="divide-y divide-gray-50">
                      {filteredOrders.map(o => (
                        <div key={o.id} className="hover:bg-gray-50/50 transition-colors">
                          {/* Desktop */}
                          <div className="hidden md:grid md:grid-cols-[80px_1fr_150px_80px_90px] gap-4 px-6 py-4 items-center">
                            <div>
                              <p className="text-xs font-bold text-gray-800">#{o.id.slice(-6).toUpperCase()}</p>
                              {o.timestamp && <p className="text-[10px] text-gray-400 mt-0.5">{new Date(o.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-gray-800 truncate">{o.customerName || 'Anonymous'}</p>
                              <p className="text-xs text-gray-400 truncate mt-0.5">{o.items?.map(i => i.name + ' ×' + i.qty).join(', ')}</p>
                            </div>
                            <div className="relative">
                              <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                className="appearance-none w-full text-[11px] font-semibold pl-2.5 pr-7 py-1.5 rounded-full border border-gray-200 cursor-pointer outline-none bg-transparent text-gray-700">
                                <option value="Accepted">Accepted</option>
                                <option value="Preparing">Preparing</option>
                                <option value="Out for Delivery">Delivery</option>
                                <option value="Delivered">Delivered</option>
                              </select>
                              <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                            </div>
                            <p className="text-sm font-bold text-gray-900">₹{o.total}</p>
                            <div className="flex items-center justify-end gap-1.5">
                              <button onClick={() => { setSelectedInvoiceOrder(o); setIsInvoiceOpen(true); }} title="Invoice"
                                className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 hover:border-orange-100 transition-all">
                                <FileText size={12} />
                              </button>
                              <button onClick={() => deleteOrder(o.id)} title="Delete"
                                className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          {/* Mobile */}
                          <div className="md:hidden px-4 py-4 space-y-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0"><Receipt size={16} className="text-orange-400" /></div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">#{o.id.slice(-6).toUpperCase()}</p>
                                  <p className="text-xs text-gray-500">{o.customerName || 'Anonymous'}</p>
                                </div>
                              </div>
                              <StatusPill status={o.status} />
                            </div>
                            <p className="text-xs text-gray-400 pl-[52px]">{o.items?.map(i => i.name + ' ×' + i.qty).join(', ')}</p>
                            <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                              <p className="text-base font-bold text-gray-900">₹{o.total}</p>
                              <div className="flex items-center gap-2">
                                <div className="relative">
                                  <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                                    className="appearance-none text-xs font-semibold pl-3 pr-7 py-1.5 rounded-xl bg-gray-900 text-white border-none cursor-pointer outline-none">
                                    <option value="Accepted">Accepted</option><option value="Preparing">Preparing</option>
                                    <option value="Out for Delivery">Delivery</option><option value="Delivered">Delivered</option>
                                  </select>
                                  <ChevronDown size={10} className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-white/50" />
                                </div>
                                <button onClick={() => { setSelectedInvoiceOrder(o); setIsInvoiceOpen(true); }} className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-orange-50 hover:text-orange-500 transition-all"><FileText size={12} /></button>
                                <button onClick={() => deleteOrder(o.id)} className="w-7 h-7 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 transition-all"><Trash2 size={12} /></button>
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

            {/* ═══ MENU ═══ */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                  <div className="flex items-center bg-white border border-gray-100 rounded-xl px-3 h-10 w-full sm:max-w-xs shadow-sm focus-within:border-orange-200 transition-all">
                    <Search size={13} className="text-gray-400 mr-2 shrink-0" />
                    <input type="text" placeholder="Search by name or category…" value={menuSearch} onChange={e => setMenuSearch(e.target.value)}
                      className="bg-transparent border-none outline-none w-full text-sm text-gray-700 placeholder:text-gray-400" />
                    {menuSearch && <button onClick={() => setMenuSearch('')} className="text-gray-400 hover:text-gray-600"><X size={13} /></button>}
                  </div>
                  <button onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm font-semibold transition-all shadow-sm">
                    <Plus size={15} />{showAddForm ? 'Hide Form' : 'Add Item'}
                  </button>
                </div>

                {showAddForm && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1 h-5 bg-orange-500 rounded-full" />
                      <h3 className="font-bold text-gray-900">New Menu Item</h3>
                    </div>
                    <form onSubmit={addMenuItem}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {[
                          { label: 'Item Name', key: 'name', placeholder: 'e.g. Vintage Mocha', type: 'text' },
                          { label: 'Category', key: 'category', placeholder: 'e.g. Signature', type: 'text' },
                          { label: 'Price (₹)', key: 'price', placeholder: '0.00', type: 'number' },
                        ].map(({ label, key, placeholder, type }) => (
                          <div key={key} className="space-y-1.5">
                            <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{label}</label>
                            <input type={type} placeholder={placeholder} required value={newItem[key]}
                              onChange={e => setNewItem({ ...newItem, [key]: e.target.value })}
                              className="w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 font-medium text-gray-800 text-sm outline-none focus:border-orange-300 focus:bg-white transition-all" />
                          </div>
                        ))}
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Photo</label>
                          <div className="relative">
                            <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="menu-img" />
                            <label htmlFor="menu-img" className="flex items-center gap-2 w-full px-3.5 py-2.5 rounded-xl bg-gray-50 border border-gray-100 cursor-pointer hover:bg-orange-50 hover:border-orange-100 transition-all">
                              {filePreview ? <img src={filePreview} alt="preview" className="w-5 h-5 rounded object-cover shrink-0" /> : <ImageIcon size={14} className="text-gray-400 shrink-0" />}
                              <span className="text-xs font-medium text-gray-500 truncate">{selectedFile ? selectedFile.name : 'Choose image'}</span>
                            </label>
                            {uploadProgress > 0 && uploadProgress < 100 && (
                              <div className="absolute -bottom-5 left-1 text-[9px] font-semibold text-orange-500">Uploading {uploadProgress.toFixed(0)}%</div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mb-5">
                        <button type="button" onClick={() => setNewItem({ ...newItem, inStock: !newItem.inStock })}
                          className={\`w-11 h-6 rounded-full p-0.5 transition-all duration-300 \${newItem.inStock ? 'bg-emerald-500' : 'bg-gray-200'}\`}>
                          <div className={\`w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-300 \${newItem.inStock ? 'translate-x-5' : 'translate-x-0'}\`} />
                        </button>
                        <span className="text-sm font-medium text-gray-700">{newItem.inStock ? 'In Stock' : 'Out of Stock'}</span>
                      </div>
                      <button type="submit" className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm transition-all shadow-sm">Publish to Menu</button>
                    </form>
                  </div>
                )}

                {filteredMenu.length === 0 ? (
                  <div className="text-center py-20 flex flex-col items-center gap-3 opacity-20"><UtensilsCrossed size={52} /><p className="font-bold text-xl">No items found</p></div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMenu.map(item => (
                      <div key={item.id} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group flex flex-col">
                        <div className="h-44 bg-gray-50 relative overflow-hidden">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center"><Coffee size={32} className="text-gray-200" /></div>
                          )}
                          <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl font-bold text-sm text-gray-900 shadow-sm border border-gray-100">₹{item.price}</div>
                          <button onClick={() => deleteMenuItem(item.id, item.name)} title="Delete"
                            className="absolute top-3 left-3 w-8 h-8 rounded-xl bg-white/90 backdrop-blur-sm border border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all">
                            <Trash2 size={13} />
                          </button>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="p-4 flex-1 flex flex-col gap-2.5">
                          <h4 className="font-bold text-sm text-gray-900 truncate">{item.name}</h4>
                          <span className="inline-block self-start text-[9px] font-semibold text-orange-500 uppercase tracking-wider bg-orange-50 px-2.5 py-1 rounded-lg">{item.category}</span>
                          <div className="mt-auto pt-3 border-t border-gray-50">
                            <button onClick={() => toggleStock(item)} className="flex items-center gap-2.5">
                              <div className={\`w-9 h-[18px] rounded-full p-0.5 transition-all duration-300 \${item.inStock ? 'bg-emerald-500' : 'bg-gray-200'}\`}>
                                <div className={\`w-3.5 h-3.5 bg-white rounded-full shadow transform transition-transform duration-300 \${item.inStock ? 'translate-x-[18px]' : 'translate-x-0'}\`} />
                              </div>
                              <span className={\`text-xs font-semibold \${item.inStock ? 'text-emerald-600' : 'text-gray-400'}\`}>{item.inStock ? 'Available' : 'Sold Out'}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </main>
      </div>

      <InvoiceModal isOpen={isInvoiceOpen} onClose={() => setIsInvoiceOpen(false)} order={selectedInvoiceOrder} />
    </div>
  );
}
`;

fs.writeFileSync(path.join(__dirname, '..', 'app', 'admin', 'page.js'), code, 'utf8');
console.log('Written', fs.statSync(path.join(__dirname, '..', 'app', 'admin', 'page.js')).size, 'bytes');
