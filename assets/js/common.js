/* Common utilities for Fingyaan
   - Theme toggle with persistence
   - Mobile nav toggle
   - Carousel helper
   - Tiny chart helpers
   - Storage helpers and CSV export
*/
(function(){
  const root = document.documentElement;
  const THEME_KEY = 'fg_theme';
  const themeMeta = document.querySelector('meta[name="theme-color"]') || (function(){
    const m=document.createElement('meta'); m.setAttribute('name','theme-color'); document.head.appendChild(m); return m;
  })();
  const yearEl = document.getElementById('year');
  if(yearEl) yearEl.textContent = new Date().getFullYear();
  // global page bg
  document.body.classList.add('bg-3d-page');

  // Theme
  const savedTheme = localStorage.getItem(THEME_KEY);
  if(savedTheme==='dark') root.classList.add('dark');
  function applyThemeColor(){
    const cs = getComputedStyle(root);
    themeMeta.setAttribute('content', cs.getPropertyValue('--bg').trim() || '#0f2c24');
  }
  applyThemeColor();
  document.querySelectorAll('#themeToggle').forEach(btn=>{
    btn.addEventListener('click',()=>{
      root.classList.toggle('dark');
      localStorage.setItem(THEME_KEY, root.classList.contains('dark')?'dark':'light');
      applyThemeColor();
    })
  });

  // Mobile nav
  const tgl = document.querySelector('.nav-toggle');
  if(tgl){
    const list = document.getElementById('nav-list');
    tgl.addEventListener('click',()=>{
      const exp = tgl.getAttribute('aria-expanded')==='true';
      tgl.setAttribute('aria-expanded', String(!exp));
      list.classList.toggle('open');
    })
  }

  // Reveal-on-scroll for elements with .reveal
  const revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
    },{rootMargin:'-10% 0px -5% 0px', threshold:0.05});
    revealEls.forEach(el=> io.observe(el));
  }

  // Global AI modal wiring (present on every page)
  const aiFab = document.querySelector('.ai-fab');
  const aiDialog = document.getElementById('aiModal');
  if(aiFab && aiDialog){
    aiFab.addEventListener('click', ()=> aiDialog.showModal());
    aiDialog.querySelector('[data-close]')?.addEventListener('click', ()=> aiDialog.close());
    const input = aiDialog.querySelector('input');
    const out = aiDialog.querySelector('[data-ai-out]');
    const send = aiDialog.querySelector('[data-send]');
    function reply(){
      const q=(input.value||'').trim(); if(!q) return; const saved=Number(localStorage.getItem('fg_sumSavings')||0);
      out.textContent = `AI: Focus on top 1–2 categories, set a weekly cap, and auto‑save ₹${Math.max(100,Math.round(saved*0.05))}.`;
      input.value='';
    }
    send?.addEventListener('click', reply);
    input?.addEventListener('keydown', (e)=>{ if(e.key==='Enter') reply(); });
  }

  // Carousel
  const track = document.getElementById('testimonialTrack');
  if(track){
    let idx = 0;
    const slides = track.children.length;
    const update = ()=>{ track.style.transform = `translateX(${-idx*100}%)`; };
    document.querySelectorAll('.carousel-controls .btn').forEach(b=>{
      b.addEventListener('click',()=>{ idx=(idx+Number(b.dataset.dir)+slides)%slides; update(); });
    });
    setInterval(()=>{ idx=(idx+1)%slides; update(); }, 4000);

    // Accessibility: keyboard carousel controls with ArrowLeft/ArrowRight
    track.setAttribute('tabindex','0');
    track.addEventListener('keydown', (e)=>{
      if(e.key==='ArrowLeft') document.querySelector('.carousel-controls [data-dir="-1"]').click();
      if(e.key==='ArrowRight') document.querySelector('.carousel-controls [data-dir="1"]').click();
    });
  }

  // Enhance buttons with press pulse
  document.addEventListener('pointerdown', (e)=>{
    const btn = e.target.closest('.btn');
    if(!btn) return; btn.classList.add('is-pressed'); setTimeout(()=>btn.classList.remove('is-pressed'), 350);
  });

  // Lenis smooth scrolling (optional)
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(window.Lenis && !reduceMotion){
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    // smooth anchor links
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click', (e)=>{ e.preventDefault(); const id=a.getAttribute('href').slice(1); const el=document.getElementById(id); if(el) lenis.scrollTo(el,{offset:-60}); });
    });
  }

  // Sparkline on landing
  const spark = document.getElementById('sparkline');
  if(spark){
    const ctx = spark.getContext('2d');
    const w = spark.width, h = spark.height; const N=24;
    const points = Array.from({length:N}, (_,i)=> i===0? 0.3 : Math.min(1, Math.max(0, (Math.random()*0.4 + (i? points[i-1]:.5)*0.9))));
    ctx.strokeStyle = getComputedStyle(root).getPropertyValue('--accent-3');
    ctx.lineWidth = 2; ctx.beginPath();
    for(let i=0;i<N;i++){
      const x = (i/(N-1))*w; const y = h - points[i]*(h-10) - 5;
      i? ctx.lineTo(x,y): ctx.moveTo(x,y);
    }
    ctx.stroke();
    // fake stat
    const saved = Number(localStorage.getItem('fg_sumSavings')||0);
    const el = document.getElementById('statSaved');
    if(el) el.textContent = `₹${saved.toLocaleString('en-IN')}`;
  }

  // Storage helpers
  window.FG = {
    get(k, def){ try{ return JSON.parse(localStorage.getItem(k)) ?? def }catch{ return def } },
    set(k, v){ localStorage.setItem(k, JSON.stringify(v)); },
    del(k){ localStorage.removeItem(k); },
    csv(filename, rows){
      const make = rows.map(r=> r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(',' )).join('\n');
      const blob = new Blob([make], {type:'text/csv'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; a.click();
    }
  };
})();
