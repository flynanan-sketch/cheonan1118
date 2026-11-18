(() => {
'use strict';
const slides=window.CHEONAN_SLIDES;
if(!slides || !slides.length) return;
const $=id=>document.getElementById(id);
const image=$('active-slide'),stage=$('slide-stage'),outline=$('outline'),details=$('details'),scrim=$('scrim'),modal=$('help-modal');
let current=0,autoplay=null,drawer=null,transiting=false,touchStart=null;
const pad=n=>String(n).padStart(2,'0');
const escapeHtml=str=>String(str).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const thumbs=slides.map((s,i)=>`<button type="button" class="thumbnail ${i===0?'active':''}" data-slide="${i}" aria-label="${i+1}번 슬라이드: ${escapeHtml(s.title)}" ${i===0?'aria-current="true"':''}><img src="${s.image}" loading="lazy" alt=""><span>${pad(i+1)}</span></button>`).join('');
$('filmstrip').innerHTML=thumbs;
$('outline-list').innerHTML=slides.map((s,i)=>`<button type="button" class="outline-item ${i===0?'active':''}" data-slide="${i}"><img src="${s.image}" loading="lazy" alt=""><span class="outline-meta"><b>${pad(i+1)} · ${escapeHtml(s.section)}</b><span>${escapeHtml(s.title)}</span></span></button>`).join('');
function stopPlay(){if(autoplay){clearInterval(autoplay);autoplay=null;}$('play-text').textContent='자동 재생';$('play-btn').setAttribute('aria-label','자동 재생 시작');$('play-btn').firstChild.textContent='▶ ';}
function renderDetails(){const s=slides[current];const excluded=new Set(['CHEONAN FOOD JOURNEY',s.section,pad(current+1)+' / 10']);const filtered=s.texts.filter(t=>!excluded.has(t)&&t.length<450).slice(0,22);$('details-content').innerHTML=`<span class="detail-section">${escapeHtml(s.section)} · ${pad(s.number)} / 10</span><h3>${escapeHtml(s.title)}</h3><ul class="detail-list">${filtered.map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul><h4>원본 PPTX의 참고 출처</h4>${s.sources.length?s.sources.map((u,j)=>`<a class="source-link" href="${escapeHtml(u)}" target="_blank" rel="noopener noreferrer">${j+1}. ${escapeHtml(u)}</a>`).join(''):'<p class="notice">별도로 표기된 외부 링크가 없습니다.</p>'}<p class="notice">원본의 홍보용 합성 이미지 및 AI 생성 음식 이미지가 포함되어 있으며, 실제 매장 촬영 사진은 아닙니다. 매장 정보와 운영 여부는 방문 전에 확인해 주세요.</p>`;}
function go(i,opts={}){
 const next=Math.max(0,Math.min(slides.length-1,i));if(next===current&&!opts.force)return;
 const old=current;current=next;const s=slides[next];
 const nextImg=document.createElement('img');nextImg.src=s.image;nextImg.alt=`슬라이드 ${s.number}: ${s.title}`;nextImg.className='slide-image '+(next>=old?'enter-next':'enter-prev');nextImg.width=1600;nextImg.height=900;
 stage.replaceChildren(nextImg);$('current-title').textContent=s.title;$('section-label').textContent=s.section;$('slide-current').textContent=pad(s.number);$('progress-fill').style.width=((s.number/slides.length)*100)+'%';$('progress-track').setAttribute('aria-valuenow',String(s.number));
 document.querySelectorAll('[data-slide]').forEach(el=>{const isActive=Number(el.dataset.slide)===next;el.classList.toggle('active',isActive);if(isActive)el.setAttribute('aria-current','true');else el.removeAttribute('aria-current')});
 const active=document.querySelector('.filmstrip [data-slide="'+next+'"]');if(active&&opts.scrollThumb!==false)active.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',inline:'nearest',block:'nearest'});
 $('prev-btn').disabled=$('prev-edge').disabled=next===0;$('next-btn').disabled=$('next-edge').disabled=next===slides.length-1;
 renderDetails();if(!opts.skipHash)history.replaceState(null,'','#slide-'+s.number);
 if(next===slides.length-1&&autoplay)stopPlay();
}
function openDrawer(which){closeAll();drawer=which;which.classList.add('open');which.setAttribute('aria-hidden','false');scrim.hidden=false;$(which.id+'-btn').setAttribute('aria-expanded','true');which.querySelector('.drawer-close').focus();}
function closeAll(){[outline,details].forEach(d=>{d.classList.remove('open');d.setAttribute('aria-hidden','true')});scrim.hidden=true;drawer=null;$('outline-btn').setAttribute('aria-expanded','false');$('details-btn').setAttribute('aria-expanded','false');modal.classList.remove('open');modal.setAttribute('aria-hidden','true');}
function toggleDrawer(which){if(drawer===which){closeAll();}else openDrawer(which)}
$('outline-btn').onclick=()=>toggleDrawer(outline);$('details-btn').onclick=()=>toggleDrawer(details);
$('prev-btn').onclick=$('prev-edge').onclick=()=>{stopPlay();go(current-1)};
$('next-btn').onclick=$('next-edge').onclick=()=>{stopPlay();go(current+1)};
$('play-btn').onclick=()=>{if(autoplay){stopPlay();return}if(current===slides.length-1)go(0);$('play-text').textContent='일시 정지';$('play-btn').firstChild.textContent='Ⅱ ';$('play-btn').setAttribute('aria-label','자동 재생 정지');autoplay=setInterval(()=>go(current+1),5500)};
$('fullscreen-btn').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else $('app').requestFullscreen?.()};
$('help-btn').onclick=()=>{closeAll();modal.classList.add('open');modal.setAttribute('aria-hidden','false');$('help-close').focus()};$('help-close').onclick=closeAll;
document.querySelectorAll('[data-close]').forEach(b=>b.onclick=closeAll);scrim.onclick=closeAll;modal.onclick=e=>{if(e.target===modal)closeAll()};
document.addEventListener('click',e=>{const b=e.target.closest('[data-slide]');if(!b)return;stopPlay();go(Number(b.dataset.slide));if(drawer)closeAll()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeAll();return}if(drawer||modal.classList.contains('open')||/input|textarea|select/i.test(e.target.tagName))return;
 if(e.key==='ArrowRight'||e.key==='ArrowDown'||e.key===' '||e.key==='PageDown'){e.preventDefault();stopPlay();go(current+1)}else if(e.key==='ArrowLeft'||e.key==='ArrowUp'||e.key==='PageUp'){e.preventDefault();stopPlay();go(current-1)}else if(e.key==='Home'){e.preventDefault();stopPlay();go(0)}else if(e.key==='End'){e.preventDefault();stopPlay();go(slides.length-1)}else if(e.key.toLowerCase()==='f'){$('fullscreen-btn').click()}});
$('slide-shell').addEventListener('touchstart',e=>{if(e.touches.length===1)touchStart={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});
$('slide-shell').addEventListener('touchend',e=>{if(!touchStart)return;const dx=e.changedTouches[0].clientX-touchStart.x,dy=e.changedTouches[0].clientY-touchStart.y;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.2){stopPlay();go(current+(dx<0?1:-1))}touchStart=null},{passive:true});
let wheelAt=0;$('slide-shell').addEventListener('wheel',e=>{if(Math.abs(e.deltaY)<20)return;const now=Date.now();if(now-wheelAt<850)return;wheelAt=now;stopPlay();go(current+(e.deltaY>0?1:-1))},{passive:true});
window.addEventListener('hashchange',()=>{const found=location.hash.match(/^#slide-(\d+)$/);if(found)go(Number(found[1])-1,{skipHash:true})});
const init=location.hash.match(/^#slide-(\d+)$/);go(init?Number(init[1])-1:0,{force:true,skipHash:true});
slides.slice(1).forEach(s=>{const i=new Image();i.src=s.image});
})();
