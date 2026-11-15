/* =========================================================
   CONFIG
   ========================================================= */
const API_URL = 'https://script.google.com/macros/s/AKfycbz9PyC9H_sAP4RhSwhOiTqHLO96PRd7pw2K_MRdVJvyZHGOpWtYP8zBr3U57efPACnURw/exec';   // Apps Script "Web app URL" (index.html wala hi). Khali = demo mode (password: demo)
const CURRENCY = 'Rs.';
const LOW_STOCK = 5;             // is se kam stock "low" dikhega

/* ========================================================= */
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => `${CURRENCY} ${Number(n||0).toLocaleString('en-US')}`;
const REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
const TOUCH = matchMedia('(hover:none)').matches;
function imgUrl(u){
  u = String(u||'').trim(); if(!u) return '';
  const m = u.match(/drive\.google\.com\/file\/d\/([\w-]+)/) || u.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/);
  return m ? `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1200` : u;
}
const ph = t => `<div class="ph">${esc(t||'No image')}</div>`;
const pic = (u, alt) => { const x = imgUrl(u); return x ? `<img src="${esc(x)}" alt="${esc(alt)}" loading="lazy" referrerpolicy="no-referrer" data-fb="1">` : ph('No image'); };
document.addEventListener('error', e => { if(e.target.tagName==='IMG' && e.target.dataset.fb){ e.target.outerHTML = ph('Image load nahi hui'); } }, true);
let tt;
function toast(m, err){ const t = $('#toast'); t.textContent = m; t.className = 'toast'; void t.offsetWidth; t.className = 'toast on' + (err?' err':''); clearTimeout(tt); tt = setTimeout(()=>t.classList.remove('on'), 3000); }

/* ---------- API (+ demo mode) ---------- */
let PW = '';
const DEMO = {
  statuses:['New','Confirmed','Shipped','Delivered','Cancelled'],
  products:[
    {id:'P001',name:'Alkaram Lawn',price:2750,stock:12,image:'',category:'Unstitch Suit',description:'Premium lawn.',status:'Active'},
    {id:'P002',name:'Bareeze Dhanak 3pc',price:2500,stock:3,image:'',category:'Unstitched Suit',description:'Dhanak suit.',status:'Active'},
    {id:'P003',name:'Linen',price:2300,stock:0,image:'',category:'Unstitch Suit',description:'Linen.',status:'Hidden'}],
  orders:[
    {orderId:'LH-261022-4821',date:new Date().toISOString().slice(0,10)+' 10:42',name:'Ayesha Khan',phone:'03001234567',address:'House 12, Street 4, Lahore',productId:'P001',product:'Alkaram Lawn',qty:1,total:2750,status:'Confirmed'},
    {orderId:'LH-261022-4821',date:new Date().toISOString().slice(0,10)+' 10:42',name:'Ayesha Khan',phone:'03001234567',address:'House 12, Street 4, Lahore',productId:'P002',product:'Bareeze Dhanak 3pc',qty:2,total:5000,status:'Confirmed'}],
  messages:[{date:'2026-10-21 18:20',name:'Sana',contact:'sana@example.com',message:'Kya aap COD Karachi mein karte hain?'}]
};
async function api(body){
  if(!API_URL){
    await new Promise(r=>setTimeout(r,250));
    if((body.password ?? PW) !== 'demo') return {ok:false, auth:false, error:'Wrong password'};
    switch(body.action){
      case 'adminLogin': return {ok:true};
      case 'adminLoad':  return {ok:true, ...JSON.parse(JSON.stringify(DEMO))};
      case 'adminSaveProduct': { const p = body.product; if(p.id){ Object.assign(DEMO.products.find(x=>x.id===p.id)||{}, p); } else { p.id='P'+String(DEMO.products.length+1).padStart(3,'0'); DEMO.products.push(p); } return {ok:true}; }
      case 'adminDeleteProduct': DEMO.products = DEMO.products.filter(x=>x.id!==body.id); return {ok:true};
      case 'adminSetStatus': DEMO.orders.forEach(o=>{ if(o.orderId===body.orderId) o.status = body.status; }); return {ok:true};
      case 'adminUploadImage': return {ok:true, url:'data:image/jpeg;base64,'+body.data};
    }
    return {ok:false, error:'Unknown'};
  }
  let txt;
  try{
    const r = await fetch(API_URL, {method:'POST', redirect:'follow', body: JSON.stringify({...body, password: PW})});
    txt = await r.text();
  }catch(e){ throw new Error('Browser server tak pahunch nahi saka (' + (e.message||'network') + '). URL ya Deploy access (Anyone) check karein.'); }
  try{ return JSON.parse(txt); }
  catch(e){ throw new Error('Server ne jawab diya lekin sahi format mein nahi: "' + txt.replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,170) + '"'); }
}

