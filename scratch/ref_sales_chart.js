// Run: node scratch/ref_sales_chart.js
const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '..', 'app', 'admin', 'page.js');
let code = fs.readFileSync(file, 'utf8');

// 1. Replace AreaChart function
const acStart = code.indexOf('function AreaChart({');
const acEnd = code.indexOf('}', code.indexOf('</svg>', acStart)) + 1;
if (acStart !== -1) {
  const newAreaChart = `function AreaChart({ data, labels }) {
  const W=700, H=260, PL=50, PR=20, PT=40, PB=30;
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
          <text x={PL-15} y={y+4} textAnchor="end" fontSize="12" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">
            {val>=1000?('₹'+(val/1000).toFixed(0)+'k'):('₹'+val)}
          </text>
        </g>
      ))}
      
      {/* Chart Area and Line */}
      <path d={area} fill="url(#ag)"/>
      <path d={line} fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      
      {/* X-axis labels */}
      {labels.map((l,i)=>(
        <text key={i} x={PL+(i/(labels.length-1))*cw} y={H-5} textAnchor="middle" fontSize="12" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">{l}</text>
      ))}
      
      {/* Tooltip on the peak */}
      <line x1={px-15} y1={py} x2={px} y2={py} stroke="#ea580c" strokeWidth="1.5"/>
      <circle cx={px} cy={py} r="4.5" fill="#ffffff" stroke="#ea580c" strokeWidth="2"/>
      
      {/* Tooltip Box */}
      <g transform={\`translate(\${px - 110}, \${py - 26})\`}>
        <rect x="0" y="0" width="95" height="52" rx="10" fill="#ffffff" filter="url(#shadow)"/>
        <text x="14" y="22" textAnchor="start" fontSize="13" fill="#ea580c" fontFamily="system-ui" fontWeight="700">
          ₹{(peakValue||0).toLocaleString()}
        </text>
        <text x="14" y="40" textAnchor="start" fontSize="11" fill="#94a3b8" fontFamily="system-ui" fontWeight="500">
          22 {peakLabel}
        </text>
      </g>
    </svg>
  );
}`;
  code = code.substring(0, acStart) + newAreaChart + code.substring(acEnd);
}

// 2. Replace the Sales Analytics card wrapper
const saStart = code.indexOf('{/* Revenue area chart */}');
const saEnd = code.indexOf('</div>', code.indexOf('<AreaChart')) + 6;

if (saStart !== -1 && saEnd !== -1) {
  const newSA = `{/* Revenue area chart */}
                <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]" style={{ padding: "18px" }}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-[22px] font-bold text-[#1e293b] tracking-tight">Sales Analytics</h3>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
                        <Calendar size={15} className="text-gray-400"/>
                        <span className="text-[13px] font-semibold text-gray-500">Sep 22, 2026</span>
                      </div>
                    </div>
                  </div>
                  <AreaChart data={monthlyRevenue} labels={chartLabels}/>
                </div>`;
  code = code.substring(0, saStart) + newSA + code.substring(saEnd);
}

fs.writeFileSync(file, code, 'utf8');
console.log('Updated Sales Analytics to match reference');
