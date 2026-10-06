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
    document.getElementById('pay-cod-note').textContent='Pay '+rupees(ADVANCE)+' now, '+rupees(p.price-ADVANCE)+' on delivery';
    if(typeof orderLink==='function'){orderLink();}
    var msg='Hello, I want to order Fair N Pink Advance Radiance Cream.\n'+label+' - '+rupees(p.price)+'\nName: \nAddress and pincode: ';
    document.getElementById('wa-order').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
    packBtns.forEach(function(b){
      var on=Number(b.dataset.pack)===qty;
      b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on));
      if(on){
        var src=b.querySelector('img').src;
        var gp=document.getElementById('gthumb-pack');if(gp){gp.src=src;}
        if(packPhotoShown){document.getElementById('media-photo').src=src;}
      }
    });
  }
  var packPhotoShown=true, gthumbs=[].slice.call(document.querySelectorAll('.gthumb'));
  function pick(t){
    var main=document.getElementById('media-photo'), src=t.getAttribute('data-src');
    packPhotoShown=!src;
    main.src=src||document.getElementById('gthumb-pack').src;
    main.alt=t.getAttribute('data-alt');
    gthumbs.forEach(function(x){var on=x===t;x.classList.toggle('on',on);x.setAttribute('aria-pressed',String(on));});
  }
  gthumbs.forEach(function(t){t.addEventListener('click',function(){pick(t);});});
  packBtns.forEach(function(b){b.addEventListener('click',function(){qty=Number(b.dataset.pack);if(gthumbs.length){pick(gthumbs[0]);}render();});});
  var F={name:document.getElementById('of-name'),phone:document.getElementById('of-phone'),address:document.getElementById('of-address'),city:document.getElementById('of-city'),pin:document.getElementById('of-pin')};
  var sendBtn=document.getElementById('order-send'), err=document.getElementById('order-error');
  function orderProblem(){
    if(F.name.value.trim().length<2) return 'Please enter your full name.';
    if(F.phone.value.replace(/\D/g,'').length<10) return 'Please enter a 10-digit mobile number.';
    if(F.address.value.trim().length<8) return 'Please enter your full address.';
    if(F.city.value.trim().length<2) return 'Please enter your city.';
    if(!/^\d{6}$/.test(F.pin.value.trim())) return 'Please enter a 6-digit pincode.';
    return '';
  }
  function orderLink(){
    var p=PACKS[qty];
    var upi=document.getElementById('pay-upi').checked, total=upi?p.price-UPI_OFF[qty]:p.price;
    if(!sendBtn.dataset.busy){sendBtn.textContent=upi?'Pay '+rupees(total)+' securely':'Pay '+rupees(ADVANCE)+' to confirm order';}
    document.getElementById('cod-terms').hidden=upi;
  }
  Object.keys(F).forEach(function(k){F[k].addEventListener('input',function(){orderLink();if(!err.hidden&&!orderProblem()){err.hidden=true;}});});
  function track(value,id){if(ADS_SEND_TO&&typeof gtag==='function'){gtag('event','conversion',{send_to:ADS_SEND_TO,value:value,currency:'INR',transaction_id:id});}}
  function fail(text){err.textContent=text;err.hidden=false;delete sendBtn.dataset.busy;orderLink();}
  function loadCheckout(done){
    if(window.Razorpay){done();return;}
    var s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';
    s.onload=done;s.onerror=function(){fail('The payment window could not load. Please check your connection and try again, or message us on WhatsApp.');};
    document.head.appendChild(s);
  }
  function paid(paymentId,total,confirmed,balance){
    track(total,paymentId);
    var cod=balance>0;
    var msg=(cod?'Cash on Delivery order':'Paid order')+': Fair N Pink Advance Radiance Cream\nPack of '+qty+'\n'+(cod?'Advance paid: '+rupees(ADVANCE)+'\nTo pay on delivery: '+rupees(balance):'Paid online: '+rupees(total))+'\nPayment ID: '+paymentId+'\nTrack: https://fairnpink.in/track/?id='+paymentId+'\n\nName: '+F.name.value.trim()+'\nMobile: '+F.phone.value.trim()+'\nAddress: '+F.address.value.trim()+'\nCity: '+F.city.value.trim()+'\nPincode: '+F.pin.value.trim();
    var form=document.getElementById('order-form'), box=document.createElement('div');
    box.setAttribute('role','status');
    var h=document.createElement('p'), b=document.createElement('b');b.textContent=confirmed?(cod?'Order confirmed. Thank you.':'Payment received. Thank you.'):'Payment submitted. We are confirming it.';h.appendChild(b);
    var d=document.createElement('p');d.style.cssText='color:var(--muted);margin:6px 0 14px';
    d.textContent=cod?'Pack of '+qty+' · '+rupees(ADVANCE)+' received · '+rupees(balance)+' to pay in cash on delivery · Payment ID '+paymentId+'. We will dispatch within 24 hours.':'Pack of '+qty+' · '+rupees(total)+' · Payment ID '+paymentId+'. We have your delivery details and will dispatch within 24 hours.';
    var a=document.createElement('a');a.className='btn';a.target='_blank';a.rel='noopener';a.href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);a.textContent='Get updates on WhatsApp';
    a.style.cssText='display:flex;align-items:center;justify-content:center;text-decoration:none';
    var t=document.createElement('a');t.href='/track/?id='+encodeURIComponent(paymentId);t.textContent='Track this order';t.style.cssText='display:block;text-align:center;margin-top:14px;color:var(--ink);text-underline-offset:3px';
    box.appendChild(h);box.appendChild(d);box.appendChild(a);box.appendChild(t);
    form.hidden=true;form.parentNode.insertBefore(box,form);
    var intro=panel.querySelectorAll('p')[1];if(intro){intro.hidden=true;}
    box.scrollIntoView({block:'center',behavior:'smooth'});
  }
  function payOnline(advance){
    var total=advance?PACKS[qty].price:PACKS[qty].price-UPI_OFF[qty];
    err.hidden=true;sendBtn.dataset.busy='1';sendBtn.textContent='Opening secure payment…';
    fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pack:qty,mode:advance?'advance':'full',name:F.name.value.trim(),phone:F.phone.value.trim(),address:F.address.value.trim(),city:F.city.value.trim(),pincode:F.pin.value.trim()})})
    .then(function(r){return r.ok?r.json():Promise.reject(r.status);})
    .then(function(o){
      var balance=Number(o.balance)||0;
      loadCheckout(function(){
        var rz=new window.Razorpay({key:o.key_id,order_id:o.order_id,amount:o.amount,currency:o.currency,name:'Fair N Pink',description:'Advance Radiance Cream, Pack of '+qty+(advance?' (advance for Cash on Delivery)':''),
          prefill:{name:F.name.value.trim(),contact:F.phone.value.replace(/\D/g,'').slice(-10)},theme:{color:'#231B1E'},
          handler:function(resp){
            fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(resp)})
            .then(function(r){return r.json();}).then(function(v){paid(resp.razorpay_payment_id,total,!!v.ok,balance);})
            .catch(function(){paid(resp.razorpay_payment_id,total,false,balance);});
          },
          modal:{ondismiss:function(){delete sendBtn.dataset.busy;orderLink();}}});
        rz.on('payment.failed',function(){fail('The payment did not go through. Nothing was charged if your bank shows no debit. Please try again, or message us on WhatsApp.');});
        rz.open();
      });
    })
    .catch(function(){fail('Online payment is not available right now. Please try again in a few minutes, or message us on WhatsApp.');});
  }
  sendBtn.addEventListener('click',function(e){
    e.preventDefault();
    var p=orderProblem(), upi=document.getElementById('pay-upi').checked;
    if(sendBtn.dataset.busy){return;}
    if(p){err.textContent=p;err.hidden=false;return;}
    payOnline(!upi);
  });
  document.getElementById('pay-upi').addEventListener('change',orderLink);
  document.getElementById('pay-cod').addEventListener('change',orderLink);
  document.getElementById('order-form').addEventListener('submit',function(e){e.preventDefault();});
  function buy(){panel.hidden=false;render();panel.scrollIntoView({block:'center',behavior:'smooth'});}
  document.getElementById('buy-main').addEventListener('click',buy);
  document.getElementById('buy-bar').addEventListener('click',buy);
  function show(){}
  document.getElementById('wa-chat').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello, I have a question about Fair N Pink Advance Radiance Cream.');
  render();
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
