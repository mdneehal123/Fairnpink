(function(){
  var form=document.getElementById('track-form'), input=document.getElementById('track-id'), out=document.getElementById('track-out'), btn=document.getElementById('track-go');
  function el(tag,text,cls){var e=document.createElement(tag);if(text){e.textContent=text;}if(cls){e.className=cls;}return e;}
  function day(s){var d=new Date(String(s).replace(' ','T'));return isNaN(d)?String(s):d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
  function show(nodes){out.textContent='';nodes.forEach(function(n){out.appendChild(n);});out.hidden=false;out.scrollIntoView({block:'nearest',behavior:'smooth'});}
  function help(){var a=el('a','Ask us on WhatsApp','btn wa inline');a.href='https://wa.me/919980881230?text='+encodeURIComponent('Hello, I want to check my Fair N Pink order. My ID is '+input.value.trim());a.target='_blank';a.rel='noopener';var p=el('p');p.style.marginTop='14px';p.appendChild(a);return p;}
  function steps(n){var names=['Order placed','Packed','Shipped','Delivered'], ol=el('ol',null,'tsteps');names.forEach(function(t,i){ol.appendChild(el('li',t,i<n?'done':''));});return ol;}
  function render(d){
    if(d.paid===false){return show([el('h2','Payment not completed'),el('p','We found this order, but the payment was not completed, so it has not been dispatched. If money left your account, message us with the ID.'),help()]);}
    if(!d.shipped){var a=[el('h2','Order received'),steps(1),el('p',(d.pack?d.pack+'. ':'')+(d.due?'Rs '+d.due+' to pay in cash on delivery. ':'')+'Your order is confirmed and is being packed. Orders are dispatched within 24 hours, except Sundays and national holidays. Tracking details appear here once the courier collects the parcel.')];if(d.placed){a.splice(1,0,el('p','Placed on '+day(d.placed),'byline'));}a.push(help());return show(a);}
    var delivered=/deliver/i.test(d.status||'')&&!/out for|undeliver|not deliver/i.test(d.status||'');
    var nodes=[el('h2',d.status||'Shipped'),steps(delivered?4:3)];
    var facts=el('p'),bits=[];if(d.courier){bits.push('Courier: '+d.courier);}if(d.awb){bits.push('Tracking number: '+d.awb);}
    if(d.due&&!delivered){bits.push('Rs '+d.due+' to pay on delivery');}
    if(delivered&&d.delivered_on){bits.push('Delivered on '+day(d.delivered_on));}else if(d.expected){bits.push('Expected by '+day(d.expected));}
    facts.textContent=bits.join(' · ');nodes.push(facts);
    if(d.events&&d.events.length){var ul=el('ul',null,'tlog');d.events.forEach(function(e){var li=el('li');li.appendChild(el('b',e.text));li.appendChild(el('span',[day(e.date),e.place].filter(Boolean).join(' · ')));ul.appendChild(li);});nodes.push(ul);}
    if(d.track_url){var a=el('a','Open courier tracking','btn inline');a.href=d.track_url;a.target='_blank';a.rel='noopener';var p=el('p');p.style.marginTop='14px';p.appendChild(a);nodes.push(p);}
    show(nodes);
  }
  function go(){
    var id=input.value.trim().replace(/\s+/g,'');
    if(id.length<8){return show([el('p','Please enter your Payment ID or tracking number.','oerr')]);}
    btn.disabled=true;btn.textContent='Checking…';
    fetch('/api/track?id='+encodeURIComponent(id)).then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
    .then(function(x){
      if(x.ok&&x.j.found){render(x.j);}
      else if(x.j&&(x.j.error==='not_found'||x.j.error==='bad_id')){show([el('h2','We could not find that ID'),el('p','Check it and try again. The Payment ID starts with pay_ and is in your payment SMS and on the confirmation screen. For Cash on Delivery orders, use the tracking number we sent you.'),help()]);}
      else{show([el('h2','Tracking is not available right now'),el('p','Please try again in a few minutes, or message us and we will check for you.'),help()]);}
    }).catch(function(){show([el('h2','Tracking is not available right now'),el('p','Please check your connection and try again.'),help()]);})
    .then(function(){btn.disabled=false;btn.textContent='Track order';});
  }
  form.addEventListener('submit',function(e){e.preventDefault();go();});
  /* Orders placed on this device are remembered here (on the device only), so the customer does not need to look up the ID. */
  var mine=[];try{mine=JSON.parse(localStorage.getItem('fnp-orders')||'[]').filter(function(o){return o&&/^pay_/.test(o.id);});}catch(e){}
  if(mine.length){
    var box=el('div',null,'track-mine');box.appendChild(el('p','Your orders on this device','track-mine-h'));
    mine.forEach(function(o){var b=el('button',(o.pack||'Order')+' · '+new Date(o.at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),'track-chip');b.type='button';b.addEventListener('click',function(){input.value=o.id;go();});box.appendChild(b);});
    form.parentNode.insertBefore(box,form);
  }
  var q=new URLSearchParams(location.search).get('id');
  if(q){input.value=q;go();}else if(mine.length){input.value=mine[0].id;go();}
})();
