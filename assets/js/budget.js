(function(){
  // Budget Dashboard
  const K={entries:'fg_entries',goalAmount:'fg_goalAmount',goalPeriod:'fg_goalPeriod',sumSavings:'fg_sumSavings'};
  const form=document.getElementById('entryForm'); if(!form) return;
  const el={type:byId('type'),category:byId('category'),amount:byId('amount'),note:byId('note'),
    entries:byId('entries'),sumIncome:byId('sumIncome'),sumExpense:byId('sumExpense'),sumSavings:byId('sumSavings'),
    goalPeriod:byId('goalPeriod'),goalAmount:byId('goalAmount'),progressBar:byId('progressBar'),
    chart:byId('chart'),catList:byId('categoryList'),tips:byId('tips'),exportCsv:byId('exportCsv'),clear:byId('clearBudget')};

  let data=FG.get(K.entries,[]);
  el.goalAmount.value=FG.get(K.goalAmount,0);
  el.goalPeriod.value=FG.get(K.goalPeriod,'monthly');

  form.addEventListener('submit',e=>{e.preventDefault();
    const item={id:crypto.randomUUID(),date:new Date().toLocaleDateString('en-IN'),type:el.type.value,
      category:el.category.value||'General',amount:Number(el.amount.value),note:el.note.value.trim()};
    if(!(item.amount>0)) return; data.push(item); FG.set(K.entries,data); el.amount.value=''; el.note.value=''; render();
  });
  el.goalAmount.addEventListener('change',()=>{FG.set(K.goalAmount,Number(el.goalAmount.value||0));render();});
  el.goalPeriod.addEventListener('change',()=>{FG.set(K.goalPeriod,el.goalPeriod.value);render();});
  el.exportCsv.addEventListener('click',()=>{const rows=[["Date","Type","Category","Amount","Note"],...data.map(r=>[r.date,r.type,r.category,r.amount,r.note])]; FG.csv('fingyaan-budget.csv',rows);});
  el.clear.addEventListener('click',()=>{ if(confirm('Reset all budget data?')){data=[]; FG.del(K.entries); render();}});

  function sum(t){return data.filter(r=>r.type===t).reduce((a,b)=>a+Number(b.amount),0)}
  function render(){
    // table
    el.entries.innerHTML='';
    data.forEach(r=>{const tr=document.createElement('tr');
      tr.innerHTML=`<td>${r.date}</td><td>${r.type}</td><td>${r.category}</td><td>₹${r.amount.toLocaleString('en-IN')}</td><td>${r.note||''}</td><td><button class="btn tiny" data-id="${r.id}">✕</button></td>`;
      tr.querySelector('button').addEventListener('click',()=>{data=data.filter(x=>x.id!==r.id); FG.set(K.entries,data); render();});
      el.entries.appendChild(tr);
    });
    // sums and progress
    const inc=sum('income')+sum('scholarship')+sum('loan'); const exp=sum('expense'); const sav=Math.max(0,inc-exp);
    el.sumIncome.textContent=`₹${inc.toLocaleString('en-IN')}`;
    el.sumExpense.textContent=`₹${exp.toLocaleString('en-IN')}`;
    el.sumSavings.textContent=`₹${sav.toLocaleString('en-IN')}`; localStorage.setItem(K.sumSavings,sav);
    const goal=Number(el.goalAmount.value||0); const pct=goal?Math.min(100,Math.round((sav/goal)*100)):0; el.progressBar.style.width=pct+'%';
    // categories + pie
    const cats={}; data.filter(r=>r.type==='expense').forEach(r=>cats[r.category]=(cats[r.category]||0)+Number(r.amount));
    el.catList.innerHTML=Object.entries(cats).map(([k,v])=>`<li class="pill">${k}: ₹${v.toLocaleString('en-IN')}</li>`).join('');
    drawPie(el.chart,Object.values(cats),Object.keys(cats));
    // tips
    el.tips.innerHTML=buildTips(inc,exp,cats).map(t=>`<li>${t}</li>`).join('');
  }

  function drawPie(c,values,labels){const ctx=c.getContext('2d'); ctx.clearRect(0,0,c.width,c.height);
    const total=values.reduce((a,b)=>a+b,0)||1; let start=-Math.PI/2; const colors=[css('--accent-1'),css('--accent-2'),css('--accent-3'),css('--accent-4')];
    values.forEach((v,i)=>{const ang=(v/total)*Math.PI*2; ctx.beginPath(); ctx.moveTo(180,120); ctx.arc(180,120,100,start,start+ang); ctx.closePath(); ctx.fillStyle=colors[i%colors.length]; ctx.fill(); start+=ang;});
    ctx.fillStyle=css('--ink'); ctx.font='12px system-ui'; labels.forEach((l,i)=>ctx.fillText(l,10,20+i*14));
  }

  function buildTips(inc,exp,cats){
    const tips=[]; const ratio=inc?Math.round((exp/inc)*100):0; if(ratio>70) tips.push('Expenses are over 70% of income — try cutting discretionary items.');
    const biggest=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0]; if(biggest) tips.push(`Highest spend: ${biggest[0]}. Set a weekly cap and track it.`);
    if((FG.get(K.goalAmount,0)||0)===0) tips.push('Set a savings goal to visualize progress.');
    if(sum('scholarship')===0) tips.push('Search for scholarships — even small ones add up.');
    return tips.length?tips:["Great job! Add more data to see insights."];
  }

  function byId(id){return document.getElementById(id)}
  function css(v){return getComputedStyle(document.documentElement).getPropertyValue(v)}

  render();
})();