/* ---------- state ---------- */
let D = {products:[], orders:[], messages:[], statuses:['New','Confirmed','Shipped','Delivered','Cancelled']};
let view = 'overview';
let ofilter = {q:'', s:'All'};
let chart = {range:7, metric:'orders'};
const FLOW = ['New','Confirmed','Shipped','Delivered'];
const STCOL = {New:'#5ab8ff',Confirmed:'#e6c27a',Shipped:'#c59bff',Delivered:'#2fe0d8',Cancelled:'#ff6b81'};

/* ---------- login ---------- */
async function enter(pw, silent){
  PW = pw;
  const r = await api({action:'adminLogin', password: pw}).catch(e=>({ok:false, error:e.message || 'Server se connect nahi ho saka'}));
  if(!r.ok){
    PW=''; try{ sessionStorage.removeItem('lh_admin'); }catch(e){}
    if(!silent) $('#loginErr').textContent = r.auth===false
      ? (API_URL ? 'Password galat hai. (Agar sahi hai, to Apps Script mein Deploy > Manage deployments > New version deploy karein.)' : 'Demo mode: password "demo" likhein, ya API_URL daalein.')
      : (r.error||'Error');
    return false;
  }
  try{ sessionStorage.setItem('lh_admin', pw); }catch(e){}
  $('#login').hidden = true; $('#app').hidden = false;
  await load(); return true;
}
$('#loginForm').addEventListener('submit', async e => {
  e.preventDefault(); const b = $('#loginBtn'); b.disabled = true; b.textContent = 'Checking…'; $('#loginErr').textContent='';
  await enter($('#pw').value);
  b.disabled = false; b.textContent = 'Unlock dashboard';
});
function logout(){ PW=''; try{sessionStorage.removeItem('lh_admin');}catch(e){} $('#app').hidden = true; $('#login').hidden = false; $('#pw').value=''; closeCmd(); }
$('#logout').onclick = logout; $('#logout2').onclick = logout;

/* ---------- load ---------- */
async function load(quiet){
  if(!quiet) $('#view').innerHTML = '<div class="skel"></div><div class="skel"></div>';
  try{
    const r = await api({action:'adminLoad'});
    if(!r.ok){ if(r.auth===false) return logout(); throw new Error(r.error); }
    D = r; setLive(true);
  }catch(e){ setLive(false); toast(e.message || 'Data load nahi hua', true); }
  render(quiet);
}
$('#refresh').onclick = () => load();

/* ---------- helpers ---------- */
function groupOrders(){
  const m = new Map();
  D.orders.forEach(o => {
    if(!m.has(o.orderId)) m.set(o.orderId, {orderId:o.orderId, date:o.date, name:o.name, phone:o.phone, address:o.address, status:o.status, items:[], total:0});
    const g = m.get(o.orderId); g.items.push(o); g.total += o.total;
  });
  return [...m.values()];
}
function waLink(phone){ let d = String(phone).replace(/\D/g,''); if(d.startsWith('00')) d = d.slice(2); else if(d.startsWith('0')) d = '92'+d.slice(1); return 'https://wa.me/'+d; }
const stChip = s => ({New:'blue',Confirmed:'warn',Shipped:'warn',Delivered:'ok',Cancelled:'bad'}[s]||'');
function setLive(ok){
  const l = $('#live'), t = $('#liveTxt'); if(!l) return;
  l.classList.toggle('demo', !API_URL);
  t.textContent = !API_URL ? 'Demo mode' : (ok ? 'Live · Google Sheet' : 'Offline');
}

/* ---------- views ---------- */
const TITLES = {overview:['Overview','Aapke store ka snapshot'], products:['Products','Price, stock, images aur status yahan se badlein'], orders:['Orders','Order ka status pipeline se badlein'], messages:['Messages','Contact form ke messages']};
let ORDERS = [];
function render(quiet){
  const [t,s] = TITLES[view];
  const h = $('#title'); if(h.textContent !== t){ h.textContent = t; if(!REDUCE){ h.classList.remove('pop'); void h.offsetWidth; h.classList.add('pop'); } }
  $('#sub').textContent = s;
  $('#addP').hidden = view !== 'products';
  $$('.tab[data-view]').forEach(b => b.classList.toggle('on', b.dataset.view === view));
  ORDERS = groupOrders();
  const nNew = ORDERS.filter(o=>o.status==='New').length, nb = $('#nNew'); nb.hidden = !nNew; nb.textContent = nNew;
  ({overview:vOverview, products:vProducts, orders:vOrders, messages:vMessages})[view](ORDERS);
  animateCounts(); if(!quiet) stagger(); moveInd();
}

