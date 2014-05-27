$define(STATIC, NUMBER, {
  /**
   * Alternatives:
   * http://mootools.net/docs/core/Types/Number#Number:toInt
   */
  toInteger: toInteger
});
$define(PROTO, NUMBER, {
  /**
   * Invoke function @ times and return array of results
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(fn /* = -> it */, that /* = undefined */){
    var number = toLength(this)
      , result = Array(number)
      , i      = 0;
    if(isFunction(fn))while(number > i)result[i] = fn.call(that, i, i++, this);
    else while(number > i)result[i] = i++;
    return result;
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(STATIC, 'Math', {
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  randomInt: function(a /* = 0 */, b /* = 0 */){
    a = toInteger(a);
    b = toInteger(b);
    var m = min(a, b);
    return floor((random() * (max(a, b) + 1 - m)) + m);
  }
});
/**
 * Math functions in Number.prototype
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
$define(PROTO, NUMBER, transform.call(
  // IE... getNames(Math)
  array(
    // ES3
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc,' +
    // Core.js
    'randomInt'
  ),
  function(memo, key){
    if(key in Math)memo[key] = (function(fn){
      return function(/*...args*/){
        // ie8- convert `this` to object -> convert it to number
        var args = [+this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return fn.apply(undefined, args);
      }
    })(Math[key])
  }, {}
));