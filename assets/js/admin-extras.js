/* Admin: Export orders to CSV (uses the dashboard's own groupOrders()) */
(function(){function init(){var a=document.getElementById('addP'),h=document.getElementById('title');if(!a||!h)return;
var b=document.createElement('button');b.id='csvBtn';b.type='button';b.className='btn';b.textContent='⬇ Export CSV';b.hidden=true;a.parentNode.insertBefore(b,a);
function sync(){b.hidden=(typeof view==='undefined')||view!=='orders'}
new MutationObserver(sync).observe(h,{childList:true,characterData:true,subtree:true});sync();
b.onclick=function(){var rows=[['Order ID','Date','Name','Phone','Address','Status','Total','Items']];
 groupOrders().forEach(function(o){rows.push([o.orderId,o.date,o.name,o.phone,o.address,o.status,o.total,o.items.map(function(i){return (i.product||'')+' x'+(i.qty||i.quantity||1)}).join('; ')])});
 var csv=rows.map(function(r){return r.map(function(c){return '"'+String(c==null?'':c).replace(/"/g,'""')+'"'}).join(',')}).join('\r\n');
 var u=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),l=document.createElement('a');l.href=u;l.download='orders-'+new Date().toISOString().slice(0,10)+'.csv';l.click();setTimeout(function(){URL.revokeObjectURL(u)},500)}}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init):init()})();