function vOverview(orders){
  const live = orders.filter(o=>o.status!=='Cancelled');
  const revenue = live.reduce((s,o)=>s+o.total,0);
  const act = D.products.filter(p=>p.status!=='Hidden');
  const out = act.filter(p=>p.stock<=0), low = act.filter(p=>p.stock>0 && p.stock<=LOW_STOCK);
  const nNew = orders.filter(o=>o.status==='New').length;
  const counts = {}; D.statuses.forEach(s => counts[s] = orders.filter(o=>o.status===s).length);
  const total = Math.max(1, orders.length);
  $('#view').innerHTML = `
  <div class="stats">
    <div class="stat tilt"><small>Revenue (cancelled ke baghair)</small><b data-count="${revenue}" data-money="1">${money(revenue)}</b><span>${live.length} orders</span></div>
    <div class="stat tilt" style="--g:#9fd4ff"><small>New orders</small><b data-count="${nNew}">${nNew}</b><span>${orders.length} total</span></div>
    <div class="stat tilt" style="--g:#f3dca4"><small>Active products</small><b data-count="${act.length}">${act.length}</b><span>${D.products.length-act.length} hidden</span></div>
    <div class="stat tilt" style="--g:#ffb3c0"><small>Stock alerts</small><b data-count="${out.length+low.length}">${out.length+low.length}</b><span>${out.length} sold out · ${low.length} low</span></div>
  </div>
  <div class="cols">
    <div class="panel">
      <div class="chead">
        <div><small id="chartLbl">Orders</small><div class="big" id="chartTotal">0</div></div>
        <div class="ctrl">
          <div class="seg" id="segMetric"><button data-metric="orders" class="${chart.metric==='orders'?'on':''}">Orders</button><button data-metric="revenue" class="${chart.metric==='revenue'?'on':''}">Revenue</button></div>
          <div class="seg" id="segRange">${[7,14,30].map(n=>`<button data-range="${n}" class="${chart.range===n?'on':''}">${n}D</button>`).join('')}</div>
        </div>
      </div>
      <div class="chartwrap"><div class="chart" id="chart"></div><div class="tip" id="tip"></div></div>
    </div>
    <div class="panel"><h3>Needs attention</h3>
      ${[...out.map(p=>({p,c:'bad',t:'Sold out'})),...low.map(p=>({p,c:'warn',t:p.stock+' left'}))].map(x=>`<div class="list-row"><span>${esc(x.p.name)}</span><span class="chip ${x.c}">${x.t}</span></div>`).join('') || '<div class="muted" style="padding:20px 0">Sab stock theek hai ✓</div>'}
    </div>
  </div>
  <div class="cols" style="margin-top:16px;grid-template-columns:1fr 1.4fr">
    <div class="panel"><h3>Order pipeline</h3>
      <div class="dist">${D.statuses.map(s=>`<button class="drow" data-gofilter="${s}" style="--c:${STCOL[s]||'#2fe0d8'}"><span>${s}</span><div class="trk"><i style="--w:${(counts[s]/total*100).toFixed(1)}%"></i></div><b>${counts[s]}</b></button>`).join('')}</div>
    </div>
    <div class="panel"><h3>Recent orders <button class="btn sm" data-go="orders">View all</button></h3>
      ${orders.slice(0,5).map(o=>`<div class="list-row"><span><b>${esc(o.name)}</b> <span class="muted">· ${esc(o.orderId)}</span></span><span>${money(o.total)} <span class="chip ${stChip(o.status)}">${esc(o.status)}</span></span></div>`).join('') || '<div class="muted" style="padding:20px 0">Abhi koi order nahi.</div>'}
    </div>
  </div>`;
  drawChart();
}

