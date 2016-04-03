
var PIN="";
var TO=0;

function set_pin(pin) {
  var time=new Date().getTime();

  PIN=pin;
  TO=time;
}

function get_timer() {
  var time=new Date().getTime();

  return(TO==0 || time-TO < 120000);
}

function get_pin() {
  var time=new Date().getTime();

  if(!get_timer()) {
    PIN="";
    TO=time;
  }
  
  return(PIN);
}

chrome.runtime.onMessage.addListener(
  function(request, sender, response) {
    if(request.method == 'getPin') {
      return(response(get_pin()));
    } else if(request.method == 'setPin') {
      set_pin(request.pin);
      return(request.pin);
    } else if(request.method == 'getTimer') {
      return(response(get_timer()));
    }
  });

