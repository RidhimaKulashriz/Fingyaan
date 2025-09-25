(function(){
  const el={name:byId('name'),college:byId('college'),avatar:byId('avatar'),preview:byId('avatarPreview'),
    save:byId('saveProfile'),pSavings:byId('pSavings'),pRisk:byId('pRisk'),pQuiz:byId('pQuiz'),pBadges:byId('pBadges'),
    reset:byId('resetData'),dlg:byId('confirmReset'),confirmYes:byId('confirmResetYes')};
  if(!el.save) return;

  const K={profile:'fg_profile',quizBest:'fg_quiz_best',quizBadges:'fg_quiz_badges',sumSavings:'fg_sumSavings',risk:'fg_risk'};

  // Load profile
  const prof = FG.get(K.profile,{name:'',college:'',avatar:''});
  el.name.value=prof.name; el.college.value=prof.college; if(prof.avatar){ el.preview.src=prof.avatar; }

  // Avatar preview
  el.avatar.addEventListener('change',()=>{
    const f=el.avatar.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=e=>{ el.preview.src = e.target.result; }; r.readAsDataURL(f);
  });

  // Save
  el.save.addEventListener('click',()=>{
    FG.set(K.profile,{name:el.name.value.trim(),college:el.college.value.trim(),avatar:el.preview.src||''});
    toast('Profile saved');
  });

  // Stats
  function refreshStats(){
    const sav=Number(localStorage.getItem(K.sumSavings)||0); el.pSavings.textContent = '₹'+sav.toLocaleString('en-IN');
    const risk=localStorage.getItem(K.risk)||'0'; el.pRisk.textContent=risk;
    const best=localStorage.getItem(K.quizBest)||'0'; el.pQuiz.textContent=best;
    const badges=JSON.parse(localStorage.getItem(K.quizBadges)||'[]'); el.pBadges.textContent=badges.join(', ')||'—';
  }
  refreshStats();

  // Reset
  el.reset.addEventListener('click',()=> el.dlg.showModal());
  el.confirmYes.addEventListener('click',()=>{
    localStorage.clear(); el.dlg.close(); toast('All data reset'); location.reload();
  });

  function byId(id){return document.getElementById(id)}
  function toast(msg){ const t=document.createElement('div'); t.textContent=msg; t.className='pill'; t.style.position='fixed'; t.style.right='1rem'; t.style.bottom='1rem'; t.style.zIndex='50'; document.body.appendChild(t); setTimeout(()=>t.remove(),1200); }
})();
