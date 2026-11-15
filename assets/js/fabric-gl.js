/* Flowing-fabric hero background (WebGL wave mesh), ported from the supplied index file.
   Dark theme = original teal/gold palette; light (cream) theme = champagne palette, same geometry + motion.
   Falls back silently to the soft colour glow if WebGL is unavailable. Pauses off-screen; draws one still frame for reduced-motion. */
(function(){
var cv=document.getElementById('gl'),hero=document.querySelector('.lx');if(!cv||!hero)return;
var reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,tx=0,ty=0,cx=0,cy=0,visible=true,gl=null,draw=null;
if(!reduce){hero.addEventListener('pointermove',function(e){var r=hero.getBoundingClientRect();tx=(e.clientX-r.left)/r.width-.5;ty=(e.clientY-r.top)/r.height-.5});
 hero.addEventListener('pointerleave',function(){tx=0;ty=0});
 new IntersectionObserver(function(es){visible=es[0].isIntersecting},{threshold:0}).observe(hero)}
try{gl=cv.getContext('webgl',{alpha:true,antialias:true})||cv.getContext('experimental-webgl')}catch(e){gl=null}
if(!gl)return;
var VS="attribute vec2 aP;uniform mat4 uM;uniform float uT;varying vec3 vN;varying float vH;varying vec2 vW;varying float vD;"+
"void main(){vec2 p=aP;float h=0.0;vec2 g=vec2(0.0);"+
"vec2 d1=vec2(0.86,0.51);float q1=dot(p,d1)*0.42+uT*0.70;h+=0.62*sin(q1);g+=0.62*0.42*cos(q1)*d1;"+
"vec2 d2=vec2(-0.57,0.82);float q2=dot(p,d2)*0.78+uT*1.05;h+=0.30*sin(q2);g+=0.30*0.78*cos(q2)*d2;"+
"vec2 d3=vec2(0.29,-0.96);float q3=dot(p,d3)*1.45+uT*1.60;h+=0.13*sin(q3);g+=0.13*1.45*cos(q3)*d3;"+
"vec2 d4=vec2(0.97,-0.24);float q4=dot(p,d4)*2.40+uT*2.20;h+=0.05*sin(q4);g+=0.05*2.40*cos(q4)*d4;"+
"vec4 pos=uM*vec4(p.x,h,p.y,1.0);vN=normalize(vec3(-g.x,1.0,-g.y));vH=h;vW=p;vD=pos.w;gl_Position=pos;}";
var FS="precision mediump float;varying vec3 vN;varying float vH;varying vec2 vW;varying float vD;"+
"uniform vec3 uDeep;uniform vec3 uMid;uniform vec3 uCrest;uniform vec3 uGold;uniform vec3 uFog;"+
"void main(){vec3 N=normalize(vN);vec3 L=normalize(vec3(-0.35,0.75,-0.55));vec3 V=normalize(vec3(0.0,0.55,0.85));"+
"float diff=max(dot(N,L),0.0);float spec=pow(max(dot(N,normalize(L+V)),0.0),48.0);float rim=pow(1.0-max(dot(N,V),0.0),3.0);"+
"float k=smoothstep(-0.8,1.0,vH);vec3 col=mix(uDeep,uMid,k);col=mix(col,uCrest,smoothstep(0.55,1.05,vH)*0.55);"+
"col+=diff*0.10+spec*0.55+rim*0.12*uCrest;col+=uGold*pow(max(dot(N,normalize(vec3(0.5,0.6,-0.6))),0.0),36.0)*0.22;"+
"vec2 gr=abs(fract(vW*0.5)-0.5);col+=uCrest*smoothstep(0.465,0.5,max(gr.x,gr.y))*0.11;"+
"float fog=smoothstep(16.0,50.0,vD);col=mix(col,uFog,fog);gl_FragColor=vec4(col,1.0);}";
function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS)){console.warn(gl.getShaderInfoLog(o));return null}return o}
var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS),pr=gl.createProgram();if(!vs||!fs)return;
gl.attachShader(pr,vs);gl.attachShader(pr,fs);gl.linkProgram(pr);if(!gl.getProgramParameter(pr,gl.LINK_STATUS))return;
var small=innerWidth<700,NX=small?90:170,NZ=small?60:110,X0=-48,X1=48,Z0=-64,Z1=12,pos=new Float32Array(NX*NZ*2),idx=new Uint16Array((NX-1)*(NZ-1)*6),i,j,n=0;
for(j=0;j<NZ;j++)for(i=0;i<NX;i++){pos[n++]=X0+(X1-X0)*i/(NX-1);pos[n++]=Z0+(Z1-Z0)*j/(NZ-1)}
n=0;for(j=0;j<NZ-1;j++)for(i=0;i<NX-1;i++){var a=j*NX+i,b=a+1,c=a+NX,d=c+1;idx[n++]=a;idx[n++]=c;idx[n++]=b;idx[n++]=b;idx[n++]=c;idx[n++]=d}
var vb=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,pos,gl.STATIC_DRAW);
var ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,idx,gl.STATIC_DRAW);
var aP=gl.getAttribLocation(pr,'aP'),U=function(k){return gl.getUniformLocation(pr,k)},uM=U('uM'),uT=U('uT'),uC={deep:U('uDeep'),mid:U('uMid'),crest:U('uCrest'),gold:U('uGold'),fog:U('uFog')};
var PAL={dark:{deep:[.012,.10,.14],mid:[.03,.46,.55],crest:[.30,.92,.90],gold:[.90,.76,.48],fog:[.012,.075,.10]},
         light:{deep:[.76,.58,.38],mid:[.90,.77,.58],crest:[1,.95,.84],gold:[.80,.55,.25],fog:[.980,.976,.965]}};
