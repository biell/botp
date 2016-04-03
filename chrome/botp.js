
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

function compute_otp(event) {
  var pin=document.getElementById('pin');
  var tok=document.getElementById('tok');
  var meter=document.getElementById('meter');
  var otp=new TOTP();
  var salt=atob(localStorage['salt']);
  var secret=localStorage['secret'];
  var period=localStorage['period'];
  var clock=['&#x28F6;', '&#x28F4;', '&#x28F0', '&#x28B0', '&#x2830;', '&#x2810;'];
  var tick=period/6;
  var tock=Math.floor((new Date().getSeconds()+10)%period / tick);
  var hex;
   
  meter.innerHTML=clock[tock];

  if(secret == undefined) {
    tok.value='No Secret';
    return(0);
  } else if(pin.value.length<4) {
    tok.value='';
    return(0);
  }

  hex=unpack(
    CryptoJS.AES.decrypt(secret, salt+pin.value).toString(CryptoJS.enc.Utf8));

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

function get_period() {
  var period=localStorage['period'];

  if(period == null) {
    localStorage.setItem('period', 30);
    return(30);
  } else {
    return(period);
  }
}

function set_period() {
  var period=document.getElementById('period');

  localStorage.setItem('period', period.value);
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

function save_otp() {
  var otp=new TOTP();
  var pin=document.getElementById('pin');
  var tok=document.getElementById('tok');
  var salt=random_string(32);

  if(tok.value.match(/[^0-9a-fA-F]/) && tok.value.length<35) {
    tok.value=otp.base32tohex(tok.value);
  }

  localStorage.setItem('salt', btoa(salt));
  localStorage.setItem('secret',
    CryptoJS.AES.encrypt(pack(tok.value), salt+pin.value));

  pin.value='';
  tok.value='';
}

function clear_otp() {
  localStorage.removeItem('salt');
  localStorage.removeItem('secret');
}

