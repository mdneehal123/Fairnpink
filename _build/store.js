(function(){
  var WA_NUMBER='919980881230'; /* business WhatsApp number with country code, digits only, e.g. 9198XXXXXXXX */
  var ADS_SEND_TO='AW-18495856180/xokwCNXZgpIdELS8wfNE'; /* Google Ads conversion, e.g. AW-18495856180/AbCdEfGh. Empty = not tracked yet */
  var UPI_ID='mdneehal-2@okaxis';
  var UPI_NAME='mohammed nihal';
  var UPI_OFF={1:100,2:150,3:250};
  var RZP=false; /* true once the server reports that online payment is switched on */
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
    if(typeof orderLink==='function'){orderLink();}
    var msg='Hello, I want to order Fair N Pink Advance Radiance Cream.\n'+label+' - '+rupees(p.price)+'\nName: \nAddress and pincode: ';
    document.getElementById('wa-order').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
    packBtns.forEach(function(b){
      var on=Number(b.dataset.pack)===qty;
      b.classList.toggle('on',on); b.setAttribute('aria-checked',String(on));
      if(on){
        var src=b.querySelector('img').src;
        document.getElementById('media-photo').src=src;
      }
    });
  }
  packBtns.forEach(function(b){b.addEventListener('click',function(){qty=Number(b.dataset.pack);show('photo');render();});});
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
    var box=document.getElementById('upi-box'); box.hidden=!upi||RZP;
    if(!sendBtn.dataset.busy){sendBtn.textContent=(upi&&RZP)?'Pay '+rupees(total)+' securely':'Send order on WhatsApp';}
    if(upi){
      document.getElementById('upi-amt').textContent=rupees(total);
      var open=document.getElementById('upi-open'), idLine=document.getElementById('upi-id-line');
      var link='upi://pay?pa='+encodeURIComponent(UPI_ID)+'&pn='+encodeURIComponent(UPI_NAME)+'&am='+total+'.00&cu=INR&tn='+encodeURIComponent('Fair N Pink Pack of '+qty);
      open.href=link;
      idLine.innerHTML='Scan with any UPI app and enter <b></b> as the amount. UPI ID: <code></code>';
      idLine.querySelector('b').textContent=rupees(total);
      idLine.querySelector('code').textContent=UPI_ID;
    }
    var msg='New order: Fair N Pink Advance Radiance Cream\nPack of '+qty+'\nPayment: '+(upi?'UPI or Google Pay (paid, screenshot attached)':'Cash on Delivery')+'\nTotal: '+rupees(total)+'\n\nName: '+F.name.value.trim()+'\nMobile: '+F.phone.value.trim()+'\nAddress: '+F.address.value.trim()+'\nCity: '+F.city.value.trim()+'\nPincode: '+F.pin.value.trim();
    sendBtn.href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);
  }
  Object.keys(F).forEach(function(k){F[k].addEventListener('input',function(){orderLink();if(!err.hidden&&!orderProblem()){err.hidden=true;}});});
  function track(value,id){if(ADS_SEND_TO&&typeof gtag==='function'){gtag('event','conversion',{send_to:ADS_SEND_TO,value:value,currency:'INR',transaction_id:id});}}
  function fail(text){err.textContent=text;err.hidden=false;delete sendBtn.dataset.busy;orderLink();}
  function loadCheckout(done){
    if(window.Razorpay){done();return;}
    var s=document.createElement('script');s.src='https://checkout.razorpay.com/v1/checkout.js';
    s.onload=done;s.onerror=function(){fail('The payment window could not load. Please check your connection, or choose Cash on Delivery.');};
    document.head.appendChild(s);
  }
  function paid(paymentId,total,confirmed){
    track(total,paymentId);
    var msg='Paid order: Fair N Pink Advance Radiance Cream\nPack of '+qty+'\nPaid online: '+rupees(total)+'\nPayment ID: '+paymentId+'\n\nName: '+F.name.value.trim()+'\nMobile: '+F.phone.value.trim()+'\nAddress: '+F.address.value.trim()+'\nCity: '+F.city.value.trim()+'\nPincode: '+F.pin.value.trim();
    var form=document.getElementById('order-form'), box=document.createElement('div');
    box.setAttribute('role','status');
    var h=document.createElement('p'), b=document.createElement('b');b.textContent=confirmed?'Payment received. Thank you.':'Payment submitted. We are confirming it.';h.appendChild(b);
    var d=document.createElement('p');d.style.cssText='color:var(--muted);margin:6px 0 14px';d.textContent='Pack of '+qty+' · '+rupees(total)+' · Payment ID '+paymentId+'. We have your delivery details and will dispatch within 24 hours.';
    var a=document.createElement('a');a.className='btn';a.target='_blank';a.rel='noopener';a.href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(msg);a.textContent='Get updates on WhatsApp';
    a.style.cssText='display:flex;align-items:center;justify-content:center;text-decoration:none';
    box.appendChild(h);box.appendChild(d);box.appendChild(a);
    form.hidden=true;form.parentNode.insertBefore(box,form);
    var intro=panel.querySelectorAll('p')[1];if(intro){intro.hidden=true;}
    box.scrollIntoView({block:'center',behavior:'smooth'});
  }
  function payOnline(){
    var total=PACKS[qty].price-UPI_OFF[qty];
    err.hidden=true;sendBtn.dataset.busy='1';sendBtn.textContent='Opening secure payment…';
    fetch('/api/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pack:qty,name:F.name.value.trim(),phone:F.phone.value.trim(),address:F.address.value.trim(),city:F.city.value.trim(),pincode:F.pin.value.trim()})})
    .then(function(r){return r.ok?r.json():Promise.reject(r.status);})
    .then(function(o){
      loadCheckout(function(){
        var rz=new window.Razorpay({key:o.key_id,order_id:o.order_id,amount:o.amount,currency:o.currency,name:'Fair N Pink',description:'Advance Radiance Cream, Pack of '+qty,
          prefill:{name:F.name.value.trim(),contact:F.phone.value.replace(/\D/g,'').slice(-10)},theme:{color:'#231B1E'},
          handler:function(resp){
            fetch('/api/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(resp)})
            .then(function(r){return r.json();}).then(function(v){paid(resp.razorpay_payment_id,total,!!v.ok);})
            .catch(function(){paid(resp.razorpay_payment_id,total,false);});
          },
          modal:{ondismiss:function(){delete sendBtn.dataset.busy;orderLink();}}});
        rz.on('payment.failed',function(){fail('The payment did not go through. Nothing was charged if your bank shows no debit. Please try again or choose Cash on Delivery.');});
        rz.open();
      });
    })
    .catch(function(){fail('Online payment is not available right now. Please choose Cash on Delivery, or message us on WhatsApp.');});
  }
  sendBtn.addEventListener('click',function(e){
    var p=orderProblem(), upi=document.getElementById('pay-upi').checked;
    if(sendBtn.dataset.busy){e.preventDefault();return;}
    if(p){e.preventDefault();err.textContent=p;err.hidden=false;return;}
    if(RZP&&upi){e.preventDefault();payOnline();return;}
    orderLink();track(upi?PACKS[qty].price-UPI_OFF[qty]:PACKS[qty].price,'FNP-'+Date.now());
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
  if(window.fetch){fetch('/api/config').then(function(r){return r.ok?r.json():{};}).then(function(c){
    if(!c||!c.razorpay){return;}
    RZP=true;
    var lab=document.querySelector('label[for="pay-upi"] span');if(lab&&lab.firstChild){lab.firstChild.nodeValue='Pay online: UPI, cards, netbanking';}
    var up=document.getElementById('upi-line');if(up&&up.firstChild){up.firstChild.nodeValue='Pay online and save ';}
    var intro=panel.querySelectorAll('p')[1];if(intro){intro.textContent='Fill in your delivery details and choose how to pay. Online payments are processed securely by Razorpay.';}
    orderLink();
  }).catch(function(){});}
  var eta=document.getElementById('eta-line');
  function addWorkingDays(from,n){var d=new Date(from.getTime());while(n>0){d.setDate(d.getDate()+1);if(d.getDay()!==0){n=n-1;}}return d;}
  if(eta){var dispatch=addWorkingDays(new Date(),1),first=addWorkingDays(dispatch,3),last=addWorkingDays(dispatch,7),fmt={day:'numeric',month:'short'};
    eta.textContent='Order today: estimated delivery '+first.toLocaleDateString('en-IN',fmt)+' to '+last.toLocaleDateString('en-IN',fmt);}
})();
