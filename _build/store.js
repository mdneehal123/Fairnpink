(function(){
  var WA_NUMBER='919980881230'; /* business WhatsApp number with country code, digits only, e.g. 9198XXXXXXXX */
  var ADS_SEND_TO='AW-18495856180/xokwCNXZgpIdELS8wfNE'; /* Google Ads conversion, e.g. AW-18495856180/AbCdEfGh. Empty = not tracked yet */
  var UPI_ID='mdneehal-2@okaxis';
  var UPI_NAME='mohammed nihal';
  var UPI_OFF={1:100,2:150,3:250};
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
    var box=document.getElementById('upi-box'); box.hidden=!upi;
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
  sendBtn.addEventListener('click',function(e){var p=orderProblem();if(p){e.preventDefault();err.textContent=p;err.hidden=false;}else{orderLink();if(ADS_SEND_TO&&typeof gtag==='function'){var pk=PACKS[qty],up=document.getElementById('pay-upi').checked;gtag('event','conversion',{send_to:ADS_SEND_TO,value:up?pk.price-UPI_OFF[qty]:pk.price,currency:'INR',transaction_id:'FNP-'+Date.now()});}}});
  document.getElementById('pay-upi').addEventListener('change',orderLink);
  document.getElementById('pay-cod').addEventListener('change',orderLink);
  document.getElementById('order-form').addEventListener('submit',function(e){e.preventDefault();});
  function buy(){panel.hidden=false;render();panel.scrollIntoView({block:'center',behavior:'smooth'});}
  document.getElementById('buy-main').addEventListener('click',buy);
  document.getElementById('buy-bar').addEventListener('click',buy);
  function show(){}
  document.getElementById('wa-chat').href='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent('Hello, I have a question about Fair N Pink Advance Radiance Cream.');
  render();
  var eta=document.getElementById('eta-line');
  function addWorkingDays(from,n){var d=new Date(from.getTime());while(n>0){d.setDate(d.getDate()+1);if(d.getDay()!==0){n=n-1;}}return d;}
  if(eta){var dispatch=addWorkingDays(new Date(),1),first=addWorkingDays(dispatch,3),last=addWorkingDays(dispatch,7),fmt={day:'numeric',month:'short'};
    eta.textContent='Order today: estimated delivery '+first.toLocaleDateString('en-IN',fmt)+' to '+last.toLocaleDateString('en-IN',fmt);}
})();
