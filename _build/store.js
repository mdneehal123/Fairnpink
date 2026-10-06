(function(){
  var WA_NUMBER='919980881230'; /* business WhatsApp number with country code, digits only, e.g. 9198XXXXXXXX */
  var ADS_SEND_TO='AW-18495856180/xokwCNXZgpIdELS8wfNE'; /* Google Ads conversion, e.g. AW-18495856180/AbCdEfGh. Empty = not tracked yet */
  var UPI_OFF={1:100,2:150,3:250};
  var ADVANCE=99; /* paid online to confirm a Cash on Delivery order; the rest is paid at the door */
  var RZP=true; /* online payment through Razorpay */
  var PACKS={1:{price:999,was:999},2:{price:1899,was:1998},3:{price:2699,was:2997}}, qty=1;
  var panel=document.getElementById('order-panel');
  var line=document.getElementById('order-line'), barTotal=document.getElementById('bar-total'), barQty=document.getElementById('bar-qty');
  var now=document.getElementById('price-now'), was=document.getElementById('price-was'), note=document.getElementById('price-note');
  var packBtns=[].slice.call(document.querySelectorAll('.pack'));
  function rupees(n){return '₹'+n.toLocaleString('en-IN');}
  function render(){
    var p=PACKS[qty], label='Pack of '+qty;
    now.textContent=rupees(p.price);
    was.textContent=rupees(p.was); was.hidden=p.was===p.price;
    note.textContent=(qty===1?'':rupees(Math.round(p.price/qty))+' per jar, ')+'inclusive of all taxes';
    line.textContent=label+' · '+rupees(p.price);
    barTotal.textContent=rupees(p.price);
    barQty.textContent=label+' · Fair N Pink';
    var off=UPI_OFF[qty];
    document.getElementById('upi-save').textContent=rupees(off);
    document.getElementById('pay-save').textContent=rupees(off);
    document.getElementById('pay-upi-amt').textContent=rupees(p.price-off);
    document.getElementById('pay-cod-amt').textContent=rupees(p.price);
    document.getElementById('pay-wa-amt').textContent=rupees(p.price);
    document.getElementById('pay-cod-note').textContent='Pay '+rupees(ADVANCE)+' now, '+rupees(p.price-ADVANCE)+' on delivery';
    if(typeof orderLink==='function'){orderLink();}
    var msg='Hello, I want to order Fair N Pink Advance Radiance Cream.\n'+label+' - '+rupees(p.price)+'\nName: \nAddress and pincode: ';
    document.getElementById('wa-order').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
    packBtns.forEach(function(b){
      var on=Number(b.dataset.pack)===qty;
      b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on));
      if(on){
        var gp=document.getElementById('gthumb-pack');if(gp){gp.src='/assets/pack-'+qty+'-s.webp';}
        if(packPhotoShown){document.getElementById('media-photo').src='/assets/pack-'+qty+'.webp';}
      }
    });
  }
  var packPhotoShown=true, gthumbs=[].slice.call(document.querySelectorAll('.gthumb'));
  function pick(t){
    var main=document.getElementById('media-photo'), src=t.getAttribute('data-src');
    packPhotoShown=!src;
    main.src=src||'/assets/pack-'+qty+'.webp';
    main.alt=t.getAttribute('data-alt');
    gthumbs.forEach(function(x){var on=x===t;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on));});
  }
  gthumbs.forEach(function(t){t.addEventListener('click',function(){pick(t);});});
  var goToForm=false; /* set by the floating button: the next pack tap carries on down to the form */
  packBtns.forEach(function(b){b.addEventListener('click',function(){qty=Number(b.dataset.pack);if(gthumbs.length){pick(gthumbs[0]);}render();
    if(goToForm){goToForm=false;panel.hidden=false;window.scrollTo({top:Math.max(0,panel.getBoundingClientRect().top+window.pageYOffset-80),behavior:'smooth'});}});});
  var F={name:document.getElementById('of-name'),phone:document.getElementById('of-phone'),address:document.getElementById('of-address'),city:document.getElementById('of-city'),pin:document.getElementById('of-pin')};
  var sendBtn=document.getElementById('order-send'), err=document.getElementById('order-error');
  /* An Indian mobile: 10 digits starting 6 to 9, with an optional 0 or 91 in front. Returns the 10 digits, or ''. */
  function mobile(v){var d=String(v).replace(/\D/g,'');if(d.length===12&&d.slice(0,2)==='91'){d=d.slice(2);}else if(d.length===11&&d.charAt(0)==='0'){d=d.slice(1);}return /^[6-9]\d{9}$/.test(d)&&!/^(\d)\1{9}$/.test(d)?d:'';}
  var badField=null;
  function orderProblem(){
    badField=null;
    if(F.name.value.trim().length<2){badField=F.name;return 'Please enter your full name.';}
    if(!mobile(F.phone.value)){badField=F.phone;return 'Please check the mobile number. It should be a 10-digit Indian mobile number.';}
    if(F.address.value.trim().length<8){badField=F.address;return 'Please enter your full address, with house number and street.';}
    if(!/^[1-9]\d{5}$/.test(F.pin.value.trim())){badField=F.pin;return 'Please enter a 6-digit pincode.';}
    if(F.city.value.trim().length<2){badField=F.city;return 'Please enter your city.';}
    return '';
  }
  function mark(){[].slice.call(document.querySelectorAll('.fielderr')).forEach(function(x){x.remove();});Object.keys(F).forEach(function(k){var bad=F[k]===badField;F[k].classList.toggle('bad',bad);if(bad){F[k].setAttribute('aria-invalid','true');}else{F[k].removeAttribute('aria-invalid');}});}
  function showProblem(text){err.textContent=text;err.hidden=false;mark();if(badField){var fe=document.createElement('p');fe.className='fielderr';fe.textContent=text;badField.insertAdjacentElement('afterend',fe);badField.focus({preventScroll:true});badField.scrollIntoView({block:'center',behavior:'smooth'});}}
  function payMode(){return document.getElementById('pay-upi').checked?'online':document.getElementById('pay-cod').checked?'cod':'wa';}
  function waOrderUrl(){
    var p=PACKS[qty];
    var msg='New order: Fair N Pink Advance Radiance Cream\nPack of '+qty+'\nTotal: '+rupees(p.price)+'\nPayment: please confirm with me on WhatsApp\n\nName: '+F.name.value.trim()+'\nMobile: '+F.phone.value.trim()+'\nAddress: '+F.address.value.trim()+'\nCity: '+F.city.value.trim()+'\nPincode: '+F.pin.value.trim();
    return 'https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
  }
  function sumRow(k,v,cls){var r=document.createElement('div');if(cls){r.className=cls;}var a=document.createElement('span'),b=document.createElement('b');a.textContent=k;b.textContent=v;r.appendChild(a);r.appendChild(b);return r;}
  function summary(m){
    var p=PACKS[qty], box=document.getElementById('order-sum'), h=document.createElement('p');
    box.textContent='';h.className='osum-h';h.textContent='Your order';box.appendChild(h);
    box.appendChild(sumRow('Fair N Pink Advance Radiance Cream, Pack of '+qty,rupees(p.price)));
    if(m==='online'){
      box.appendChild(sumRow('Online payment saving','− '+rupees(UPI_OFF[qty]),'osum-save'));
      box.appendChild(sumRow('Shipping','Free'));
      box.appendChild(sumRow('You pay now',rupees(p.price-UPI_OFF[qty]),'osum-total'));
    }else if(m==='cod'){
      box.appendChild(sumRow('Delivery or handling fee','None'));
      box.appendChild(sumRow('You pay now (advance)',rupees(ADVANCE),'osum-total'));
      box.appendChild(sumRow('You pay in cash on delivery',rupees(p.price-ADVANCE)));
    }else{
      box.appendChild(sumRow('Order total',rupees(p.price),'osum-total'));
      box.appendChild(sumRow('Payment','Confirmed with you on WhatsApp'));
    }
  }
  function orderLink(){
    var p=PACKS[qty], m=payMode();
    if(!sendBtn.dataset.busy){sendBtn.textContent=m==='online'?'Pay '+rupees(p.price-UPI_OFF[qty])+' securely':m==='cod'?'Pay '+rupees(ADVANCE)+' to confirm order':'Send order on WhatsApp';}
    document.getElementById('cod-terms').hidden=m!=='cod';
    summary(m);
  }
  Object.keys(F).forEach(function(k){F[k].addEventListener('input',function(){orderLink();F[k].classList.remove('bad');F[k].removeAttribute('aria-invalid');var fe=F[k].nextElementSibling;if(fe&&fe.className==='fielderr'){fe.remove();}if(!err.hidden&&!orderProblem()){err.hidden=true;}});});
  F.phone.addEventListener('blur',function(){if(F.phone.value.trim()&&!mobile(F.phone.value)){F.phone.classList.add('bad');}});
  function track(value,id){if(ADS_SEND_TO&&typeof gtag==='function'){gtag('event','conversion',{send_to:ADS_SEND_TO,value:value,currency:'INR',transaction_id:id});}}
  function fail(text){err.textContent=text;err.hidden=false;delete sendBtn.dataset.busy;orderLink();}
  function loadCheckout(done){
    if(window.Razorpay){done();return;}
    var s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';
    s.onload=done;s.onerror=function(){fail('The payment window could not load. Please check your connection and try again, or message us on WhatsApp.');};
    document.head.appendChild(s);
  }
  function paid(paymentId,total,confirmed,balance){
    track(total,paymentId);remember();clearPending();
    var cod=balance>0;
    var msg=(cod?'Cash on Delivery order':'Paid order')+': Fair N Pink Advance Radiance Cream\nPack of '+qty+'\n'+(cod?'Advance paid: '+rupees(ADVANCE)+'\nTo pay on delivery: '+rupees(balance):'Paid online: '+rupees(total))+'\nPayment ID: '+paymentId+'\nTrack: https://fairnpink.in/track/?id='+paymentId+'\n\nName: '+F.name.value.trim()+'\nMobile: '+F.phone.value.trim()+'\nAddress: '+F.address.value.trim()+'\nCity: '+F.city.value.trim()+'\nPincode: '+F.pin.value.trim();
    var form=document.getElementById('order-form'), box=document.createElement('div');
    box.className='thanks';box.setAttribute('role','status');
    function el(tag,cls,text){var x=document.createElement(tag);if(cls){x.className=cls;}if(text){x.textContent=text;}box.appendChild(x);return x;}
    el('span','thanks-tick','✓').setAttribute('aria-hidden','true');
    el('h3','',confirmed?(cod?'Order confirmed. Thank you.':'Payment received. Thank you.'):'Payment submitted. We are confirming it.');
    el('p','thanks-sub','We have your delivery details and will dispatch within 24 hours, except on Sundays and national holidays.');
    var list=el('div','osum');
    list.appendChild(sumRow('Order','Pack of '+qty));
    if(cod){list.appendChild(sumRow('Advance received',rupees(ADVANCE)));list.appendChild(sumRow('To pay in cash on delivery',rupees(balance),'osum-total'));}
    else{list.appendChild(sumRow('Paid online',rupees(total),'osum-total'));}
    list.appendChild(sumRow('Delivering to',F.city.value.trim()+' '+F.pin.value.trim()));
    list.appendChild(sumRow('Order number',paymentId,'osum-id'));
    el('p','thanks-note','Keep the order number. It is all you need to track this order.');
    var t=el('a','btn','Track this order');t.href='/track/?id='+encodeURIComponent(paymentId);
    var a=el('a','btn ghost','Get updates on WhatsApp');a.target='_blank';a.rel='noopener';a.href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
    el('p','thanks-note','Save our WhatsApp number for any question about this order: +'+WA_NUMBER.slice(0,2)+' '+WA_NUMBER.slice(2,7)+' '+WA_NUMBER.slice(7)+'.');
    el('h4','','When your jar arrives');
    var ol=el('ol','thanks-use');
    ['Wash your face and pat it dry.','Take a pea-sized amount of cream.','Spread a thin layer over face and neck, morning and night.','Finish with sunscreen every morning.'].forEach(function(x){var li=document.createElement('li');li.textContent=x;ol.appendChild(li);});
    var more=el('a','thanks-more','Read the full how-to-use guide');more.href='/how-to-use/';
    el('h4','','Know someone who would like it?');
    var sh=el('a','btn ghost','Share with a friend on WhatsApp');sh.target='_blank';sh.rel='noopener';
    sh.href='https://wa.me/?text='+encodeURIComponent('I just ordered Fair N Pink Advance Radiance Cream from the brand\'s own store. Have a look: https://fairnpink.in/');
    form.hidden=true;form.parentNode.insertBefore(box,form);
    var intro=panel.querySelectorAll('p')[1];if(intro){intro.hidden=true;}
    box.scrollIntoView({block:'center',behavior:'smooth'});
  }
  function payOnline(advance){
    var total=advance?PACKS[qty].price:PACKS[qty].price-UPI_OFF[qty];
    lastMode=advance?'cod':'online';notYet.hidden=true;
    err.hidden=true;sendBtn.dataset.busy='1';sendBtn.textContent='Opening secure payment…';
    fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pack:qty,mode:advance?'advance':'full',name:F.name.value.trim(),phone:mobile(F.phone.value),address:F.address.value.trim(),city:F.city.value.trim(),pincode:F.pin.value.trim()})})
    .then(function(r){return r.ok?r.json():Promise.reject(r.status);})
    .then(function(o){
      var balance=Number(o.balance)||0;
      loadCheckout(function(){
        var done=false;
        var rz=new window.Razorpay({key:o.key_id,order_id:o.order_id,amount:o.amount,currency:o.currency,name:'Fair N Pink',description:'Advance Radiance Cream, Pack of '+qty+(advance?' (advance for Cash on Delivery)':''),
          prefill:{name:F.name.value.trim(),contact:mobile(F.phone.value)},theme:{color:'#231B1E'},
          handler:function(resp){
            done=true;
            fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(resp)})
            .then(function(r){return r.json();}).then(function(v){paid(resp.razorpay_payment_id,total,!!v.ok,balance);})
            .catch(function(){paid(resp.razorpay_payment_id,total,false,balance);});
          },
          modal:{ondismiss:function(){delete sendBtn.dataset.busy;orderLink();if(!done){stopped();}}}});
        rz.on('payment.failed',function(){fail('The payment did not go through. Nothing was charged if your bank shows no debit. Please try again, or message us on WhatsApp.');});
        rz.open();
      });
    })
    .catch(function(){fail('Online payment is not available right now. Please try again in a few minutes, or message us on WhatsApp.');});
  }
  /* Remember delivery details on this device only, after an order, so a repeat order needs no typing. */
  var KEY='fnp-details', savedLine=document.getElementById('saved-line');
  function remember(){try{var o={};Object.keys(F).forEach(function(k){o[k]=F[k].value.trim();});localStorage.setItem(KEY,JSON.stringify(o));}catch(e){}}
  function forget(){try{localStorage.removeItem(KEY);}catch(e){}Object.keys(F).forEach(function(k){F[k].value='';});savedLine.hidden=true;pinNote.hidden=true;orderLink();}
  document.getElementById('saved-clear').addEventListener('click',forget);
  /* An order that was started but not paid: kept on this device only, to offer a way back. Nothing is sent anywhere. */
  var PEND='fnp-pending', notYet=document.getElementById('not-yet'), strip=document.getElementById('resume-strip'), lastMode='online';
  function setPending(){remember();try{localStorage.setItem(PEND,JSON.stringify({qty:qty,at:Date.now()}));}catch(e){}}
  function clearPending(){try{localStorage.removeItem(PEND);}catch(e){}notYet.hidden=true;strip.hidden=true;}
  function stopped(){
    setPending();
    var sw=document.getElementById('ny-switch');
    sw.textContent=lastMode==='cod'?'Pay online instead and save '+rupees(UPI_OFF[qty]):'Pay just '+rupees(ADVANCE)+' now, the rest on delivery';
    notYet.hidden=false;notYet.scrollIntoView({block:'center',behavior:'smooth'});
  }
  function choose(id){document.getElementById(id).checked=true;orderLink();}
  document.getElementById('ny-retry').addEventListener('click',function(){notYet.hidden=true;sendBtn.click();});
  document.getElementById('ny-switch').addEventListener('click',function(){notYet.hidden=true;choose(lastMode==='cod'?'pay-upi':'pay-cod');sendBtn.click();});
  document.getElementById('ny-wa').addEventListener('click',function(){notYet.hidden=true;choose('pay-wa');sendBtn.click();});
  document.getElementById('resume-x').addEventListener('click',clearPending);
  document.getElementById('resume-go').addEventListener('click',function(){strip.hidden=true;panel.hidden=false;render();window.scrollTo({top:Math.max(0,panel.getBoundingClientRect().top+window.pageYOffset-80),behavior:'smooth'});});
  /* Pincode: fill in the city and show the courier's estimated delivery date. Fails silently. */
  var pinNote=document.getElementById('pin-note'), cityAuto='', pinSeen='';
  function pinLookup(){
    var pin=F.pin.value.trim();
    if(!/^[1-9]\d{5}$/.test(pin)){pinSeen='';pinNote.hidden=true;return;}
    if(pin===pinSeen){return;}
    pinSeen=pin;
    fetch('/api/pincode?pin='+pin).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d||!d.ok||F.pin.value.trim()!==pin){return;}
      if(d.city&&(!F.city.value.trim()||F.city.value===cityAuto)){F.city.value=d.city;cityAuto=d.city;}
      var parts=[];
      if(d.city||d.state){parts.push([d.city,d.state].filter(Boolean).join(', '));}
      if(d.days){var by=new Date(addWorkingDays(new Date(),1).getTime());by.setDate(by.getDate()+d.days);if(by.getDay()===0){by.setDate(by.getDate()+1);}
        parts.push('estimated delivery by '+by.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'}));}
      if(parts.length){pinNote.textContent=parts.join(' · ');pinNote.hidden=false;}
      if(!err.hidden&&!orderProblem()){err.hidden=true;}
    }).catch(function(){});
  }
  F.pin.addEventListener('input',pinLookup);
  sendBtn.addEventListener('click',function(e){
    e.preventDefault();
    var p=orderProblem(), m=payMode();
    if(sendBtn.dataset.busy){return;}
    if(p){showProblem(p);return;}
    mark();
    if(m==='wa'){err.hidden=true;remember();clearPending();window.open(waOrderUrl(),'_blank','noopener');return;}
    payOnline(m==='cod');
  });
  document.getElementById('pay-wa').addEventListener('change',orderLink);
  document.getElementById('pay-upi').addEventListener('change',orderLink);
  document.getElementById('pay-cod').addEventListener('change',orderLink);
  document.getElementById('order-form').addEventListener('submit',function(e){e.preventDefault();});
  function buy(){panel.hidden=false;render();panel.scrollIntoView({block:'center',behavior:'smooth'});}
  document.getElementById('buy-main').addEventListener('click',buy);
  /* The floating button takes the customer to the pack choice first; the form opens just below it. */
  function buyFromBar(){
    var packs=document.querySelector('.packs');
    panel.hidden=false;render();goToForm=true;
    packs.classList.remove('nudge');void packs.offsetWidth;packs.classList.add('nudge');
    window.scrollTo({top:Math.max(0,packs.getBoundingClientRect().top+window.pageYOffset-90),behavior:'smooth'});
  }
  document.getElementById('buy-bar').addEventListener('click',buyFromBar);
  function show(){}
  document.getElementById('wa-chat').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello, I have a question about Fair N Pink Advance Radiance Cream.');
  document.getElementById('wa-help').href=document.getElementById('wa-chat').href;
  try{var saved=JSON.parse(localStorage.getItem(KEY)||'null');if(saved){Object.keys(F).forEach(function(k){if(typeof saved[k]==='string'){F[k].value=saved[k].slice(0,300);}});savedLine.hidden=false;}}catch(e){}
  try{var pend=JSON.parse(localStorage.getItem(PEND)||'null');
    if(pend&&PACKS[pend.qty]&&Date.now()-pend.at<7*86400000&&F.name.value){qty=pend.qty;document.getElementById('resume-text').textContent='Pack of '+qty+' · '+rupees(PACKS[qty].price)+' · your details are saved, so no typing this time.';strip.hidden=false;}
    else if(pend){localStorage.removeItem(PEND);}}catch(e){}
  render();
  pinLookup();
  /* Instagram films: one at a time on a dark stage, in Instagram's own player frame. Loaded only when the stage is about to be seen. */
  var reels=document.getElementById('reels');
  if(reels){
    var ids=reels.getAttribute('data-reels').split(','), at=0, slot=document.getElementById('reel-slot'), count=document.getElementById('reel-count'), ready=false;
    var showReel=function(){
      count.textContent=(at+1)+' / '+ids.length;
      if(!ready){return;}
      var f=document.createElement('iframe');
      f.src='https://www.instagram.com/reel/'+ids[at]+'/embed/';
      f.title='Fair N Pink film '+(at+1)+' of '+ids.length+', from Instagram';
      f.setAttribute('allow','autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share');
      f.setAttribute('allowfullscreen','');f.setAttribute('scrolling','no');f.setAttribute('frameborder','0');
      slot.textContent='';slot.appendChild(f);
    };
    var loadReels=function(){if(ready){return;}ready=true;showReel();};
    document.getElementById('reel-prev').addEventListener('click',function(){at=(at+ids.length-1)%ids.length;ready=true;showReel();});
    document.getElementById('reel-next').addEventListener('click',function(){at=(at+1)%ids.length;ready=true;showReel();});
    if('IntersectionObserver' in window){var io=new IntersectionObserver(function(en){if(en.some(function(e){return e.isIntersecting;})){io.disconnect();loadReels();}},{rootMargin:'600px'});io.observe(reels);}
    else{loadReels();}
  }
  var eta=document.getElementById('eta-line');
  function addWorkingDays(from,n){var d=new Date(from.getTime());while(n>0){d.setDate(d.getDate()+1);if(d.getDay()!==0){n=n-1;}}return d;}
  if(eta){var dispatch=addWorkingDays(new Date(),1),first=addWorkingDays(dispatch,3),last=addWorkingDays(dispatch,7),fmt={day:'numeric',month:'short'};
    eta.textContent='Order today: estimated delivery '+first.toLocaleDateString('en-IN',fmt)+' to '+last.toLocaleDateString('en-IN',fmt);}
})();
