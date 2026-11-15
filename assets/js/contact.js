/* Contact form -> same Apps Script action 'contact' used by index.html */
document.addEventListener('DOMContentLoaded',function(){var f=document.getElementById('contactForm');if(!f)return;
f.addEventListener('submit',async function(e){e.preventDefault();var n=cName.value.trim(),c=cContact.value.trim(),m=cMsg.value.trim(),b=cSend;
if(!n||!m)return LH.toast(LH.t('c.req'),true);b.disabled=true;b.textContent=LH.t('c.sending');
try{var ctl=new AbortController();setTimeout(function(){ctl.abort()},15000);
var r=await fetch(LH.config.API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action:'contact',name:n,contact:c,message:m}),signal:ctl.signal});
var j=await r.json();if(!j.ok)throw 0;f.reset();LH.toast(LH.t('c.ok'))}catch(x){LH.toast(LH.t('c.err'),true)}
b.disabled=false;b.textContent=LH.t('c.send')})});