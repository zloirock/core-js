extendBuiltInObject(Number, {
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Number#Number:toInt
   */
  toInteger: toInteger
});
extendBuiltInObject($Number, {
  /**
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(fn, that /* = undefined */){
    var number = toLength(this)
      , result = Array(number)
      , i      = 0;
    if(isFunction(fn))while(number > i)result[i] = fn.call(that, i, i++, this);
    return result
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m
  },
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  rand: function(number /* = 0 */){
    var a = toInteger(this)
      , b = toInteger(number)
      , m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m)
  }
});
/**
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
extendBuiltInObject($Number, reduceTo.call(
  // IE...
  // getOwnPropertyNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,pow,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc'
  ),
  function(key){
    if(key in Math)this[key] = methodize.call(Math[key]);
  }
));