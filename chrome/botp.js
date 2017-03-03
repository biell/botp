
function pack(hex) {
  var bin="";
  var i;

  for(i=0; i<hex.length; i+=2) {
    bin+=String.fromCharCode(parseInt(hex.substr(i, 2), 16));
  }

  return(bin);
}

function unpack(bin) {
  var hex="";
  var i;
  var c;

  for(i=0; i<bin.length; i++) {
    c=bin.charCodeAt(i);
    if(c<16) {
      hex+='0';
    }
    hex+=bin.charCodeAt(i).toString(16);
  }

  return(hex);
}

function set_pin(pin) {
  return(chrome.runtime.sendMessage({method: "setPin", pin: pin}));
}

function try_otp(event, i) {
  var pin=document.getElementById('pin');
  var tok=document.getElementById('tok');
  var title=document.getElementById('name');
  var meter=document.getElementById('meter');
  var otp=new TOTP();
  var name=localStorage['name'+i];
  var salt=localStorage['salt'+i];
  var secret=localStorage['secret'+i];
  var period=localStorage['period'+i];
  var clock=['&#x28F6;', '&#x28F4;', '&#x28F0', '&#x28B0', '&#x2830;', '&#x2810;'];
  var tick=period/6;
  var tock=Math.floor((new Date().getSeconds()+10)%period / tick);
  var hex;
   
  if(!secret || !salt || !period || !pin || pin.value.length<4) {
    tok.value='';
    title.innerHTML='&nbsp;';
    return(0);
  }

  salt=atob(salt);
  meter.innerHTML=clock[tock];

<<<<<<< HEAD
  hex=unpack(
    CryptoJS.AES.decrypt(secret, atob(salt)+pin.value).toString(CryptoJS.enc.Utf8));
=======
  try {
    hex=unpack(
      CryptoJS.AES.decrypt(secret, salt+pin.value).toString(CryptoJS.enc.Utf8));
  } catch(err) {
    tok.value='';
    title.innerHTML='&nbsp;';
    return(0);
  }
>>>>>>> 8cd5b1db889d77a0b0ee1ceaf66eec0686b74d66

  if(hex.length<40 || hex.match(/[^0-9a-fA-F]/)) {
    tok.value='';
  } else {
    tok.value=otp.getOTP(hex, period);
    if(event) {
      set_pin(pin.value);
    }
  }

  chrome.runtime.sendMessage({method: "getTimer"},
    function(time_left) {
      var pin=document.getElementById('pin');
      var tok=document.getElementById('tok');

      if(!time_left) {
        pin.value="";
        tok.value="";
	 }
    });

  pin.focus();

  if(tok.value) {
    title.innerHTML=name;
    return(period);
  } else {
    title.innerHTML='&nbsp;';
    return(0);
  }
}

function compute_otp(event) {
  var period;

  for(i=1; i<=5; i++) {
    period=try_otp(event, i);
    if(period>0) {
      return(period);
    }
  }

  return(0);
}


function copy_otp() {
  var pin=document.getElementById('pin');
  var tok=document.getElementById('tok');
  var popup=document.getElementById('popup1');

  tok.select();
  document.execCommand('copy', false, null);
  document.getSelection().removeAllRanges();

  popup.style.top=tok.offsetTop+"px";
  popup.style.left=tok.offsetLeft+"px";
  popup.style.visibility="visible";
  setTimeout(function(){popup.style.visibility="hidden"}, 600);

  pin.focus();
}

function load_pin() {
  chrome.runtime.sendMessage({method: "getPin"},
    function(response) { 
      var pin=document.getElementById('pin');
      pin.value=response;
      compute_otp();
    });
}

function get_period(i) {
  var period=localStorage['period'+i];

  if(i==0) {
    return(30);
  } else if(period == null) {
    localStorage.setItem('period'+i, 30);
    return(30);
  } else {
    return(period);
  }
}

function set_period(event) {
  var period=document.getElementById(event.target.id);

  localStorage.setItem(event.target.id, period.value);
}

function get_theme() {
  var theme=localStorage['theme'];

  if(theme == null) {
    localStorage.setItem('theme', 'default');
    return('default');
  } else {
    return(theme);
  }
}

function set_theme() {
  var theme=document.getElementById('theme');
  var style=document.getElementById('style');

  localStorage.setItem('theme', theme.value);
  style.href='theme-'+theme.value+'.css';
}

function random_string(size) {
  return(
    Array.apply(0, Array(size)).map(
      function() { return String.fromCharCode(Math.round(Math.random()*255)); }
    ).join("")
  );
}

function save_otp(event) {
  var i=event.target.value;
  var otp=new TOTP();
  var name=document.getElementById('name'+i);
  var pin=document.getElementById('pin'+i);
  var tok=document.getElementById('tok'+i);
  var salt=random_string(32);

  if(name.value) {
    localStorage.setItem('name'+i, name.value);
  }

  if(tok.value && pin.value) {
    if(tok.value.match(/[^0-9a-fA-F]/) && tok.value.length<35) {
      tok.value=otp.base32tohex(tok.value);
    }

    localStorage.setItem('salt'+i, btoa(salt));
    localStorage.setItem('secret'+i,
      CryptoJS.AES.encrypt(pack(tok.value), salt+pin.value));

  }

  pin.value='';
  tok.value='';
}

function clear_otp(event) {
  var i=event.target.value;
  var period=document.getElementById('period'+i);
  var name=document.getElementById('name'+i);

  localStorage.setItem('period'+i, 30);
  period.value=30;

  localStorage.removeItem('name'+i);
  name.value='';

  localStorage.removeItem('salt'+i);
  localStorage.removeItem('secret'+i);
}

document.addEventListener('DOMContentLoaded', function() {
  var secret=localStorage['secret'];
  var period=localStorage['period'];
  var salt=localStorage['salt'];

  if(secret) {
    localStorage.setItem('name1', 'default');
    localStorage.setItem('secret1', secret);
    localStorage.setItem('period1', period);
    localStorage.setItem('salt1', salt);

    localStorage.removeItem('secret');
    localStorage.removeItem('period');
    localStorage.removeItem('salt');
  }
});
