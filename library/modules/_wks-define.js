var global         = require('./_global')
  , core           = require('./_core')
  , LIBRARY        = require('./_library')
  , wksExt         = require('./_wks-ext')
  , defineProperty = require('./_object-dp').f;
module.exports = function(name){
  var $Symbol = core.Symbol || (LIBRARY ? null : global.Symbol);
  if(name.charAt(0) != '_') {
    if($Symbol && !(name in $Symbol))defineProperty($Symbol, name, {value: wksExt.f(name)});
    else wksExt.f(name);
  }
};
