// Subtle hero animation: soft green blobs/waves
(function(){
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const c = document.getElementById('heroCanvas');
  if(!c) return;
  const ctx = c.getContext('2d');
  let w = 0, h = 0, t0 = performance.now();
  const root = document.documentElement;
  const col1 = getComputedStyle(root).getPropertyValue('--accent-2').trim() || '#C6D870';
  const col2 = getComputedStyle(root).getPropertyValue('--accent-1').trim() || '#8FA31E';
  const col3 = getComputedStyle(root).getPropertyValue('--bg').trim() || '#556B2F';
  const gold = getComputedStyle(root).getPropertyValue('--gold').trim() || '#d4b45a';

  // Parallax state
  let parX = 0, parY = 0, targetParX = 0, targetParY = 0;
  window.addEventListener('pointermove', (e)=>{
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width; // 0..1
    const y = (e.clientY - r.top) / r.height;
    targetParX = (x - .5) * 30; // px offset
    targetParY = (y - .5) * 18;
  });

  function resize(){
    const r = c.getBoundingClientRect();
    w = c.width = Math.ceil(r.width * (window.devicePixelRatio||1));
    h = c.height = Math.ceil(r.height * (window.devicePixelRatio||1));
    ctx.scale(window.devicePixelRatio||1, window.devicePixelRatio||1);
  }
  resize();
  window.addEventListener('resize', resize);

  function lerp(a,b,t){ return a + (b-a)*t }

  function draw(t){
    const time = (t - t0) / 1000;
    const cw = c.clientWidth, ch = c.clientHeight;
    ctx.clearRect(0,0,cw,ch);
    // Ease parallax
    parX = lerp(parX, targetParX, .06);
    parY = lerp(parY, targetParY, .06);

    // background gradient (depth layer 0)
    const g = ctx.createLinearGradient(0,0,cw,ch);
    g.addColorStop(0, col3);
    g.addColorStop(1, col1);
    ctx.fillStyle = g; ctx.fillRect(0,0,cw,ch);

    // depth layer 1: gradient blobs with slight parallax
    function blob(cx, cy, r, phase, color){
      ctx.beginPath();
      for(let i=0;i<=64;i++){
        const a = (i/64)*Math.PI*2;
        const rad = r * (1 + 0.12*Math.sin(3*a + phase) + 0.08*Math.sin(5*a - phase*0.7));
        const x = cx + rad*Math.cos(a + 0.1*Math.sin(phase));
        const y = cy + rad*Math.sin(a + 0.1*Math.cos(phase));
        i? ctx.lineTo(x,y) : ctx.moveTo(x,y);
      }
      ctx.closePath();
      const grd = ctx.createRadialGradient(cx, cy, r*0.2, cx, cy, r);
      grd.addColorStop(0, color);
      grd.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grd;
      ctx.fill();
    }

    const cx = cw*0.35 + 20*Math.sin(time*0.3) + parX*0.6;
    const cy = ch*0.55 + 10*Math.cos(time*0.2) + parY*0.6;
    blob(cx, cy, Math.min(cw,ch)*0.35, time*0.8, col2);
    blob(cw*0.7 + parX*0.4, ch*0.45 + parY*0.4, Math.min(cw,ch)*0.28, -time*0.6, col1);

    // depth layer 2: perspective grid lines (3D feel)
    ctx.save();
    ctx.translate(cw/2 + parX*0.3, ch*0.8 + parY*0.3);
    const cols = 16, rows = 10;
    ctx.strokeStyle = 'rgba(0,0,0,.08)';
    for(let i=0;i<=rows;i++){
      ctx.beginPath();
      for(let j=0;j<=cols;j++){
        const u = j/cols - 0.5;
        const v = i/rows;
        const z = 1/(0.2+v);
        const x = u*cw*0.9*z;
        const y = v*ch*0.5*z;
        j===0? ctx.moveTo(x,y): ctx.lineTo(x,y);
      }
      ctx.stroke();
    }
    ctx.restore();

    // depth layer 3: twinkling particles
    const seed = Math.floor(time*20);
    ctx.fillStyle = gold;
    for(let i=0;i<20;i++){
      const k = (seed+i)%200;
      const px = (k*37 % cw) + parX*0.2;
      const py = (k*53 % Math.max(ch,1)) + parY*0.2;
      const s = 1 + (k%3);
      ctx.globalAlpha = 0.12 + 0.08*Math.sin(time + i);
      ctx.beginPath(); ctx.arc(px, py, s, 0, Math.PI*2); ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  if(reduce){
    // Render once only
    draw(performance.now());
    return;
  }

  function loop(t){ draw(t); requestAnimationFrame(loop); }
  requestAnimationFrame(loop);
})();
