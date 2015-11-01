'use strict';
var $          = require('./$')
  , global     = require('./$.global')
  , has        = require('./$.has')
  , cof        = require('./$.cof')
  , isObject   = require('./$.is-object')
  , fails      = require('./$.fails')
  , NUMBER     = 'Number'
  , $Number    = global[NUMBER]
  , Base       = $Number
  , proto      = $Number.prototype
  // Opera ~12 has broken Object#toString
  , BROKEN_COF = cof($.create(proto)) == NUMBER;

// 7.1.1 ToPrimitive(input [, PreferredType]), currently - only "number" hint case
var toPrimitive = function(it){
  var fn, val;
  if(typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it)))return val;
  if(typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it)))return val;
  throw TypeError("Can't convert object to number");
};

// 7.1.3 ToNumber(argument)
var toNumber = function(it){
  if(isObject(it))it = toPrimitive(it);
  if(typeof it == 'string' && it.length > 2 && it.charCodeAt(0) == 48){
    var radix, maxCode;
    switch(it.charCodeAt(1)){
      case 66 : case 98  : radix = 2; maxCode = 49; break; // fast equal /^0b[01]+$/i
      case 79 : case 111 : radix = 8; maxCode = 55; break; // fast equal /^0o[0-7]+$/i
      default : return +it;
    }
    for(var digits = it.slice(2), i = 0, l = digits.length, code; i < l; i++){
      code = digits.charCodeAt(i);
      // parseInt parses a string to a first unavailable symbol
      // but ToNumber should return NaN if a string contains unavailable symbols
      if(code < 48 || code > maxCode)return NaN;
    } return parseInt(digits, radix);
  } return +it;
};

if(!($Number('0o1') && $Number('0b1'))){
  $Number = function Number(it){
    var that = this;
    return that instanceof $Number
      // check on 1..constructor(foo) case
      && (BROKEN_COF ? fails(function(){ proto.valueOf.call(that); }) : cof(that) != NUMBER)
        ? new Base(toNumber(it)) : toNumber(it);
  };
  $.each.call(require('./$.support-desc') ? $.getNames(Base) : (
    // ES3:
    'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY,' +
    // ES6 (in case, if modules with ES6 Number statics required before):
    'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,' +
    'MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
  ).split(','), function(key){
    if(has(Base, key) && !has($Number, key)){
      $.setDesc($Number, key, $.getDesc(Base, key));
    }
  });
  $Number.prototype = proto;
  proto.constructor = $Number;
  require('./$.redef')(global, NUMBER, $Number);
}