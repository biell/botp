
document.addEventListener('DOMContentLoaded', function() {
  var save=document.getElementById('save');
  var erase=document.getElementById('erase');
  var period=document.getElementById('period');
  var style=document.getElementById('style');
  var theme=document.getElementById('theme');

  save.addEventListener('click', save_otp);
  erase.addEventListener('click', clear_otp);
  period.addEventListener('change', set_period);
  theme.addEventListener('change', set_theme);

  period.value=get_period();
  theme.value=get_theme();

  style.href='theme-'+theme.value+'.css';
});

