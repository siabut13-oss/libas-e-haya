/* Language engine (EN/UR) - elements use data-i18n, data-i18n-placeholder */
(function(){var L=window.LH;
L.lang=localStorage.getItem('lh_lang')||'en';
L.t=function(k){return (L.I18N[L.lang]&&L.I18N[L.lang][k])||L.I18N.en[k]||k};
L.apply=function(){var h=document.documentElement;h.lang=L.lang;h.dir=L.lang==='ur'?'rtl':'ltr';
document.querySelectorAll('[data-i18n]').forEach(function(e){e.textContent=L.t(e.dataset.i18n)});
document.querySelectorAll('[data-i18n-placeholder]').forEach(function(e){e.placeholder=L.t(e.dataset.i18nPlaceholder)});
var b=document.getElementById('langBtn');if(b)b.textContent=L.lang==='ur'?'EN':'اردو'};
L.setLang=function(l){L.lang=l;localStorage.setItem('lh_lang',l);L.apply();document.dispatchEvent(new Event('lhlang'))};
document.addEventListener('DOMContentLoaded',function(){var b=document.getElementById('langBtn');
if(b)b.onclick=function(){L.setLang(L.lang==='ur'?'en':'ur')};L.apply()});})();