/* ---------- interactive chart ---------- */
function series(){
  const n = chart.range, key = d => d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const days = [...Array(n)].map((_,i) => { const d = new Date(); d.setHours(12,0,0,0); d.setDate(d.getDate()-(n-1-i)); return d; });
  return days.map(d => {
    const os = ORDERS.filter(o => String(o.date).slice(0,10) === key(d));
    return {d, v: chart.metric==='orders' ? os.length : os.filter(o=>o.status!=='Cancelled').reduce((s,o)=>s+o.total,0)};
  });
}
function countTo(el, end, isMoney){
  if(REDUCE){ el.textContent = isMoney ? money(end) : end; return; }
  const t0 = performance.now(), dur = 700, from = Number(el.dataset.v||0); el.dataset.v = end;
  (function step(t){ const k = Math.min(1,(t-t0)/dur), v = Math.round(from + (end-from)*(1-Math.pow(1-k,3))); el.textContent = isMoney ? money(v) : v; if(k<1) requestAnimationFrame(step); })(t0);
}
function drawChart(){
  const el = $('#chart'); if(!el) return;
  const pts = series(), W = Math.max(280, el.clientWidth), H = el.clientHeight || 230, pl = 14, pr = 14, pt = 22, pb = 28;
  const max = Math.max(1, ...pts.map(p=>p.v)), n = pts.length, isMoney = chart.metric === 'revenue';
  const X = i => pl + (W-pl-pr) * (n===1 ? .5 : i/(n-1)), Y = v => pt + (H-pt-pb) * (1 - v/max);
  let d = ''; pts.forEach((p,i) => { const x = X(i), y = Y(p.v); if(!i) d += `M${x.toFixed(1)},${y.toFixed(1)}`; else { const px = X(i-1), py = Y(pts[i-1].v), cx = (px+x)/2; d += ` C${cx.toFixed(1)},${py.toFixed(1)} ${cx.toFixed(1)},${y.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`; } });
  const area = d + ` L${X(n-1).toFixed(1)},${H-pb} L${X(0).toFixed(1)},${H-pb} Z`;
  const step = n > 20 ? 5 : n > 10 ? 2 : 1;
  const grid = [0,.25,.5,.75,1].map(f => { const y = pt + (H-pt-pb)*f; return `<line class="gl" x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}"/>`; }).join('');
  const labels = pts.map((p,i) => (i % step === 0 || i === n-1) ? `<text x="${X(i)}" y="${H-8}" text-anchor="middle">${p.d.toLocaleString('en-GB',{day:'numeric',month:'short'})}</text>` : '').join('');
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Sales chart">
    <defs><linearGradient id="lg" x1="0" x2="1"><stop offset="0" stop-color="#2fe0d8"/><stop offset=".6" stop-color="#9ff3ee"/><stop offset="1" stop-color="#e6c27a"/></linearGradient>
    <linearGradient id="ag" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#2fe0d8" stop-opacity=".38"/><stop offset="1" stop-color="#2fe0d8" stop-opacity="0"/></linearGradient></defs>
    ${grid}${labels}<path class="ar" d="${area}"/><path class="ln" pathLength="1" d="${d}"/>
    <line class="cl" id="cl" x1="0" x2="0" y1="${pt-6}" y2="${H-pb}"/><circle class="cd" id="cd" r="6" cx="0" cy="0"/></svg>`;
  const total = pts.reduce((s,p)=>s+p.v,0);
  $('#chartLbl').textContent = (isMoney ? 'Revenue' : 'Orders') + ' · last ' + n + ' days';
  countTo($('#chartTotal'), total, isMoney);
  const tip = $('#tip'), cl = $('#cl'), cd = $('#cd');
  const move = e => {
    const r = el.getBoundingClientRect(), x = (e.clientX ?? e.touches?.[0]?.clientX) - r.left;
    const i = Math.max(0, Math.min(n-1, Math.round((x - pl) / (W-pl-pr) * (n-1)))), p = pts[i], cx = X(i), cy = Y(p.v);
    cl.setAttribute('x1', cx); cl.setAttribute('x2', cx); cd.setAttribute('cx', cx); cd.setAttribute('cy', cy);
    tip.innerHTML = `<small>${p.d.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}</small>${isMoney ? money(p.v) : p.v + (p.v===1?' order':' orders')}`;
    tip.style.left = Math.max(60, Math.min(r.width-60, cx)) + 'px'; tip.style.top = (cy + 4) + 'px'; tip.classList.add('on'); el.classList.add('hv');
  };
  el.onpointermove = move; el.onpointerdown = move;
  el.onpointerleave = () => { tip.classList.remove('on'); el.classList.remove('hv'); };
}
let rz; addEventListener('resize', () => { clearTimeout(rz); rz = setTimeout(() => { if(view==='overview' && $('#chart')) drawChart(); moveInd(); }, 150); });

/* ---------- products ---------- */
function vProducts(){
  $('#view').innerHTML = D.products.length ? `<div class="pgrid">${D.products.map(p=>{
    const hid = p.status==='Hidden', out = p.stock<=0, low = !out && p.stock<=LOW_STOCK;
    return `<div class="pcard tilt ${hid?'hid':''}"><div class="pimg">${pic(p.image,p.name)}<span class="chip ${hid?'':'ok'}">${hid?'Hidden':'Live'}</span></div>
      <div class="pbody"><h4>${esc(p.name)}</h4><small>${esc(p.id)} · ${esc(p.category||'No category')}</small>
        <div class="pmeta"><span>${money(p.price)}</span><span class="chip ${out?'bad':low?'warn':'ok'}">${out?'Sold out':p.stock+' in stock'}</span></div>
        <div class="pact"><button class="btn sm" data-edit="${esc(p.id)}">Edit</button><button class="btn sm" data-toggle="${esc(p.id)}">${hid?'Show':'Hide'}</button><button class="btn sm danger" data-del="${esc(p.id)}">Delete</button></div>
      </div></div>`; }).join('')}</div>`
  : `<div class="empty">Abhi koi product nahi. "Add product" dabayein.</div>`;
}

/* ---------- orders (interactive pipeline) ---------- */
function vOrders(orders){
  const statuses = ['All', ...D.statuses];
  const q = ofilter.q.toLowerCase();
  const list = orders.filter(o => (ofilter.s==='All' || o.status===ofilter.s) &&
    (!q || (o.orderId+o.name+o.phone+o.items.map(i=>i.product).join(' ')).toLowerCase().includes(q)));
  $('#view').innerHTML = `<div class="filters"><input id="oq" placeholder="Search order ID, name, phone, product…" value="${esc(ofilter.q)}">
    <div class="seg" id="segStatus">${statuses.map(s=>`<button data-fstatus="${s}" class="${s===ofilter.s?'on':''}">${s}</button>`).join('')}</div></div>` +
    (list.length ? list.map(o=>{
      const cancelled = o.status === 'Cancelled', idx = FLOW.indexOf(o.status), id = esc(o.orderId);
      return `<div class="ocard ${cancelled?'cx':''}">
      <div><span class="id">${id}</span><h4>${esc(o.name)}</h4><p>${esc(o.phone)}<br>${esc(o.address)}</p><p style="margin-top:6px">${esc(o.date)} · <span class="chip ${stChip(o.status)}">${esc(o.status)}</span></p></div>
      <div class="items">${o.items.map(i=>`<div><span>${esc(i.product)} × ${i.qty}</span><span>${money(i.total)}</span></div>`).join('')}<div class="tot"><span>Total (COD)</span><span>${money(o.total)}</span></div></div>
      <div class="side-act"><a class="btn sm" href="${esc(waLink(o.phone))}" target="_blank" rel="noopener">WhatsApp</a>
        ${cancelled ? `<button class="btn sm" data-set="${id}|New">Restore order</button>` : `<button class="btn sm danger" data-set="${id}|Cancelled">Cancel order</button>`}</div>
      <div class="pipe-wrap"><div class="pipe" style="--p:${cancelled||idx<0?0:idx/(FLOW.length-1)}"><i class="fill"></i>
        ${FLOW.map((s,k)=>`<button class="step ${!cancelled&&k<=idx?'done':''} ${!cancelled&&k===idx?'cur':''}" data-set="${id}|${s}" title="Mark as ${s}"><i>${!cancelled&&k<idx?'✓':k+1}</i>${s}</button>`).join('')}</div></div>
    </div>`; }).join('')
      : `<div class="empty">Koi order nahi mila.</div>`);
  $('#oq').oninput = e => { ofilter.q = e.target.value; const pos = e.target.selectionStart; vOrders(orders); const i = $('#oq'); i.focus(); i.setSelectionRange(pos,pos); };
}
async function setStatus(orderId, status){
  if(status === 'Cancelled' && !confirm('Is order ko cancel karna hai? Stock wapas add ho jayega.')) return;
  const r = await api({action:'adminSetStatus', orderId, status}).catch(err=>({ok:false,error:err.message}));
  if(!r.ok){ toast(r.error||'Status update nahi hua', true); return; }
  toast(status==='Cancelled' ? 'Order cancel, stock wapas add ho gaya' : `Status: ${status}`);
  await load(true);
}

function vMessages(){
  $('#view').innerHTML = D.messages.length ? D.messages.map(m=>`<div class="msg"><header><b>${esc(m.name)} <span class="muted" style="font-weight:500">· ${esc(m.contact||'no contact')}</span></b><span class="muted">${esc(m.date)}</span></header><p>${esc(m.message)}</p></div>`).join('')
    : `<div class="empty">Abhi koi message nahi.</div>`;
}

/* ---------- navigation ---------- */
function go(v, filter){ view = v; if(filter) ofilter = {q:'', s:filter}; render(); window.scrollTo({top:0, behavior: REDUCE ? 'auto' : 'smooth'}); }

/* ---------- events ---------- */
document.addEventListener('click', async e => {
  const b = e.target.closest('button'); if(!b) return;
  if(b.dataset.view)  return go(b.dataset.view);
  if(b.dataset.go)    return go(b.dataset.go);
  if(b.dataset.gofilter) return go('orders', b.dataset.gofilter);
  if(b.dataset.fstatus){ ofilter.s = b.dataset.fstatus; return vOrders(ORDERS); }
  if(b.dataset.metric){ chart.metric = b.dataset.metric; $$('#segMetric button').forEach(x=>x.classList.toggle('on', x===b)); return drawChart(); }
  if(b.dataset.range){ chart.range = +b.dataset.range; $$('#segRange button').forEach(x=>x.classList.toggle('on', x===b)); return drawChart(); }
  if(b.dataset.set){ const [id, st] = b.dataset.set.split('|'); return setStatus(id, st); }
  if(b.dataset.edit)  return openForm(D.products.find(p=>p.id===b.dataset.edit));
  if(b.dataset.toggle){
    const p = D.products.find(x=>x.id===b.dataset.toggle);
    return saveProduct({...p, status: p.status==='Hidden'?'Active':'Hidden'}, p.status==='Hidden'?'Product live ho gaya':'Product hide ho gaya');
  }
  if(b.dataset.del){
    const p = D.products.find(x=>x.id===b.dataset.del);
    if(!confirm(`"${p.name}" ko permanently delete karna hai?\n(Sirf hide karna ho to "Hide" use karein.)`)) return;
    b.disabled = true;
    const r = await api({action:'adminDeleteProduct', id:p.id}).catch(err=>({ok:false,error:err.message}));
    if(!r.ok) { toast(r.error||'Delete nahi hua', true); b.disabled=false; return; }
    toast('Product delete ho gaya'); return load(true);
  }
});
$('#addP').onclick = () => openForm(null);

/* ---------- product form ---------- */
function openForm(p){
  $('#pmTitle').textContent = p ? 'Edit product' : 'Add product';
  $('#fId').value = p?.id || ''; $('#fName').value = p?.name || ''; $('#fPrice').value = p?.price ?? ''; $('#fStock').value = p?.stock ?? '';
  $('#fImg').value = p?.image || ''; $('#fCat').value = p?.category || ''; $('#fDesc').value = p?.description || ''; $('#fStatus').value = p?.status || 'Active';
  prev(); $('#pm').classList.add('on'); setTimeout(()=>$('#fName').focus(), 50);
}
const closeForm = () => $('#pm').classList.remove('on');
function prev(){ $('#fPrev').innerHTML = pic($('#fImg').value, 'Preview'); }
$('#fImg').addEventListener('input', prev);
$('#pCancel').onclick = closeForm;
$('#pm').addEventListener('click', e => { if(e.target.id==='pm') closeForm(); });
$('#fUpBtn').onclick = () => $('#fFile').click();
$('#fFile').addEventListener('change', async e => {
  const f = e.target.files[0]; if(!f) return;
  const btn = $('#fUpBtn'); btn.disabled = true; btn.textContent = 'Uploading…';
  try{
    const data = await shrink(f, 1100);
    const r = await api({action:'adminUploadImage', data, mime:'image/jpeg', name:(($('#fName').value||'product').replace(/[^\w-]+/g,'-')).slice(0,40)});
    if(!r.ok) throw new Error(r.error || 'Upload fail');
    $('#fImg').value = r.url; prev(); toast('Image upload ho gayi. Ab "Save product" dabayein.');
  }catch(err){ toast(err.message || 'Upload nahi hui', true); }
  btn.disabled = false; btn.textContent = '⬆ Upload image'; e.target.value = '';
});
function shrink(file, max){      // image chhoti karke base64 (JPEG) banata hai
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const k = Math.min(1, max/Math.max(im.width, im.height)), c = document.createElement('canvas');
      c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
      const x = c.getContext('2d'); x.fillStyle='#fff'; x.fillRect(0,0,c.width,c.height); x.drawImage(im,0,0,c.width,c.height);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', .85).split(',')[1]);
    };
    im.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Ye image file nahi khul saki')); };
    im.src = url;
  });
}
async function saveProduct(p, okMsg){
  const r = await api({action:'adminSaveProduct', product:p}).catch(err=>({ok:false,error:err.message}));
  if(!r.ok){ toast(r.error || 'Save nahi hua', true); return false; }
  toast(okMsg || 'Product save ho gaya'); await load(true); return true;
}
$('#pForm').addEventListener('submit', async e => {
  e.preventDefault();
  const b = $('#pSave'); b.disabled = true; b.textContent = 'Saving…';
  const ok = await saveProduct({
    id:$('#fId').value, name:$('#fName').value.trim(), price:Number($('#fPrice').value), stock:Math.floor(Number($('#fStock').value)),
    image:$('#fImg').value.trim(), category:$('#fCat').value.trim(), description:$('#fDesc').value.trim(), status:$('#fStatus').value
  });
  b.disabled = false; b.textContent = 'Save product'; if(ok) closeForm();
});

/* =========================================================
   MOTION & INTERACTION
   ========================================================= */
function animateCounts(){
  if(REDUCE) return;
  $$('[data-count]').forEach(el => {
    const end = Number(el.dataset.count) || 0, isMoney = el.dataset.money, t0 = performance.now(), dur = 900;
    if(!end) return;
    (function step(t){ const k = Math.min(1,(t-t0)/dur), v = Math.round(end*(1-Math.pow(1-k,3))); el.textContent = isMoney ? money(v) : v; if(k<1) requestAnimationFrame(step); })(t0);
  });
}
function stagger(){
  if(REDUCE) return;
  $$('#view .stat,#view .panel,#view .pcard,#view .ocard,#view .msg,#view .filters,#view .empty').forEach((el,i) => { el.style.setProperty('--i', Math.min(i,14)); el.classList.remove('in'); void el.offsetWidth; el.classList.add('in'); });
}
function moveInd(){
  const on = $('.tab.on[data-view]'), ind = $('#ind'); if(!on || !ind || innerWidth <= 1020) return;
  ind.style.height = on.offsetHeight + 'px'; ind.style.transform = `translateY(${on.offsetTop}px)`; ind.style.opacity = 1;
}

/* pointer: spotlight, 3D tilt, magnetic buttons, cursor glow */
let gx = -999, gy = -999, tx = -999, ty = -999;
document.addEventListener('pointermove', e => {
  tx = e.clientX; ty = e.clientY;
  const t = e.target.closest ? e.target.closest('.stat,.panel,.pcard,.ocard,.msg,.login-card') : null;
  if(t){
    const r = t.getBoundingClientRect(), x = e.clientX-r.left, y = e.clientY-r.top;
    t.style.setProperty('--mx', x+'px'); t.style.setProperty('--my', y+'px');
    if(t.classList.contains('tilt') && !TOUCH && !REDUCE){ t.style.setProperty('--ry', ((x/r.width-.5)*9).toFixed(2)+'deg'); t.style.setProperty('--rx', (-(y/r.height-.5)*9).toFixed(2)+'deg'); }
  }
  const b = e.target.closest ? e.target.closest('.btn') : null;
  if(b && !TOUCH && !REDUCE){ const r = b.getBoundingClientRect(); b.style.setProperty('--tx', ((e.clientX-(r.left+r.width/2))*.16).toFixed(1)+'px'); b.style.setProperty('--ty', ((e.clientY-(r.top+r.height/2))*.22).toFixed(1)+'px'); }
});
document.addEventListener('pointerout', e => {
  const t = e.target.closest ? e.target.closest('.tilt') : null;
  if(t && !t.contains(e.relatedTarget)){ t.style.setProperty('--rx','0deg'); t.style.setProperty('--ry','0deg'); }
  const b = e.target.closest ? e.target.closest('.btn') : null;
  if(b && !b.contains(e.relatedTarget)){ b.style.setProperty('--tx','0px'); b.style.setProperty('--ty','0px'); }
});
document.addEventListener('pointerdown', e => {
  const b = e.target.closest ? e.target.closest('.btn') : null; if(!b || REDUCE) return;
  const r = b.getBoundingClientRect(), s = Math.max(r.width, r.height)*2, sp = document.createElement('span');
  sp.className = 'ripple'; sp.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX-r.left-s/2}px;top:${e.clientY-r.top-s/2}px`;
  b.appendChild(sp); setTimeout(()=>sp.remove(), 650);
});
(function glowLoop(){
  const g = $('#glow');
  if(g && !REDUCE && !TOUCH){ gx += (tx-gx)*.12; gy += (ty-gy)*.12; g.style.transform = `translate3d(${gx.toFixed(1)}px,${gy.toFixed(1)}px,0)`; requestAnimationFrame(glowLoop); }
})();

