'use strict';
var $          = require('./$')
  , isObject   = $.isObject
  , isFunction = $.isFunction
  , NUMBER     = 'Number'
  , Number     = $.g[NUMBER]
  , Base       = Number
  , proto      = Number.prototype;
function toNumber(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var binary = false;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : binary = true;
      case 79 : case 111 : return parseInt(it.slice(2), binary ? 2 : 8);
    }
  } return +it;
}
function toPrimitive(it){
  var fn, val;
  if(isFunction(fn = it.valueOf) && !isObject(val = fn.call(it)))return val;
  if(isFunction(fn = it.toString) && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
}
if($.FW && !(Number('0o1') && Number('0b1'))){
  Number = function Number(it){
    return this instanceof Number ? new Base(toNumber(it)) : toNumber(it);
  }
  $.each.call($.DESC ? $.getNames(Base) : $.a(
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
      // ES6:
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ), function(key){
      if($.has(Base, key) && !$.has(Number, key))$.setDesc(Number, key, $.getDesc(Base, key));
  });
  Number.prototype = proto;
  proto.constructor = Number;
  $.hide($.g, NUMBER, Number);
}