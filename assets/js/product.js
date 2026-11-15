/* Product detail page: ?id=  (uses the same Apps Script products endpoint + lh_cart / lh_wish as the store) */
(function(){var L=LH,C=L.config,P=null,ALL=[],qty=1;
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function get(k,d){try{var v=localStorage.getItem(k);return v?JSON.parse(v):d}catch(e){return d}}
function put(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function money(n){return 'Rs. '+Number(n||0).toLocaleString('en-US')}
function img(u){u=String(u||'').trim();if(!u)return'';var m=u.match(/drive\.google\.com\/file\/d\/([\w-]+)/)||u.match(/drive\.google\.com\/(?:open|uc)\?(?:[^#]*&)?id=([\w-]+)/);return m?'https://drive.google.com/thumbnail?id='+m[1]+'&sz=w1200':u}
function nm(p){return (L.lang==='ur'&&p.name_ur)||p.name}function ds(p){return (L.lang==='ur'&&p.desc_ur)||p.description||''}
function ph(){return '<div class="pd-ph">✦</div>'}
function show(){if(!P)return;var out=P.stock<=0,low=!out&&P.stock<=5,wish=get('lh_wish',[]).indexOf(P.id)>-1,u=img(P.image);
 $('pd').innerHTML='<div class="pd"><figure class="pd-img" id="pdImg">'+(u?'<img src="'+esc(u)+'" alt="'+esc(P.name)+'">':ph())+'</figure><div class="pd-info"><span class="pd-cat">'+esc(P.category||'')+'</span><h1>'+esc(nm(P))+'</h1><div class="pd-price">'+money(P.price)+'</div>'
 +'<div class="pd-stock '+(out?'bad':low?'warn':'ok')+'">'+esc(out?L.t('pd.out'):low?L.t('pd.low').replace('{n}',P.stock):L.t('pd.in'))+'</div><p>'+esc(ds(P))+'</p>'
 +(out?'':'<div class="pd-qty"><span>'+esc(L.t('pd.qty'))+'</span><button type="button" id="qm">−</button><b id="qv">'+qty+'</b><button type="button" id="qp">+</button></div>')
 +'<div class="pd-btns">'+(out?'':'<button class="btn btn-primary" id="addB">'+esc(L.t('pd.add'))+'</button>')+'<button class="btn" id="wishB">'+esc(L.t(wish?'pd.wished':'pd.wish'))+'</button><a class="btn" target="_blank" rel="noopener" href="https://wa.me/'+C.WHATSAPP+'?text='+encodeURIComponent('Salam, I want to order: '+P.name+' ('+money(P.price)+')\n'+location.href)+'">'+esc(L.t('pd.wa'))+'</a></div></div></div>';
 var i=$('pdImg');if(i&&u)i.onclick=function(){var lb=$('lb');lb.querySelector('img').src=u;lb.hidden=false};
 if(!out){$('qm').onclick=function(){qty=Math.max(1,qty-1);$('qv').textContent=qty};$('qp').onclick=function(){qty=Math.min(P.stock,qty+1);$('qv').textContent=qty};
  $('addB').onclick=function(){var c=get('lh_cart',{});c[P.id]=Math.min(P.stock,(c[P.id]||0)+qty);put('lh_cart',c);L.badges&&L.badges();L.toast(L.t('pd.added'))}}
 $('wishB').onclick=function(){var w=get('lh_wish',[]),k=w.indexOf(P.id);k>-1?w.splice(k,1):w.push(P.id);put('lh_wish',w);L.badges&&L.badges();show()};
 var rel=ALL.filter(function(p){return p.id!==P.id&&p.stock>0}).sort(function(a,b){return (b.category===P.category)-(a.category===P.category)}).slice(0,3);
 $('rel').innerHTML=rel.length?'<h2 class="rel-h">'+esc(L.t('pd.rel'))+'</h2><div class="rel">'+rel.map(function(p){var x=img(p.image);return '<a class="glass rel-c" href="product.html?id='+encodeURIComponent(p.id)+'"><div class="rel-i">'+(x?'<img loading="lazy" src="'+esc(x)+'" alt="">':ph())+'</div><b>'+esc(nm(p))+'</b><span>'+money(p.price)+'</span></a>'}).join('')+'</div>':'';
 document.title=nm(P)+' | Libas-e-Haya'}
async function init(){var id=new URLSearchParams(location.search).get('id');
 ALL=(await L.getProducts()).slice();
 P=ALL.filter(function(p){return String(p.id)===String(id)})[0]||(id?null:ALL[0]);   // no ?id= -> first product
 if(!P)$('pd').innerHTML='<div class="glass"><p>'+esc(L.t('pd.nf'))+'</p></div>';else show()}
document.addEventListener('lhlang',show);
document.addEventListener('keydown',function(e){if(e.key==='Escape')$('lb').hidden=true});
document.addEventListener('DOMContentLoaded',function(){$('lb').onclick=function(){this.hidden=true};init()})})();