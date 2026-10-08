(function(){
  var form=document.getElementById('track-form'), input=document.getElementById('track-id'), out=document.getElementById('track-out'), btn=document.getElementById('track-go');
  function el(tag,text,cls){var e=document.createElement(tag);if(text){e.textContent=text;}if(cls){e.className=cls;}return e;}
  function day(s){var d=new Date(String(s).replace(' ','T'));return isNaN(d)?String(s):d.toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'});}
  function show(nodes){out.textContent='';nodes.forEach(function(n){out.appendChild(n);});out.hidden=false;out.scrollIntoView({block:'nearest',behavior:'smooth'});}
  function help(){var a=el('a','Ask us on WhatsApp','btn wa inline');a.href='https://wa.me/919980881230?text='+encodeURIComponent('Hello, I want to check my Fair N Pink order. '+(byPhone?'My mobile number is '+tPhone.value.trim():'My ID is '+input.value.trim()));a.target='_blank';a.rel='noopener';var p=el('p');p.style.marginTop='14px';p.appendChild(a);return p;}
  function steps(n){var names=['Order placed','Packed','Shipped','Delivered'], ol=el('ol',null,'tsteps');names.forEach(function(t,i){ol.appendChild(el('li',t,i<n?'done':''));});return ol;}
  function render(d){
    var extra=d.others>0?el('p','Showing your latest order. You have '+d.others+' more with this number; message us on WhatsApp for those.','byline'):null;
    if(extra){setTimeout(function(){out.appendChild(extra);},0);}
    if(d.paid===false){return show([el('h2','Payment not completed'),el('p','We found this order, but the payment was not completed, so it has not been dispatched. If money left your account, message us with the ID.'),help()]);}
    if(!d.shipped){var a=[el('h2','Order received'),steps(1),el('p',(d.pack?d.pack+'. ':'')+(d.due?'₹'+Number(d.due).toLocaleString('en-IN')+' to pay in cash on delivery. ':'')+'Your order is confirmed and is being packed. Orders are dispatched within 24 hours, except Sundays and national holidays. Tracking details appear here once the courier collects the parcel.')];if(d.placed){a.splice(1,0,el('p','Placed on '+day(d.placed),'byline'));}a.push(help());return show(a);}
    var delivered=/deliver/i.test(d.status||'')&&!/out for|undeliver|not deliver/i.test(d.status||'');
    var nodes=[el('h2',d.status||'Shipped'),steps(delivered?4:3)];
    var facts=el('p'),bits=[];if(d.courier){bits.push('Courier: '+d.courier);}if(d.awb){bits.push('Tracking number: '+d.awb);}
    if(d.due&&!delivered){bits.push('₹'+Number(d.due).toLocaleString('en-IN')+' to pay on delivery');}
    if(delivered&&d.delivered_on){bits.push('Delivered on '+day(d.delivered_on));}else if(d.expected){bits.push('Expected by '+day(d.expected));}
    facts.textContent=bits.join(' · ');nodes.push(facts);
    if(d.events&&d.events.length){var ul=el('ul',null,'tlog');d.events.forEach(function(e){var li=el('li');li.appendChild(el('b',e.text));li.appendChild(el('span',[day(e.date),e.place].filter(Boolean).join(' · ')));ul.appendChild(li);});nodes.push(ul);}
    if(d.track_url){var a=el('a','Open courier tracking','btn inline');a.href=d.track_url;a.target='_blank';a.rel='noopener';var p=el('p');p.style.marginTop='14px';p.appendChild(a);nodes.push(p);}
    show(nodes);
  }
  var tPhone=document.getElementById('track-phone'), tPin=document.getElementById('track-pin'), byPhone=true;
  function setMode(phone){byPhone=phone;document.getElementById('by-phone-box').hidden=!phone;document.getElementById('by-id-box').hidden=phone;
    ['by-phone','by-id'].forEach(function(i){var on=(i==='by-phone')===phone;var b=document.getElementById(i);b.classList.toggle('on',on);b.setAttribute('aria-selected',String(on));});}
  document.getElementById('by-phone').addEventListener('click',function(){setMode(true);tPhone.focus();});
  document.getElementById('by-id').addEventListener('click',function(){setMode(false);input.focus();});
  function go(){
    var url;
    if(byPhone){
      var ph=tPhone.value.replace(/\D/g,'').slice(-10), pn=tPin.value.trim();
      if(!/^[6-9]\d{9}$/.test(ph)){return show([el('p','Please enter the 10-digit mobile number you used on the order.','oerr')]);}
      if(!/^[1-9]\d{5}$/.test(pn)){return show([el('p','Please enter the 6-digit delivery pincode.','oerr')]);}
      url='/api/track?phone='+ph+'&pin='+pn;
    }else{
      var id=input.value.trim().replace(/\s+/g,'');
      if(id.length<8){return show([el('p','Please enter your Payment ID or tracking number.','oerr')]);}
      url='/api/track?id='+encodeURIComponent(id);
    }
    btn.disabled=true;btn.textContent='Checking…';
    fetch(url).then(function(r){return r.json().then(function(j){return {ok:r.ok,j:j};});})
    .then(function(x){
      if(x.ok&&x.j.found){render(x.j);}
      else if(x.j&&(x.j.error==='not_found'||x.j.error==='bad_id'||x.j.error==='bad_phone')){show(byPhone?[el('h2','We could not find an order'),el('p','No paid order in the last 90 days matches this mobile number and pincode. Check both are exactly as you entered them when ordering, or track with your Payment ID instead.'),help()]:[el('h2','We could not find that ID'),el('p','Check it and try again. The Payment ID starts with pay_ and is in your payment SMS and on the confirmation screen.'),help()]);}
      else{show([el('h2','Tracking is not available right now'),el('p','Please try again in a few minutes, or message us and we will check for you.'),help()]);}
    }).catch(function(){show([el('h2','Tracking is not available right now'),el('p','Please check your connection and try again.'),help()]);})
    .then(function(){btn.disabled=false;btn.textContent='Track order';});
  }
  form.addEventListener('submit',function(e){e.preventDefault();go();});
  /* Orders placed on this device are remembered here (on the device only), so the customer does not need to look up the ID. */
  var mine=[];try{mine=JSON.parse(localStorage.getItem('fnp-orders')||'[]').filter(function(o){return o&&/^pay_/.test(o.id);});}catch(e){}
  if(mine.length){
    var box=el('div',null,'track-mine');box.appendChild(el('p','Your orders on this device','track-mine-h'));
    mine.forEach(function(o){var b=el('button',(o.pack||'Order')+' · '+new Date(o.at).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),'track-chip');b.type='button';b.addEventListener('click',function(){setMode(false);input.value=o.id;go();});box.appendChild(b);});
    form.parentNode.insertBefore(box,form);
  }
  var q=new URLSearchParams(location.search).get('id');
  if(q){setMode(false);input.value=q;go();}else if(mine.length){setMode(false);input.value=mine[0].id;go();}
})();
