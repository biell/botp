
document.addEventListener('DOMContentLoaded', function() {
  var style=document.getElementById('style');
  var theme=document.getElementById('theme');
  var name, period, save, erase;

  for(i=1; i<=5; i++) {
    name=document.getElementById('name'+i);
    period=document.getElementById('period'+i);
    save=document.getElementById('save'+i);
    erase=document.getElementById('erase'+i);

    if(localStorage['name'+i]) {
      name.value=localStorage['name'+i];
    }
    period.value=get_period(i);

    period.addEventListener('change', set_period);
    save.addEventListener('click', save_otp);
    erase.addEventListener('click', clear_otp);
  }

  theme.addEventListener('change', set_theme);

  theme.value=get_theme();

  style.href='theme-'+theme.value+'.css';
});

