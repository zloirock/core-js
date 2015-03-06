'use strict';
var $       = require('./$')
  , $def    = require('./$.def')
  , invoke  = require('./$.invoke')
  , ITER    = require('./$.uid').safe('iter')
  , $iter   = require('./$.iter')
  , step    = $iter.step
  , NUMBER  = 'Number'
  , methods = {};
function NumberIterator(iterated){
  $.set(this, ITER, {l: $.toLength(iterated), i: 0});
}
$iter.create(NumberIterator, NUMBER, function(){
  var iter = this[ITER]
    , i    = iter.i++;
  return i < iter.l ? step(0, i) : step(1);
});
$iter.define(Number, NUMBER, function(){
  return new NumberIterator(this);
});

methods.random = function(lim /* = 0 */){
  var a = +this
    , b = lim == undefined ? 0 : +lim
    , m = Math.min(a, b);
  return Math.random() * (Math.max(a, b) - m) + m;
};

$.each.call($.a(
    // ES3:
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6:
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ), function(key){
    var fn = Math[key];
    if(fn)methods[key] = function(/* ...args */){
      // ie9- dont support strict mode & convert `this` to object -> convert it to number
      var args = [+this]
        , i    = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return invoke(fn, args);
    }
  }
);

$def($def.P + $def.F, NUMBER, methods);