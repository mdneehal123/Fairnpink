(function(){
  var form=document.getElementById('ro-form'), keyIn=document.getElementById('ro-key'), out=document.getElementById('ro-out'), btn=document.getElementById('ro-go'), range=document.getElementById('ro-range');
  function el(t,x,c){var e=document.createElement(t);if(x){e.textContent=x;}if(c){e.className=c;}return e;}
  function sent(){try{return JSON.parse(localStorage.getItem('fnp-reminded')||'{}');}catch(e){return {};}}
  function mark(id){var s=sent();s[id]=Date.now();try{localStorage.setItem('fnp-reminded',JSON.stringify(s));}catch(e){}}
  try{var k=localStorage.getItem('fnp-admin');if(k){keyIn.value=k;}}catch(e){}
  function msg(c){return 'Hello '+(c.name||'')+', this is Fair N Pink. Thank you for your order. Your Advance Radiance Cream jar may be running low by now. You can reorder here: https://fairnpink.in/ (Pack of 2 is Rs 1,749 when you pay online). Reply STOP if you would rather not get reminders.';}
  function render(d){
    out.textContent='';out.hidden=false;
    var done=sent(), list=d.customers||[];
    out.appendChild(el('p',list.length+' customer'+(list.length===1?'':'s')+' ordered '+d.from+' to '+d.to+' days ago.','byline'));
    if(!list.length){out.appendChild(el('p','Nobody is due a reminder in this range yet. Check again in a few days.'));return;}
    list.forEach(function(c){
      var row=el('div',null,'ro-row'+(done[c.id]?' is-sent':''));
      var info=el('div');info.appendChild(el('b',c.name||'Customer'));info.appendChild(el('span',[c.pack,'Rs '+c.amount,c.city,c.days+' days ago'].filter(Boolean).join(' · ')));info.appendChild(el('span','+91 '+c.phone));
      var a=el('a',done[c.id]?'Sent':'Send reminder','btn inline');a.href='https://wa.me/91'+c.phone+'?text='+encodeURIComponent(msg(c));a.target='_blank';a.rel='noopener';
      a.addEventListener('click',function(){mark(c.id);row.classList.add('is-sent');a.textContent='Sent';});
      row.appendChild(info);row.appendChild(a);out.appendChild(row);
    });
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();var key=keyIn.value.trim(), r=range.value.split('-');
    btn.disabled=true;btn.textContent='Loading…';
    fetch('/api/reorder?from='+r[0]+'&to='+r[1],{headers:{'x-admin-key':key}}).then(function(x){return x.json().then(function(j){return {ok:x.ok,j:j};});})
    .then(function(x){
      if(x.ok){try{localStorage.setItem('fnp-admin',key);}catch(e){}render(x.j);}
      else{out.textContent='';out.hidden=false;out.appendChild(el('p',x.j.error==='wrong_key'?'That key is not correct.':x.j.error==='admin_key_not_set'?'The admin key has not been set in Vercel yet.':'Could not load the list. Please try again.','oerr'));}
    }).catch(function(){out.textContent='';out.hidden=false;out.appendChild(el('p','Could not load the list. Check your connection.','oerr'));})
    .then(function(){btn.disabled=false;btn.textContent='Show customers';});
  });
})();