function persp(f,a,nr,fr){var t=1/Math.tan(f/2),nf=1/(nr-fr);return[t/a,0,0,0,0,t,0,0,0,0,(fr+nr)*nf,-1,0,0,2*fr*nr*nf,0]}
function look(e,c){var zx=e[0]-c[0],zy=e[1]-c[1],zz=e[2]-c[2],l=Math.hypot(zx,zy,zz);zx/=l;zy/=l;zz/=l;var xx=zz,xy=0,xz=-zx;l=Math.hypot(xx,xz);xx/=l;xz/=l;
 var yx=zy*xz-zz*xy,yy=zz*xx-zx*xz,yz=zx*xy-zy*xx;return[xx,yx,zx,0,xy,yy,zy,0,xz,yz,zz,0,-(xx*e[0]+xy*e[1]+xz*e[2]),-(yx*e[0]+yy*e[1]+yz*e[2]),-(zx*e[0]+zy*e[1]+zz*e[2]),1]}
function mul(a,b){var o=new Array(16),r,q,k,s;for(r=0;r<4;r++)for(q=0;q<4;q++){s=0;for(k=0;k<4;k++)s+=a[k*4+q]*b[r*4+k];o[r*4+q]=s}return o}
var t0=performance.now(),DC=small?1:1.4,last=0,acc=0,cnt=0,strikes=0,stop=false;
draw=function(now){var dpr=Math.min(devicePixelRatio||1,DC),w=Math.max(2,Math.round(cv.clientWidth*dpr)),h=Math.max(2,Math.round(cv.clientHeight*dpr));
 if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h}gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);
 var asp=w/h,fov=asp<1?.95:.82,eye=[cx*2.2,2.3+cy*.5,10],tgt=[cx*.8,.5,-14],M=mul(persp(fov,asp,.1,120),look(eye,tgt)),p=PAL[document.documentElement.dataset.theme==='light'?'light':'dark'];
 gl.useProgram(pr);gl.uniformMatrix4fv(uM,false,new Float32Array(M));gl.uniform1f(uT,(now-t0)/1000);
 for(var k in uC)gl.uniform3fv(uC[k],p[k]);
 gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.enableVertexAttribArray(aP);gl.vertexAttribPointer(aP,2,gl.FLOAT,false,0,0);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.drawElements(gl.TRIANGLES,idx.length,gl.UNSIGNED_SHORT,0)};
function frame(now){if(stop)return;if(visible&&!document.hidden){if(last){acc+=Math.min(now-last,200);cnt++;if(cnt===60){if(acc/60>34){strikes++;DC=1;if(strikes>=2){stop=true}}acc=0;cnt=0}}last=now;cx+=(tx-cx)*.06;cy+=(ty-cy)*.06;draw(now);if(!cv.classList.contains('on'))cv.classList.add('on')}else last=0;requestAnimationFrame(frame)}
if(reduce){draw(0);cv.classList.add('on')}else requestAnimationFrame(frame);
})();
