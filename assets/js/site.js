/* Shared storefront engine: header/footer, products, cart, wishlist, checkout, animations. Pages: home, shop, cart, wishlist (+ layout on all) */
(function(){
document.documentElement.classList.add('js');
var L=window.LH,C=L.config,P=document.body.dataset.page,ALL=[],ST={q:'',cat:'',sort:''};
function $(s){return document.querySelector(s)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function get(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function money(n){return 'Rs. '+Number(n||0).toLocaleString('en-US')}
function img(u){u=String(u||'').trim();if(!u)return'';var m=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||u.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/);return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w600':u}
function nm(p){return (L.lang==='ur'&&p.name_ur)||p.name}
var cart=get('lh_cart',{}),wish=get('lh_wish',[]);
function save(){put('lh_cart',cart);put('lh_wish',wish);badges()}
function byId(id){return ALL.filter(function(p){return String(p.id)===String(id)})[0]}
function badges(){cart=get('lh_cart',{});wish=get('lh_wish',[]);var n=Object.keys(cart).reduce(function(a,k){return a+cart[k]},0);
 document.querySelectorAll('[data-bc]').forEach(function(b){b.textContent=n;b.hidden=!n});document.querySelectorAll('[data-bw]').forEach(function(b){b.textContent=wish.length;b.hidden=!wish.length})}
L.badges=badges;
/* ---------- layout ---------- */
var BAG='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
HEART='<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20.5s-8-4.6-8-10.7A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8c0 6.1-8 10.7-8 10.7Z"/></svg>';
function layout(){var cur=location.pathname.split('/').pop()||'index.html',N=[['home','index.html'],['shop','shop.html'],['about','about.html'],['contact','contact.html'],['track','track-order.html']];
 var links=N.map(function(n){return '<a href="'+n[1]+'" data-i18n="'+n[0]+'"'+(cur===n[1]?' class="on"':'')+'></a>'}).join('');
 $('#hdr').innerHTML='<div class="site-h" id="sh"><div class="s-wrap s-bar"><a class="s-logo" href="index.html"><img src="assets/img/logo.webp" alt="" width="40" height="40"><span>Libas-e-Haya<small>UNSTITCHED ELEGANCE</small></span></a><nav class="s-nav" aria-label="Main">'+links+'</nav><div class="s-act"><a class="s-ic" href="wishlist.html" aria-label="Wishlist">'+HEART+'<i data-bw hidden></i></a><a class="s-ic" href="cart.html" aria-label="Cart">'+BAG+'<i data-bc hidden></i></a><button class="s-ic txt" id="langBtn" type="button">اردو</button><button class="s-ic s-burger" id="burger" type="button" aria-label="Menu" aria-expanded="false">☰</button></div></div><nav class="s-drawer" id="drawer">'+links+'<a href="faq.html" data-i18n="faq"></a><a href="policies.html" data-i18n="policies"></a></nav></div>';
 var wa='https://wa.me/'+C.WHATSAPP;
 $('#ftr').innerHTML='<div class="s-foot"><div class="s-wrap s-fg"><div><a class="s-logo" href="index.html"><img src="assets/img/logo.webp" alt="" width="40" height="40"><span>Libas-e-Haya</span></a><p data-i18n="foot.p"></p></div><div><h4 data-i18n="foot.explore"></h4><a href="index.html" data-i18n="home"></a><a href="shop.html" data-i18n="shop"></a><a href="wishlist.html" data-i18n="wish"></a><a href="cart.html" data-i18n="cartn"></a></div><div><h4 data-i18n="foot.help"></h4><a href="track-order.html" data-i18n="track"></a><a href="faq.html" data-i18n="faq"></a><a href="policies.html" data-i18n="policies"></a><a href="about.html" data-i18n="about"></a></div><div><h4 data-i18n="foot.contact"></h4><a href="mailto:'+esc(C.EMAIL)+'">'+esc(C.EMAIL)+'</a><a href="tel:'+esc(C.PHONE.replace(/\s/g,''))+'" dir="ltr">'+esc(C.PHONE)+'</a><a href="'+wa+'" target="_blank" rel="noopener">WhatsApp</a><a href="'+esc(C.INSTAGRAM)+'" target="_blank" rel="noopener">Instagram</a></div></div><div class="s-wrap s-copy">© '+new Date().getFullYear()+' Libas-e-Haya. <span data-i18n="rights"></span></div></div>';
 $('#burger').onclick=function(){var d=$('#drawer'),o=d.classList.toggle('open');this.setAttribute('aria-expanded',o);this.textContent=o?'✕':'☰'};
 $('#langBtn').onclick=function(){L.setLang(L.lang==='ur'?'en':'ur')};
 var sh=$('#sh');function sc(){sh.classList.toggle('sc',scrollY>20)}addEventListener('scroll',sc,{passive:true});sc();
 document.querySelectorAll('[data-c]').forEach(function(a){var k=a.dataset.c,v={email:['mailto:'+C.EMAIL,C.EMAIL],phone:['tel:'+C.PHONE.replace(/\s/g,''),C.PHONE],wa:[wa,'WhatsApp'],ig:[C.INSTAGRAM,'Instagram']}[k];if(v){a.href=v[0];a.textContent=v[1]}})}
/* ---------- animation helpers ---------- */
function split(){document.querySelectorAll('.split').forEach(function(el){var t=el.textContent.trim();if(!t)return;el.setAttribute('aria-label',t);var i=0;el.innerHTML=t.split(/\s+/).map(function(w){return '<span class="w" style="--i:'+(i++)+'"><span>'+esc(w)+'</span></span>'}).join(' ')})}
var io='IntersectionObserver' in window?new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.1}):null;
function reveal(f){document.querySelectorAll('.rv:not(.in)').forEach(function(el){f||!io?el.classList.add('in'):io.observe(el)})}
/* ---------- products ---------- */
function useDemo(){ALL=(L.DEMO||[]).slice();L.isDemo=true;demoBar()}
function demoBar(){if($('.demo-bar'))return;var m=$('#main');if(m)m.insertAdjacentHTML('afterbegin','<div class="demo-bar" role="status">'+esc(L.t('demo.bar'))+'</div>')}
L.demoBar=demoBar;
/* Products: shown instantly from the last visit's cache, refreshed in the background; 9s timeout + 1 retry; demo fallback */
var CK='lh_pcache',READY=false;
function cached(){try{var o=JSON.parse(localStorage.getItem(CK));return o&&o.p&&o.p.length?o:null}catch(e){return null}}
function once(ms){var c=new AbortController(),t=setTimeout(function(){c.abort()},ms);
 return fetch(C.API_URL+'?action=products',{cache:'no-store',signal:c.signal}).then(function(r){return r.text()}).then(function(x){clearTimeout(t);var j=JSON.parse(x);if(!j.ok)throw 0;return j.products||[]},function(e){clearTimeout(t);throw e})}
function clean(){Object.keys(cart).forEach(function(id){if(!byId(id))delete cart[id]});wish=wish.filter(function(id){return byId(id)});save()}
var LOADP=null;
function load(){if(LOADP)return LOADP;var c=cached();
 var net=once(9000).catch(function(){return once(9000)}).then(function(list){
  if(!list.length){try{localStorage.removeItem(CK)}catch(e){}useDemo();if(READY)rerender();return ALL}
  var changed=!c||JSON.stringify(c.p)!==JSON.stringify(list);try{localStorage.setItem(CK,JSON.stringify({t:Date.now(),p:list}))}catch(e){}
  ALL=list;L.isDemo=false;var bar=$('.demo-bar');if(bar)bar.remove();clean();if(READY&&changed)rerender();READY=true;return ALL
 }).catch(function(){if(c){ALL=c.p;clean();return ALL}useDemo();return ALL});
 if(c){ALL=c.p;clean();READY=true;LOADP=Promise.resolve(ALL);net.then(function(){});return LOADP}
 LOADP=net;return LOADP}
L.getProducts=load;
function card(p,i){var out=p.stock<=0,u=img(p.image),h='product.html?id='+encodeURIComponent(p.id),w=wish.indexOf(p.id)>-1;
 return '<article class="pc rv" style="--d:'+(i%6*70)+'ms"><a class="pc-i" href="'+h+'">'+(u?'<img loading="lazy" src="'+esc(u)+'" alt="'+esc(p.name)+'">':'<div class="pc-ph">✦</div>')+(out?'<span class="pc-tag">'+esc(L.t('pd.out'))+'</span>':'')+'</a><button class="pc-w'+(w?' on':'')+'" data-w="'+esc(p.id)+'" aria-label="Wishlist">'+(w?'♥':'♡')+'</button><div class="pc-b"><span class="pc-c">'+esc(p.category||'')+'</span><h3><a href="'+h+'">'+esc(nm(p))+'</a></h3><div class="pc-f"><b>'+money(p.price)+'</b><button class="pc-add" data-a="'+esc(p.id)+'"'+(out?' disabled':'')+'>'+esc(out?L.t('pd.out'):'+ '+L.t('pd.add'))+'</button></div></div></article>'}
function skel(el,n){el.innerHTML=new Array(n+1).join('<div class="pc sk"></div>')}
function fail(el){el.innerHTML='<div class="empty"><p>'+esc(L.t('shop.err'))+'</p><button class="btn btn-ghost" id="retry">'+esc(L.t('shop.retry'))+'</button></div>';$('#retry').onclick=function(){boot()}}
function gridHTML(a){return a.map(card).join('')}
/* ---------- pages ---------- */
function rHome(){var g=$('#featGrid');if(g){g.innerHTML=gridHTML(ALL.filter(function(p){return p.stock>0}).concat(ALL.filter(function(p){return p.stock<=0})).slice(0,6))}}
function rShop(){var cats=[''].concat(ALL.map(function(p){return p.category}).filter(function(c,i,a){return c&&a.indexOf(c)===i}));
 $('#chips').innerHTML=cats.map(function(c){return '<button type="button" class="chip'+(ST.cat===c?' on':'')+'" data-cat="'+esc(c)+'">'+(c?esc(c):esc(L.t('shop.all')))+'</button>'}).join('');
 var q=ST.q.toLowerCase(),a=ALL.filter(function(p){return (!ST.cat||p.category===ST.cat)&&(!q||(p.name+' '+(p.category||'')+' '+(p.description||'')).toLowerCase().indexOf(q)>-1)});
 if(ST.sort==='lo')a.sort(function(x,y){return x.price-y.price});if(ST.sort==='hi')a.sort(function(x,y){return y.price-x.price});
 $('#count').textContent=L.t('shop.count').replace('{n}',a.length);
 $('#shopGrid').innerHTML=a.length?gridHTML(a):'<div class="empty">'+esc(L.t('shop.none'))+'</div>'}
function rWish(){var a=wish.map(byId).filter(Boolean),g=$('#wlGrid');g.innerHTML=a.length?gridHTML(a):'<div class="empty"><p>'+esc(L.t('wl.empty'))+'</p><a class="btn btn-primary" href="shop.html">'+esc(L.t('cart.start'))+'</a></div>'}
function lines(){return Object.keys(cart).map(function(id){var p=byId(id);return p&&{p:p,q:cart[id]}}).filter(Boolean)}
function rCart(){var ls=lines(),done=!$('#cDone').hidden;$('#cEmpty').hidden=done||ls.length>0;$('#cartMain').hidden=done||!ls.length;if(!ls.length)return;
 $('#cLines').innerHTML=ls.map(function(l){var u=img(l.p.image);return '<div class="cl"><a href="product.html?id='+encodeURIComponent(l.p.id)+'">'+(u?'<img src="'+esc(u)+'" alt="">':'<div class="pc-ph">✦</div>')+'</a><div><h3>'+esc(nm(l.p))+'</h3><small>'+money(l.p.price)+'</small><div class="qs"><button type="button" data-q="-1" data-id="'+esc(l.p.id)+'">−</button><b>'+l.q+'</b><button type="button" data-q="1" data-id="'+esc(l.p.id)+'">+</button></div></div><div class="lt">'+money(l.p.price*l.q)+'<br><button type="button" class="rm" data-rm="'+esc(l.p.id)+'">'+esc(L.t('cart.remove'))+'</button></div></div>'}).join('');
 var t=ls.reduce(function(a,l){return a+l.p.price*l.q},0);$('#cSum').innerHTML='<div class="row-t"><span>'+esc(L.t('cart.sub'))+'</span><span>'+money(t)+'</span></div><p class="note">'+esc(L.t('cart.note'))+'</p>'}
function rerender(){if(P==='home'&&ALL.length)rHome();if(P==='shop'&&ALL.length)rShop();if(P==='wishlist'&&ALL.length)rWish();if(P==='cart'&&ALL.length)rCart();reveal(true)}
async function order(e){e.preventDefault();if(L.isDemo)return $('#kErr').textContent=L.t('cart.e.demo');var n=$('#kName').value.trim(),ph=$('#kPhone').value.trim(),ad=$('#kAddr').value.trim(),er=$('#kErr'),b=$('#oBtn'),d=ph.replace(/\D/g,'');er.textContent='';
 if(n.length<2)return er.textContent=L.t('cart.e.name');if(d.length<10||d.length>13)return er.textContent=L.t('cart.e.phone');if(ad.length<8)return er.textContent=L.t('cart.e.addr');
 put('lh_user',{name:n,phone:ph,address:ad});var items=lines().map(function(l){return{id:l.p.id,qty:l.q}});b.disabled=true;b.textContent=L.t('cart.placing');
 try{var res=await (await fetch(C.API_URL,{method:'POST',body:JSON.stringify({action:'order',name:n,phone:ph,address:ad,items:items})})).json();if(!res.ok)throw 0;
  var o=get('lh_orders',[]).filter(function(x){return x.id!==res.orderId});o.unshift({id:res.orderId,date:new Date().toISOString()});put('lh_orders',o.slice(0,10));cart={};save();
  var d2=$('#cDone');d2.hidden=false;d2.innerHTML='<h2>'+esc(L.t('cart.ok'))+'</h2><div class="oid">'+esc(res.orderId)+'</div><p>'+esc(L.t('cart.okp'))+'</p><a class="btn btn-primary" href="track-order.html?id='+encodeURIComponent(res.orderId)+'">'+esc(L.t('cart.track'))+'</a><a class="btn btn-ghost" target="_blank" rel="noopener" href="https://wa.me/'+C.WHATSAPP+'?text='+encodeURIComponent('Salam, my order ID is '+res.orderId)+'">'+esc(L.t('cart.wa'))+'</a><a class="btn btn-ghost" href="shop.html">'+esc(L.t('cart.more'))+'</a>';rCart();scrollTo({top:0,behavior:'smooth'})}
 catch(x){er.textContent=L.t('cart.e.fail')}b.disabled=false;b.textContent=L.t('cart.place')}
/* ---------- events ---------- */
document.addEventListener('click',function(e){var t=e.target,a=t.closest('[data-a]'),w=t.closest('[data-w]'),q=t.closest('[data-q]'),rm=t.closest('[data-rm]'),c=t.closest('[data-cat]');
 if(a){var p=byId(a.dataset.a);if(p){cart[p.id]=Math.min(p.stock,(cart[p.id]||0)+1);save();L.toast(L.t('pd.added'))}}
 if(w){var id=w.dataset.w,k=wish.indexOf(id);k>-1?wish.splice(k,1):wish.push(id);save();rerender()}
 if(q){var i=q.dataset.id,p2=byId(i);cart[i]=Math.max(0,Math.min(p2.stock,(cart[i]||0)+ +q.dataset.q));if(!cart[i])delete cart[i];save();rCart()}
 if(rm){delete cart[rm.dataset.rm];save();rCart()}
 if(c){ST.cat=c.dataset.cat;rShop()}});
function boot(){var g={home:'#featGrid',shop:'#shopGrid',wishlist:'#wlGrid'}[P];if(!g&&P!=='cart')return;if(g)skel($(g),P==='home'?3:6);
 load().then(function(){rerender()}).catch(function(){if(g)fail($(g));else if(P==='cart')$('#cEmpty').hidden=false})}
if(['home','shop','wishlist','cart','product'].indexOf(P)>-1)load();   /* start fetching immediately */
document.addEventListener('lhlang',function(){split();rerender()});
document.addEventListener('DOMContentLoaded',function(){layout();L.apply();split();reveal();badges();
 if(P==='shop'){var u=get('lh_user',null),qq=new URLSearchParams(location.search).get('q');if(qq){ST.q=qq;$('#sq').value=qq}
  $('#sq').addEventListener('input',function(){ST.q=this.value;rShop()});$('#ss').addEventListener('change',function(){ST.sort=this.value;rShop()})}
 if(P==='cart'){var u2=get('lh_user',null);if(u2){$('#kName').value=u2.name||'';$('#kPhone').value=u2.phone||'';$('#kAddr').value=u2.address||''}$('#oForm').addEventListener('submit',order)}
 boot()});
})();