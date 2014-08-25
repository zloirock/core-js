// Number.toInteger was part of the draft ECMAScript 6 specification, but has been removed
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
  random: function(lim /* = 0 */){
    var a = +this
      , b = lim == undefined ? 0 : +lim
      , m = min(a, b);
    return random() * (max(a, b) - m) + m;
  }
});
$define(STATIC, MATH, {
  randomInt: function(lim1 /* = 0 */, lim2 /* = 0 */){
    var a = toInteger(lim1)
      , b = toInteger(lim2)
      , m = min(a, b);
    return floor(random() * (max(a, b) + 1 - m) + m);
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
    // ES3:
    'round,floor,ceil,abs,sin,asin,cos,acos,tan,atan,exp,sqrt,max,min,pow,atan2,' +
    // ES6:
    'acosh,asinh,atanh,cbrt,clz32,cosh,expm1,hypot,imul,log1p,log10,log2,sign,sinh,tanh,trunc,' +
    // Core:
    'randomInt'
  ),
  function(memo, key){
    var fn = Math[key];
    if(fn)memo[key] = function(/*...args*/){
      // ie8- convert `this` to object -> convert it to number
      var args = [+this]
        , i    = 0;
      while(arguments.length > i)args.push(arguments[i++]);
      return invoke(fn, args);
    }
  }, {}
));