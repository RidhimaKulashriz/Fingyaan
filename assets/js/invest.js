(function(){
  const els={alloc:byId('allocations'),riskView:byId('riskView'),riskScore:byId('riskScore'),amount:byId('amountInvest'),
    years:byId('years'),rate:byId('rate'),chart:byId('growthChart'),projection:byId('projection'),news:byId('news'),plist:byId('portfolioList')};
  if(!els.alloc) return;
  const K={alloc:'fg_alloc',risk:'fg_risk'};
  let portfolios=[]; let alloc=FG.get(K.alloc,{});

  // Load portfolios and news
  fetch('assets/data/portfolios.json').then(r=>r.json()).then(json=>{portfolios=json; buildAllocators(); buildPortfolioList(); renderRisk();});
  fetch('assets/data/news.json').then(r=>r.json()).then(items=>{ els.news.innerHTML = items.map(n=>`<li><strong>${n.title}</strong><br/><span class="tiny muted">${n.time}</span><p>${n.summary}</p></li>`).join(''); });

  // Build allocation sliders
  function buildAllocators(){
    els.alloc.innerHTML = portfolios.map(p=>`<label>${p.name} (${p.risk}/10)
      <input type="range" min="0" max="100" value="${alloc[p.id]??0}" data-id="${p.id}"/>
      <span class="pill" id="pct_${p.id}">${alloc[p.id]??0}%</span>
    </label>`).join('');
    els.alloc.querySelectorAll('input[type=range]').forEach(r=> r.addEventListener('input',onSlide));
  }

  function onSlide(){
    // Normalize to 100%
    const sliders=[...els.alloc.querySelectorAll('input[type=range]')];
    let total = sliders.reduce((a,s)=>a+Number(s.value),0) || 1;
    sliders.forEach(s=>{ alloc[s.dataset.id] = Math.round((Number(s.value)/total)*100); });
    // Fix rounding to sum 100
    let sum=Object.values(alloc).reduce((a,b)=>a+b,0); const keys=Object.keys(alloc);
    while(sum>100){ alloc[keys[0]]--; sum--; }
    while(sum<100){ alloc[keys[0]]++; sum++; }
    sliders.forEach(s=>{ s.value=alloc[s.dataset.id]; byId('pct_'+s.dataset.id).textContent=alloc[s.dataset.id]+'%'; });
    FG.set(K.alloc,alloc); renderRisk();
  }

  function renderRisk(){
    // Weighted risk average
    const r = portfolios.reduce((acc,p)=> acc + (p.risk*(alloc[p.id]||0))/100, 0);
    const amt = Number(els.amount.value||0);
    els.riskScore.textContent = r.toFixed(1)+' / 10';
    els.riskView.innerHTML = `<span class="pill">Amount: ₹${amt.toLocaleString('en-IN')}</span> <span class="pill">Allocation set</span>`;
    localStorage.setItem(K.risk, String(r.toFixed(1)));
    drawGrowth();
  }

  // Growth / compound chart
  ['input','change'].forEach(ev=>{ els.amount.addEventListener(ev,renderRisk); els.years.addEventListener(ev,drawGrowth); els.rate.addEventListener(ev,drawGrowth); });

  function drawGrowth(){
    const ctx = els.chart.getContext('2d'); const w=els.chart.width, h=els.chart.height; ctx.clearRect(0,0,w,h);
    const P=Number(els.amount.value||0); const years=Number(els.years.value||1); const rate=Number(els.rate.value||8)/100;
    const N=years*12; const mRate=rate/12; // monthly comp
    // compute series
    const series=[]; let A=P; for(let i=0;i<=N;i++){ series.push(A); A=A*(1+mRate); }
    const max=Math.max(...series,1);
    // axes
    ctx.strokeStyle=getVar('--ink'); ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(30,h-20); ctx.lineTo(w-10,h-20); ctx.moveTo(30,10); ctx.lineTo(30,h-20); ctx.stroke();
    // line
    ctx.strokeStyle=getVar('--accent-3'); ctx.lineWidth=2; ctx.beginPath();
    series.forEach((v,i)=>{ const x=30 + (i/N)*(w-40); const y=(h-20) - (v/max)*(h-40); i?ctx.lineTo(x,y):ctx.moveTo(x,y); }); ctx.stroke();
    const final=series[series.length-1]; els.projection.textContent = `After ${years} years at ${(rate*100).toFixed(1)}%: ₹${Math.round(final).toLocaleString('en-IN')}`;
  }

  function buildPortfolioList(){
    els.plist.innerHTML = portfolios.map(p=>`<li><strong>${p.name}</strong> — ${p.desc} <span class="pill tiny">Risk ${p.risk}/10</span></li>`).join('');
  }

  function byId(id){return document.getElementById(id)}
  function getVar(v){return getComputedStyle(document.documentElement).getPropertyValue(v)}
})();
