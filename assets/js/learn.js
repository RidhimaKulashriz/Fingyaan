(function(){
  const el={start:byId('startQuiz'),next:byId('next'),q:byId('question'),choices:byId('choices'),timer:byId('timer'),score:byId('score'),badges:byId('badges')};
  if(!el.start) return;
  const K={best:'fg_quiz_best',badges:'fg_quiz_badges'};
  let questions=[]; let order=[]; let idx=0; let points=0; let remaining=30; let tick;

  fetch('assets/data/quiz.json').then(r=>r.json()).then(q=>{questions=q;});

  el.start.addEventListener('click',()=>{ start(); });
  el.next.addEventListener('click',()=>{ idx++; show(); });

  function start(){
    points=0; remaining=30; idx=0; order=shuffle([...Array(questions.length).keys()]).slice(0,7);
    el.score.textContent='0'; el.badges.innerHTML=''; el.next.disabled=true; countdown(); show();
  }

  function show(){
    if(idx>=order.length){ finish(); return; }
    const q = questions[order[idx]]; el.q.textContent = q.q;
    el.choices.innerHTML = '';
    q.choices.forEach((c,i)=>{
      const b=document.createElement('button'); b.className='btn'; b.textContent=c; b.addEventListener('click',()=>answer(i===q.a)); el.choices.appendChild(b);
    });
    el.next.disabled=true;
  }

  function answer(correct){
    [...el.choices.children].forEach(b=>b.disabled=true);
    if(correct){ points+=10; el.score.textContent=String(points); toast('Correct! +10'); maybeBadge(); }
    else toast('Not quite.');
    el.next.disabled=false;
  }

  function finish(){
    clearInterval(tick); el.q.textContent = `Done! Score: ${points}`; el.choices.innerHTML=''; el.next.disabled=true;
    const best = Number(localStorage.getItem(K.best)||0);
    if(points>best){ localStorage.setItem(K.best, String(points)); toast('New High Score!'); }
  }

  function countdown(){ clearInterval(tick); updateTimer(); tick=setInterval(()=>{ remaining--; updateTimer(); if(remaining<=0){ finish(); } },1000); }
  function updateTimer(){ el.timer.textContent = '00:' + String(Math.max(0,remaining)).padStart(2,'0'); }

  function maybeBadge(){
    const earned = new Set(JSON.parse(localStorage.getItem(K.badges)||'[]'));
    if(points>=30 && !earned.has('Starter')) addBadge('Starter');
    if(points>=50 && !earned.has('Achiever')) addBadge('Achiever');
    if(points>=70 && !earned.has('Pro')) addBadge('Pro');
    function addBadge(name){ earned.add(name); localStorage.setItem(K.badges, JSON.stringify([...earned]));
      const b=document.createElement('span'); b.className='badge levelup'; b.textContent=name; el.badges.appendChild(b);
    }
  }

  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
  function byId(id){return document.getElementById(id)}
  function toast(msg){ const t=document.createElement('div'); t.textContent=msg; t.className='pill'; t.style.position='fixed'; t.style.right='1rem'; t.style.bottom='1rem'; t.style.zIndex='50'; document.body.appendChild(t); setTimeout(()=>t.remove(),1200); }
})();