/* interactive particle network background */
(function(){
  const cv = $('#fx'); if(!cv) return;
  const ctx = cv.getContext('2d'); let W, H, P = [], mx = -999, my = -999;
  const mk = () => ({x:Math.random()*W, y:Math.random()*H, vx:(Math.random()-.5)*.28, vy:(Math.random()-.5)*.28, r:Math.random()*1.5+.6, g:Math.random()<.2});
  function size(){
    const dpr = Math.min(devicePixelRatio||1, 1.5); W = innerWidth; H = innerHeight; cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    const n = Math.min(TOUCH ? 34 : 72, Math.round(W*H/21000)); while(P.length < n) P.push(mk()); P.length = n;
  }
  addEventListener('resize', size); size();
  addEventListener('pointermove', e => { mx = e.clientX; my = e.clientY; });
  document.addEventListener('pointerleave', () => { mx = my = -999; });
  function frame(){
    ctx.clearRect(0,0,W,H);
    for(const p of P){
      p.x += p.vx; p.y += p.vy; if(p.x<0||p.x>W) p.vx*=-1; if(p.y<0||p.y>H) p.vy*=-1;
      const dx = p.x-mx, dy = p.y-my, d = Math.hypot(dx,dy);
      if(d < 150 && d > 0){ p.x += dx/d*(150-d)*.014; p.y += dy/d*(150-d)*.014; }
    }
    for(let i=0;i<P.length;i++){
      const a = P[i];
      for(let j=i+1;j<P.length;j++){ const b = P[j], d = Math.hypot(a.x-b.x,a.y-b.y); if(d<125){ ctx.strokeStyle = `rgba(47,224,216,${((1-d/125)*.2).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); } }
      const dm = Math.hypot(a.x-mx,a.y-my);
      if(dm<190){ ctx.strokeStyle = `rgba(230,194,122,${((1-dm/190)*.45).toFixed(3)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(mx,my); ctx.stroke(); }
      ctx.fillStyle = a.g ? 'rgba(230,194,122,.75)' : 'rgba(47,224,216,.6)'; ctx.beginPath(); ctx.arc(a.x,a.y,a.r,0,6.283); ctx.fill();
    }
    if(!REDUCE) requestAnimationFrame(frame);
  }
  frame();
})();

/* command palette (Ctrl/Cmd + K) */
const CMDS = () => [
  {t:'Go to Overview', k:'overview dashboard home', a:()=>go('overview')},
  {t:'Go to Products', k:'products items stock', a:()=>go('products')},
  {t:'Go to Orders', k:'orders sales', a:()=>go('orders')},
  {t:'Show new orders', k:'new pending orders', a:()=>go('orders','New')},
  {t:'Go to Messages', k:'messages contact inbox', a:()=>go('messages')},
  {t:'Add new product', k:'add create product', a:()=>{ go('products'); openForm(null); }},
  {t:'Refresh data', k:'refresh reload sync', a:()=>load()},
  {t:'Log out', k:'logout sign out', a:()=>logout()},
  ...D.products.map(p=>({t:'Edit: '+p.name, k:'edit product '+p.name+' '+p.id, a:()=>{ go('products'); openForm(p); }}))
];
let cmdSel = 0, cmdItems = [];
function cmdRender(){
  const q = $('#cmdIn').value.trim().toLowerCase();
  cmdItems = CMDS().filter(c => !q || (c.t+' '+c.k).toLowerCase().includes(q)).slice(0,9); cmdSel = 0;
  $('#cmdList').innerHTML = cmdItems.length ? cmdItems.map((c,i)=>`<button class="cmd-item ${i===0?'on':''}" data-ci="${i}"><span>${esc(c.t)}</span><kbd>↵</kbd></button>`).join('') : '<div class="cmd-empty">Kuch nahi mila.</div>';
}
function openCmd(){ if($('#app').hidden) return; $('#cmd').classList.add('on'); $('#cmdIn').value = ''; cmdRender(); setTimeout(()=>$('#cmdIn').focus(), 30); }
function closeCmd(){ $('#cmd').classList.remove('on'); }
function cmdRun(i){ const c = cmdItems[i]; if(!c) return; closeCmd(); c.a(); }
$('#openCmd').onclick = openCmd;
$('#cmdIn').addEventListener('input', cmdRender);
$('#cmd').addEventListener('click', e => { const it = e.target.closest('[data-ci]'); if(it) return cmdRun(+it.dataset.ci); if(e.target.id === 'cmd') closeCmd(); });
$('#cmd').addEventListener('pointermove', e => { const it = e.target.closest('[data-ci]'); if(it){ cmdSel = +it.dataset.ci; $$('.cmd-item').forEach((x,i)=>x.classList.toggle('on', i===cmdSel)); } });
document.addEventListener('keydown', e => {
  if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k'){ e.preventDefault(); $('#cmd').classList.contains('on') ? closeCmd() : openCmd(); return; }
  if(e.key === 'Escape'){ closeCmd(); closeForm(); return; }
  if($('#cmd').classList.contains('on')){
    if(e.key === 'ArrowDown' || e.key === 'ArrowUp'){ e.preventDefault(); cmdSel = (cmdSel + (e.key==='ArrowDown'?1:-1) + cmdItems.length) % Math.max(1,cmdItems.length); $$('.cmd-item').forEach((x,i)=>x.classList.toggle('on', i===cmdSel)); $$('.cmd-item')[cmdSel]?.scrollIntoView({block:'nearest'}); }
    if(e.key === 'Enter'){ e.preventDefault(); cmdRun(cmdSel); }
  }
});

/* ---------- connection check (login page) ---------- */
(async function(){
  const c = $('#conn'), set = (cls, t) => { c.className = 'status ' + cls; c.textContent = t; };
  if(!API_URL) return set('warn', 'DEMO MODE: API_URL khali hai, ye dashboard abhi Google Sheet se connected nahi hai. Is mode mein password sirf "demo" hai.');
  if(!/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(API_URL))
    return set('bad', 'API_URL sahi nahi lagta. Ye aisa hona chahiye: https://script.google.com/macros/s/.../exec (address bar wala "googleusercontent" link nahi).');
  try{
    const r = await fetch(API_URL + '?action=ping'); const t = await r.text(); JSON.parse(t);
    set('ok', '✓ Server connected. Ab password likhein.');
  }catch(e){ set('bad', '✗ Server tak nahi pahunch pa raha. Deploy settings mein "Who has access" = Anyone hona chahiye, aur URL /exec par khatam ho.'); }
})();

/* ---------- init ---------- */
$$('[data-logo]').forEach(i => { i.src = BRAND.logo; });
{ const f = document.createElement('link'); f.rel = 'icon'; f.href = BRAND.logo; document.head.appendChild(f); }
setLive(false);
(function(){ let pw=''; try{ pw = sessionStorage.getItem('lh_admin')||''; }catch(e){} if(pw) enter(pw, true); })();