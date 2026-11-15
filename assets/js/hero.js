/* Hero: 3D tilt, magnetic CTA, model <-> flat-lay toggle (+hover preview), canvas gold dust */
(function(){
var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var st=document.getElementById('stage'),ti=document.getElementById('tilt');
if(st&&ti){
 st.addEventListener('pointermove',function(e){if(reduce)return;var b=st.getBoundingClientRect(),x=(e.clientX-b.left)/b.width-.5,y=(e.clientY-b.top)/b.height-.5;
  ti.style.transform='rotateY('+(x*14)+'deg) rotateX('+(-y*14)+'deg) scale(1.02)'});
 st.addEventListener('pointerleave',function(){ti.style.transform='';if(fine&&!pinned)show('model')});
 var pinned=false,btns=st.querySelectorAll('.toggle button');
 function show(v){st.classList.toggle('flat',v==='flat');btns.forEach(function(b){b.classList.toggle('on',b.dataset.v===v)})}
 btns.forEach(function(b){b.addEventListener('click',function(){pinned=b.dataset.v==='flat';show(b.dataset.v)})});
 if(fine)ti.addEventListener('pointerenter',function(){if(!pinned)show('flat')});   // hover preview on desktop
}
/* magnetic button */
document.querySelectorAll('.mag').forEach(function(m){if(reduce||!fine)return;
 m.addEventListener('pointermove',function(e){var b=m.getBoundingClientRect();m.style.transform='translate('+((e.clientX-b.left-b.width/2)*.25)+'px,'+((e.clientY-b.top-b.height/2)*.35)+'px)'});
 m.addEventListener('pointerleave',function(){m.style.transform=''})});
/* Flowing satin ribbons: layered sine-edged bands with sheen, drifting slowly + gentle mouse parallax */
var sc=document.getElementById('silkc');
if(sc){var g=sc.getContext('2d'),SW,SH,dpr=Math.min(window.devicePixelRatio||1,1.5),mx=0,tx=0,on=true,
 R=[{y:.18,a:.06,f:1.1,s:.00040,t:.20,p:0,o:.30,l:['236,216,172','246,214,198']},{y:.30,a:.08,f:1.5,s:.00055,t:.16,p:1.2,o:.28,l:['244,206,190','228,196,140']},
    {y:.44,a:.09,f:1.2,s:.00035,t:.22,p:2.4,o:.30,l:['214,190,140','240,222,190']},{y:.58,a:.07,f:1.8,s:.00065,t:.14,p:3.1,o:.26,l:['232,200,176','205,175,120']},
    {y:.70,a:.08,f:1.4,s:.00045,t:.20,p:4.2,o:.30,l:['190,204,178','236,214,170']},{y:.84,a:.06,f:2.0,s:.00050,t:.12,p:5.0,o:.22,l:['240,226,196','226,186,170']}],
 DK=['18,130,128','196,156,96'];
 function rs(){SW=sc.offsetWidth;SH=sc.offsetHeight;sc.width=SW*dpr;sc.height=SH*dpr;g.setTransform(dpr,0,0,dpr,0,0)}
 function draw(t){g.clearRect(0,0,SW,SH);var light=document.documentElement.dataset.theme==='light';mx+=(tx-mx)*.04;var N=Math.max(24,Math.round(SW/26));
  R.forEach(function(l){var c=light?l.l:DK,gr=g.createLinearGradient(0,0,SW,0),T=[],B=[];
   gr.addColorStop(0,'rgba('+c[0]+','+l.o+')');gr.addColorStop(.5,'rgba('+c[1]+','+(l.o*.8)+')');gr.addColorStop(1,'rgba('+c[0]+','+l.o+')');
   for(var i=0;i<=N;i++){var x=SW*i/N,u=x/SW*6.283,y=SH*(l.y+l.a*Math.sin(u*l.f+t*l.s+l.p+mx*.7)+l.a*.5*Math.sin(u*l.f*2.1-t*l.s*1.4+l.p*2)),th=SH*l.t*(.6+.4*Math.sin(u*l.f*.8+t*l.s*.7+l.p));T.push([x,y]);B.push([x,y+th])}
   g.beginPath();T.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});for(var j=B.length-1;j>=0;j--)g.lineTo(B[j][0],B[j][1]);g.closePath();g.fillStyle=gr;g.fill();
   g.lineWidth=1.2;g.strokeStyle=light?'rgba(255,255,255,.55)':'rgba(230,200,140,.35)';g.beginPath();T.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke();   /* sheen on the fold */
   g.strokeStyle=light?'rgba(150,115,60,.12)':'rgba(0,0,0,.18)';g.beginPath();B.forEach(function(p,i){i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])});g.stroke()})}
 function loop(t){if(!on)return;draw(t);requestAnimationFrame(loop)}
 rs();addEventListener('resize',function(){rs();if(reduce)draw(0)});
 if(reduce)draw(0);else{requestAnimationFrame(loop);
  sc.parentNode.parentNode.addEventListener('pointermove',function(e){tx=(e.clientX/innerWidth-.5)*2});
  new IntersectionObserver(function(e){var v=e[0].isIntersecting;if(v&&!on){on=true;requestAnimationFrame(loop)}on=v}).observe(sc)}}
/* flat-lay slideshow: advances only while the flat-lay view is showing */
if(st){var sl=st.querySelectorAll('.slides img'),dt=st.querySelectorAll('.dots i'),si=0;
 function go(n){si=(n+sl.length)%sl.length;sl.forEach(function(e,k){e.classList.toggle('on',k===si)});dt.forEach(function(e,k){e.classList.toggle('on',k===si)})}
 if(!reduce)setInterval(function(){if(st.classList.contains('flat'))go(si+1)},3200);
 st.querySelector('.layer.flat').addEventListener('click',function(){go(si+1)})}
/* videos: show only once they can play; pause when off-screen; skipped for data-saver / reduced motion / small screens (ambient bg) */
var sd=navigator.connection&&navigator.connection.saveData,small=matchMedia('(max-width:899px)').matches;
['heroVid','stageVid'].forEach(function(id){var v=document.getElementById(id);if(!v)return;
 if(reduce||sd||(id==='heroVid'&&small)){v.remove();return}
 v.addEventListener('canplay',function(){v.classList.add('ready');v.play().catch(function(){})});
 new IntersectionObserver(function(e){e[0].isIntersecting?v.play().catch(function(){}):v.pause()}).observe(v)});
/* gold dust canvas */
var cv=document.getElementById('dust');if(!cv||reduce)return;var cx=cv.getContext('2d'),W,H,P=[],run=true;
function size(){W=cv.width=cv.offsetWidth;H=cv.height=cv.offsetHeight;P=[];for(var i=0;i<Math.min(46,W/24);i++)P.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*2.2+.6,v:Math.random()*.35+.1,a:Math.random()*.5+.2,p:Math.random()*6})}
function draw(t){if(!run)return;cx.clearRect(0,0,W,H);P.forEach(function(p){p.y-=p.v;p.x+=Math.sin(t/2000+p.p)*.25;if(p.y<-5){p.y=H+5;p.x=Math.random()*W}
 cx.beginPath();cx.fillStyle='rgba(201,169,110,'+(p.a*(.6+.4*Math.sin(t/700+p.p)))+')';cx.arc(p.x,p.y,p.r,0,6.3);cx.fill()});requestAnimationFrame(draw)}
size();addEventListener('resize',size);requestAnimationFrame(draw);
new IntersectionObserver(function(e){var v=e[0].isIntersecting;if(v&&!run){run=true;requestAnimationFrame(draw)}run=v}).observe(cv);
})();