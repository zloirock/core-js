'use strict';
var $ = require('./$');
if($.framework)Number('0o1') && Number('0b1') || function(Number, N, NumberProto){
  function toNumber(it){
    if($.isObject(it))it = toPrimitive(it);
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
    if($.isFunction(fn = it.valueOf) && !$.isObject(val = fn.call(it)))return val;
    if($.isFunction(fn = it.toString) && !$.isObject(val = fn.call(it)))return val;
    throw TypeError("Can't convert object to number");
  }
  Number = function Number(it){
    return this instanceof Number ? new N(toNumber(it)) : toNumber(it);
  }
  $.each.call($.DESC ? $.getNames(N) : $.a(
      // ES3:
      'MAX_VALUE,MIN_VALUE,NaN,NEGATIVE_INFINITY,POSITIVE_INFINITY' +
      // ES6:
      'EPSILON,isFinite,isInteger,isNaN,isSafeInteger,MAX_SAFE_INTEGER,MIN_SAFE_INTEGER,parseFloat,parseInt,isInteger'
    ), function(key){
      key in Number || $.setDesc(Number, key, $.getDesc(N, key));
  });
  Number.prototype = NumberProto;
  NumberProto.constructor = Number;
  $.hide($.g, 'Number', Number);
}(Number, Number, Number.prototype);