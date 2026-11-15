/* Dark/light theme, saved in lh_theme, defaults to OS preference */
(function(){var K='lh_theme',s=localStorage.getItem(K)||'light';
function set(t){document.documentElement.dataset.theme=t;var b=document.getElementById('lhTheme');if(b)b.textContent=t==='light'?'☾':'☀'}
set(s);document.addEventListener('DOMContentLoaded',function(){var b=document.createElement('button');b.id='lhTheme';b.type='button';b.setAttribute('aria-label','Toggle theme');
b.onclick=function(){s=s==='light'?'dark':'light';localStorage.setItem(K,s);set(s)};document.body.appendChild(b);set(s)})})();