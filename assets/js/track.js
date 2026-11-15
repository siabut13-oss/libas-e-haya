/* Track order: tries API action 'track'; falls back to a WhatsApp message if the backend doesn't support it yet */
(function(){var L=LH,C=L.config,STEPS=['New','Confirmed','Shipped','Delivered'];
function $(i){return document.getElementById(i)}
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function wa(id){return 'https://wa.me/'+C.WHATSAPP+'?text='+encodeURIComponent('Salam, please update me on my order '+id)}
function line(st){if(st==='Cancelled')return '<div class="trk-x">'+esc(L.t('st.Cancelled'))+'</div>';var k=STEPS.indexOf(st);
 return '<ol class="trk">'+STEPS.map(function(s,i){return '<li class="'+(i<=k?'on':'')+'"><i></i><span>'+esc(L.t('st.'+s))+'</span></li>'}).join('')+'</ol>'}
function recent(){var a=[];try{a=JSON.parse(localStorage.getItem('lh_orders')||'[]')}catch(e){}
 $('trkRecent').innerHTML=a.length?'<h2>'+esc(L.t('trk.recent'))+'</h2><div class="chips">'+a.map(function(o){return '<button type="button" class="chip" data-id="'+esc(o.id)+'">'+esc(o.id)+'</button>'}).join('')+'</div>':'';
 document.querySelectorAll('.chip').forEach(function(b){b.onclick=function(){$('tId').value=b.dataset.id;$('tId').focus()}})}
async function go(e){e.preventDefault();var id=$('tId').value.trim(),ph=$('tPh').value.trim(),b=$('tBtn'),out=$('trkRes');
 if(!id){return L.toast(L.t('trk.need'),true)}b.disabled=true;b.textContent=L.t('trk.wait');
 try{var ctl=new AbortController();setTimeout(function(){ctl.abort()},15000);
  var res=await fetch(C.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'track',orderId:id,phone:ph}),signal:ctl.signal});var j=await res.json();
  var st=j&&j.ok&&(j.status||(j.order&&j.order.status));
  if(st)out.innerHTML='<div class="glass"><h2>'+esc(id)+'</h2>'+line(st)+'</div>';
  else if(j&&j.ok===false&&/not found|nahi mila/i.test(j.error||''))out.innerHTML='<div class="glass"><p>'+esc(L.t('trk.nf'))+'</p></div>';
  else throw 0}
 catch(x){out.innerHTML='<div class="glass"><p>'+esc(L.t('trk.na'))+'</p><a class="btn btn-primary" target="_blank" rel="noopener" href="'+wa(id)+'">'+esc(L.t('trk.wa'))+'</a></div>'}
 b.disabled=false;b.textContent=L.t('trk.btn')}
document.addEventListener('lhlang',recent);
document.addEventListener('DOMContentLoaded',function(){$('trkForm').addEventListener('submit',go);recent();var q=new URLSearchParams(location.search).get('id');if(q)$('tId').value=q});})();
LH.toast=LH.toast||function(m){alert(m)};