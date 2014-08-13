$define(STATIC, NUMBER, {toInteger: toInteger});
$define(PROTO, NUMBER, {
  /**
   * Invoke function @ times and return array of results
   * Alternatives:
   * http://underscorejs.org/#times
   * http://sugarjs.com/api/Number/times
   * http://api.prototypejs.org/language/Number/prototype/times/
   * http://mootools.net/docs/core/Types/Number#Number:times
   */
  times: function(mapfn /* = -> it */, thisArg /* = undefined */){
    var number = +this
      , length = toLength(number)
      , result = Array(length)
      , i      = 0
      , f;
    if(isFunction(mapfn)){
      f = optionalBind(mapfn, thisArg);
      while(length > i)result[i] = f(i, i++, number);
    } else while(length > i)result[i] = i++;
    return result;
  },
  random: function(number /* = 0 */){
    var a = +this   || 0
      , b = +number || 0
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(STATIC, MATH, {
  /**
   * Alternatives:
   * http://underscorejs.org/#random
   * http://mootools.net/docs/core/Types/Number#Number:Number-random
   */
  randomInt: function(a /* = 0 */, b /* = 0 */){
    var x = toInteger(a)
      , y = toInteger(b)
      , m = min(x, y);
    return floor(random() * (max(x, y) + 1 - m) + m);
  }
});
/**
 * Math functions in Number.prototype
 * Alternatives:
 * http://sugarjs.com/api/Number/math
 * http://mootools.net/docs/core/Types/Number#Number-Math
 */
$define(PROTO, NUMBER, turn.call(
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
    if(key in Math)memo[key] = function(fn){
      return function(/*...args*/){
        // ie8- convert `this` to object -> convert it to number
        var args = [+this]
          , i    = 0;
        while(arguments.length > i)args.push(arguments[i++]);
        return invoke(fn, args);
      }
    }(Math[key])
  }, {}
));