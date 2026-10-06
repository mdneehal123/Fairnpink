(function(){
  var form=document.getElementById('ro-form'), keyIn=document.getElementById('ro-key'), out=document.getElementById('ro-out'), btn=document.getElementById('ro-go'), range=document.getElementById('ro-range');
  function el(t,x,c){var e=document.createElement(t);if(x){e.textContent=x;}if(c){e.className=c;}return e;}
  function sent(){try{return JSON.parse(localStorage.getItem('fnp-reminded')||'{}');}catch(e){return {};}}
  function mark(id){var s=sent();s[id]=Date.now();try{localStorage.setItem('fnp-reminded',JSON.stringify(s));}catch(e){}}
  try{var k=localStorage.getItem('fnp-admin');if(k){keyIn.value=k;}}catch(e){}
  function msgLeft(c){return 'Hello '+(c.name||'')+', this is Fair N Pink. You started an order for '+(c.pack||'our cream')+' on our website and the payment did not go through. Can I help with anything? Your details are still saved, so you can finish here: https://fairnpink.in/ or just reply and I will help. Reply STOP if you would rather not hear from us.';}
  function msg(c){return 'Hello '+(c.name||'')+', this is Fair N Pink. Thank you for your order. Your Advance Radiance Cream jar may be running low by now. You can reorder here: https://fairnpink.in/ (Pack of 2 is Rs 1,749 when you pay online). Reply STOP if you would rather not get reminders.';}
  function rs(n){return '₹'+Number(n).toLocaleString('en-IN');}
  function renderOrders(d){
    out.textContent='';out.hidden=false;
    var t=d.totals, list=d.orders||[];
    out.appendChild(el('p',d.days===1?'Paid orders today':'Paid orders in the last 7 days','byline'));
    var tiles=el('div',null,'ro-tiles');
    [['Orders',t.count],['Prepaid',t.prepaid],['Cash on Delivery',t.cod],['Money received',rs(t.received)],['Cash to collect',rs(t.to_collect)]].forEach(function(x){var b=el('div');b.appendChild(el('b',String(x[1])));b.appendChild(el('span',x[0]));tiles.appendChild(b);});
    out.appendChild(tiles);
    if(!list.length){out.appendChild(el('p',d.days===1?'No paid orders yet today.':'No paid orders in the last 7 days.'));return;}
    list.forEach(function(o){
      var row=el('div',null,'ro-row');
      var info=el('div');info.appendChild(el('b',o.name||'Customer'));
      info.appendChild(el('span',[o.pack,o.cod?'Cash on Delivery: '+rs(o.paid)+' paid, '+rs(o.collect)+' to collect':'Prepaid: '+rs(o.paid)].filter(Boolean).join(' · ')));
      info.appendChild(el('span',[o.city,o.pincode,o.when].filter(Boolean).join(' · ')));
      info.appendChild(el('span','+91 '+o.phone));
      var a=el('a','Track','btn inline');a.href='/track/?id='+encodeURIComponent(o.id);a.target='_blank';a.rel='noopener';
      row.appendChild(info);row.appendChild(a);out.appendChild(row);
    });
  }
  function render(d){
    out.textContent='';out.hidden=false;
    var done=sent(), list=d.customers||[];
    var left=d.kind==='abandoned';
    out.appendChild(el('p',left?list.length+' customer'+(list.length===1?'':'s')+' started an order in the last 3 days and did not pay.':list.length+' customer'+(list.length===1?'':'s')+' ordered '+d.from+' to '+d.to+' days ago.','byline'));
    if(!list.length){out.appendChild(el('p',left?'Nobody has left an unpaid order in the last 3 days.':'Nobody is due a reminder in this range yet. Check again in a few days.'));return;}
    list.forEach(function(c){
      var row=el('div',null,'ro-row'+(done[c.id]?' is-sent':''));
      var info=el('div');info.appendChild(el('b',c.name||'Customer'));info.appendChild(el('span',[c.pack,c.cod?'Cash on Delivery, Rs '+c.amount+' advance':'Rs '+c.amount,c.city,left?(c.hours<1?'under an hour ago':c.hours+' hours ago'):c.days+' days ago'].filter(Boolean).join(' · ')));info.appendChild(el('span','+91 '+c.phone));
      var a=el('a',done[c.id]?'Sent':(left?'Message on WhatsApp':'Send reminder'),'btn inline');a.href='https://wa.me/91'+c.phone+'?text='+encodeURIComponent(left?msgLeft(c):msg(c));a.target='_blank';a.rel='noopener';
      a.addEventListener('click',function(){mark(c.id);row.classList.add('is-sent');a.textContent='Sent';});
      row.appendChild(info);row.appendChild(a);out.appendChild(row);
    });
  }
  form.addEventListener('submit',function(e){
    e.preventDefault();var key=keyIn.value.trim(), r=range.value.split('-');
    btn.disabled=true;btn.textContent='Loading…';
    fetch(range.value==='today'?'/api/reorder?kind=orders&days=1':range.value==='week'?'/api/reorder?kind=orders&days=7':range.value==='left'?'/api/reorder?kind=abandoned':'/api/reorder?from='+r[0]+'&to='+r[1],{headers:{'x-admin-key':key}}).then(function(x){return x.json().then(function(j){return {ok:x.ok,j:j};});})
    .then(function(x){
      if(x.ok){try{localStorage.setItem('fnp-admin',key);}catch(e){}if(x.j.kind==='orders'){renderOrders(x.j);}else{render(x.j);}}
      else{out.textContent='';out.hidden=false;out.appendChild(el('p',x.j.error==='wrong_key'?'That key is not correct.':x.j.error==='admin_key_not_set'?'The admin key has not been set in Vercel yet.':'Could not load the list. Please try again.','oerr'));}
    }).catch(function(){out.textContent='';out.hidden=false;out.appendChild(el('p','Could not load the list. Check your connection.','oerr'));})
    .then(function(){btn.disabled=false;btn.textContent='Show';});
  });
})();
