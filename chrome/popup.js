
document.addEventListener('DOMContentLoaded', function() {
  var pin=document.getElementById('pin');
  var tok=document.getElementById('tok');
  var meter=document.getElementById('meter');
  var style=document.getElementById('style');
  var theme=localStorage['theme'] || 'default';
  var period=localStorage['period'] || 'default';


  pin.addEventListener('input', compute_otp);
  tok.addEventListener('focus', copy_otp);

  meter.style.top=tok.offsetTop + "px";

  style.href='theme-'+theme+'.css';

  load_pin();
  compute_otp();
  setInterval(compute_otp, (period/6)*1000);
});

